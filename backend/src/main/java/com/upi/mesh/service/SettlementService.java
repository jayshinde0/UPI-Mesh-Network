package com.upi.mesh.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.upi.mesh.entity.*;
import com.upi.mesh.exception.BadRequestException;
import com.upi.mesh.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Settlement engine: handles debit/credit with optimistic locking,
 * idempotency via Redis SETNX, and tamper detection.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SettlementService {

    private static final String SETTLEMENT_KEY_PREFIX = "settlement:";
    private static final long SETTLEMENT_TTL_HOURS = 24;

    private final MeshPacketRepository meshPacketRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final SettlementLogRepository settlementLogRepository;
    private final PacketAuditRepository packetAuditRepository;
    private final EncryptionService encryptionService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Settles a mesh packet received by a bridge node.
     * Uses Redis SETNX for idempotency and optimistic locking for balance updates.
     */
    @Transactional
    public SettlementLog settlePacket(String packetId, String bridgeDeviceId) {
        long startTime = System.currentTimeMillis();

        MeshPacket packet = meshPacketRepository.findById(packetId)
            .orElseThrow(() -> new BadRequestException("Packet not found: " + packetId));

        String redisKey = SETTLEMENT_KEY_PREFIX + packet.getPacketHash();

        // Idempotency check via Redis SETNX
        Boolean isNew = redisTemplate.opsForValue()
            .setIfAbsent(redisKey, "PROCESSING", SETTLEMENT_TTL_HOURS, TimeUnit.HOURS);

        if (Boolean.FALSE.equals(isNew)) {
            log.warn("Duplicate settlement attempt for packet: {}", packet.getPacketHash());
            return createSettlementLog(packet, null, SettlementLog.SettlementStatus.DUPLICATE,
                "Duplicate packet - already processed", bridgeDeviceId, startTime);
        }

        // Check if already settled in DB
        if (packet.getStatus() == MeshPacket.PacketStatus.SETTLED ||
            packet.getStatus() == MeshPacket.PacketStatus.DUPLICATE) {
            redisTemplate.delete(redisKey);
            return createSettlementLog(packet, null, SettlementLog.SettlementStatus.DUPLICATE,
                "Packet already settled", bridgeDeviceId, startTime);
        }

        // Tamper check
        if (packet.isTampered()) {
            packet.setStatus(MeshPacket.PacketStatus.TAMPERED);
            meshPacketRepository.save(packet);
            return createSettlementLog(packet, null, SettlementLog.SettlementStatus.TAMPERED,
                "Packet tampered: " + packet.getTamperReason(), bridgeDeviceId, startTime);
        }

        try {
            // Decrypt and parse payload
            String decryptedJson = encryptionService.decryptPayload(
                packet.getEncryptedPayload(), packet.getEncryptedAesKey(), packet.getIv()
            );

            Map<String, Object> payload = objectMapper.readValue(decryptedJson, Map.class);
            String senderUpiId = (String) payload.get("senderUpiId");
            String receiverUpiId = (String) payload.get("receiverUpiId");
            BigDecimal amount = new BigDecimal(payload.get("amount").toString());

            // Verify hash integrity
            String expectedHash = encryptionService.computeHashHex(
                packet.getEncryptedPayload() + packet.getIv()
            );
            if (!expectedHash.equals(packet.getPacketHash())) {
                packet.setTampered(true);
                packet.setTamperReason("Hash mismatch - packet integrity compromised");
                packet.setStatus(MeshPacket.PacketStatus.TAMPERED);
                meshPacketRepository.save(packet);
                return createSettlementLog(packet, null, SettlementLog.SettlementStatus.TAMPERED,
                    "Hash mismatch detected", bridgeDeviceId, startTime);
            }

            // Get accounts with optimistic locking
            Account senderAccount = accountRepository.findByUserUpiId(senderUpiId)
                .orElseThrow(() -> new BadRequestException("Sender account not found"));
            Account receiverAccount = accountRepository.findByUserUpiId(receiverUpiId)
                .orElseThrow(() -> new BadRequestException("Receiver account not found"));

            // Balance check
            if (senderAccount.getBalance().compareTo(amount) < 0) {
                packet.setStatus(MeshPacket.PacketStatus.EXPIRED);
                meshPacketRepository.save(packet);
                return createSettlementLog(packet, null, SettlementLog.SettlementStatus.INSUFFICIENT_BALANCE,
                    "Insufficient balance", bridgeDeviceId, startTime);
            }

            // Debit sender, credit receiver
            senderAccount.setBalance(senderAccount.getBalance().subtract(amount));
            receiverAccount.setBalance(receiverAccount.getBalance().add(amount));
            accountRepository.save(senderAccount);
            accountRepository.save(receiverAccount);

            // Update packet status
            packet.setStatus(MeshPacket.PacketStatus.SETTLED);
            packet.setBridgeDeviceId(bridgeDeviceId);
            packet.setSettledAt(LocalDateTime.now());
            meshPacketRepository.save(packet);

            // Update transaction
            transactionRepository.findByTransactionHash(packet.getPacketHash()).ifPresent(tx -> {
                tx.setStatus(Transaction.TransactionStatus.SETTLED);
                tx.setSettlementTime(LocalDateTime.now());
                tx.setPropagationHops(packet.getHopCount());
                transactionRepository.save(tx);
            });

            // Audit
            saveAudit(packet.getPacketHash(), bridgeDeviceId, PacketAudit.AuditEventType.SETTLED,
                "Settled ₹" + amount + " from " + senderUpiId + " to " + receiverUpiId,
                packet.getTtl(), packet.getHopCount());

            SettlementLog log2 = createSettlementLog(packet, amount, SettlementLog.SettlementStatus.SUCCESS,
                "Settlement successful", bridgeDeviceId, startTime);

            // Broadcast live update
            messagingTemplate.convertAndSend("/topic/settlements", log2);
            messagingTemplate.convertAndSend("/topic/balance/" + senderUpiId, senderAccount.getBalance());
            messagingTemplate.convertAndSend("/topic/balance/" + receiverUpiId, receiverAccount.getBalance());

            log.info("Packet settled: {} amount: ₹{}", packet.getPacketHash(), amount);
            return log2;

        } catch (Exception e) {
            redisTemplate.delete(redisKey);
            log.error("Settlement failed for packet {}: {}", packetId, e.getMessage());
            packet.setStatus(MeshPacket.PacketStatus.EXPIRED);
            meshPacketRepository.save(packet);
            return createSettlementLog(packet, null, SettlementLog.SettlementStatus.FAILED,
                "Settlement error: " + e.getMessage(), bridgeDeviceId, startTime);
        }
    }

    private SettlementLog createSettlementLog(MeshPacket packet, BigDecimal amount,
                                               SettlementLog.SettlementStatus status,
                                               String message, String bridgeDeviceId, long startTime) {
        SettlementLog log = SettlementLog.builder()
            .meshPacket(packet)
            .packetHash(packet.getPacketHash())
            .status(status)
            .amount(amount)
            .senderUpiId(packet.getSenderUpiId())
            .receiverUpiId(packet.getReceiverUpiId())
            .bridgeDeviceId(bridgeDeviceId)
            .hopCount(packet.getHopCount())
            .message(message)
            .processingTimeMs(System.currentTimeMillis() - startTime)
            .build();
        return settlementLogRepository.save(log);
    }

    private void saveAudit(String hash, String deviceId, PacketAudit.AuditEventType type,
                           String details, int ttl, int hop) {
        PacketAudit audit = PacketAudit.builder()
            .packetHash(hash)
            .deviceId(deviceId)
            .eventType(type)
            .details(details)
            .ttlAtEvent(ttl)
            .hopAtEvent(hop)
            .build();
        packetAuditRepository.save(audit);
    }
}
