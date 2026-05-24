package com.upi.mesh.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.upi.mesh.dto.request.PaymentRequest;
import com.upi.mesh.dto.response.MeshPacketResponse;
import com.upi.mesh.dto.response.TransactionResponse;
import com.upi.mesh.entity.*;
import com.upi.mesh.exception.BadRequestException;
import com.upi.mesh.exception.ResourceNotFoundException;
import com.upi.mesh.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final MeshPacketRepository meshPacketRepository;
    private final PacketAuditRepository packetAuditRepository;
    private final EncryptionService encryptionService;
    private final PasswordEncoder passwordEncoder;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Initiates a payment by creating an encrypted mesh packet.
     * The packet will propagate through the mesh network.
     */
    @Transactional
    public MeshPacketResponse initiatePayment(String senderUsername, PaymentRequest request) throws Exception {
        User sender = userRepository.findByUsername(senderUsername)
            .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        User receiver = userRepository.findByUpiId(request.getReceiverUpiId())
            .orElseThrow(() -> new ResourceNotFoundException("Receiver UPI ID not found: " + request.getReceiverUpiId()));

        if (sender.getId().equals(receiver.getId())) {
            throw new BadRequestException("Cannot send money to yourself");
        }

        Account senderAccount = accountRepository.findByUserId(sender.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Sender account not found"));

        // Verify UPI PIN
        if (!passwordEncoder.matches(request.getUpiPin(), senderAccount.getUpiPinHash())) {
            throw new BadRequestException("Invalid UPI PIN");
        }

        // Check balance
        if (senderAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BadRequestException("Insufficient balance");
        }

        // Build payment payload JSON
        String nonce = UUID.randomUUID().toString();
        Map<String, Object> payloadMap = new LinkedHashMap<>();
        payloadMap.put("senderUpiId", sender.getUpiId());
        payloadMap.put("receiverUpiId", receiver.getUpiId());
        payloadMap.put("amount", request.getAmount());
        payloadMap.put("nonce", nonce);
        payloadMap.put("timestamp", LocalDateTime.now().toString());
        payloadMap.put("note", request.getNote());

        String payloadJson = objectMapper.writeValueAsString(payloadMap);

        // Encrypt payload
        Map<String, String> encrypted = encryptionService.encryptPayload(payloadJson);
        String packetHash = encryptionService.computeHashHex(
            encrypted.get("encryptedPayload") + encrypted.get("iv")
        );

        // Check for duplicate
        if (meshPacketRepository.existsByPacketHash(packetHash)) {
            throw new BadRequestException("Duplicate packet detected");
        }

        // Create mesh packet
        MeshPacket packet = MeshPacket.builder()
            .packetHash(packetHash)
            .encryptedPayload(encrypted.get("encryptedPayload"))
            .encryptedAesKey(encrypted.get("encryptedAesKey"))
            .iv(encrypted.get("iv"))
            .senderUpiId(sender.getUpiId())
            .receiverUpiId(receiver.getUpiId())
            .ttl(10)
            .hopCount(0)
            .status(MeshPacket.PacketStatus.INJECTED)
            .tampered(false)
            .build();

        packet = meshPacketRepository.save(packet);

        // Create pending transaction
        Transaction transaction = Transaction.builder()
            .sender(sender)
            .receiver(receiver)
            .amount(request.getAmount())
            .transactionHash(packetHash)
            .nonce(nonce)
            .status(Transaction.TransactionStatus.PENDING)
            .meshPacketId(packet.getId())
            .senderUpiId(sender.getUpiId())
            .receiverUpiId(receiver.getUpiId())
            .build();

        transactionRepository.save(transaction);

        // Audit log
        saveAudit(packetHash, "ORIGIN", PacketAudit.AuditEventType.INJECTED,
            "Packet injected by " + sender.getUpiId(), 10, 0);

        // Broadcast via WebSocket
        messagingTemplate.convertAndSend("/topic/packets", buildPacketResponse(packet));
        log.info("Payment packet injected: {} from {} to {}", packetHash, sender.getUpiId(), receiver.getUpiId());

        return buildPacketResponse(packet);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getUserTransactions(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return transactionRepository.findAllByUserId(user.getId()).stream()
            .map(this::buildTransactionResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public BigDecimal getUserBalance(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Account account = accountRepository.findByUserId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        return account.getBalance();
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

    private MeshPacketResponse buildPacketResponse(MeshPacket p) {
        return MeshPacketResponse.builder()
            .id(p.getId())
            .packetHash(p.getPacketHash())
            .encryptedPayload(p.getEncryptedPayload())
            .encryptedAesKey(p.getEncryptedAesKey())
            .iv(p.getIv())
            .senderUpiId(p.getSenderUpiId())
            .receiverUpiId(p.getReceiverUpiId())
            .ttl(p.getTtl())
            .hopCount(p.getHopCount())
            .status(p.getStatus().name())
            .originDeviceId(p.getOriginDeviceId())
            .lastDeviceId(p.getLastDeviceId())
            .bridgeDeviceId(p.getBridgeDeviceId())
            .tampered(p.isTampered())
            .tamperReason(p.getTamperReason())
            .settledAt(p.getSettledAt())
            .createdAt(p.getCreatedAt())
            .build();
    }

    private TransactionResponse buildTransactionResponse(Transaction t) {
        return TransactionResponse.builder()
            .id(t.getId())
            .senderUpiId(t.getSenderUpiId())
            .receiverUpiId(t.getReceiverUpiId())
            .senderName(t.getSender().getFullName())
            .receiverName(t.getReceiver().getFullName())
            .amount(t.getAmount())
            .status(t.getStatus().name())
            .transactionHash(t.getTransactionHash())
            .meshPacketId(t.getMeshPacketId())
            .propagationHops(t.getPropagationHops())
            .settlementTime(t.getSettlementTime())
            .createdAt(t.getCreatedAt())
            .failureReason(t.getFailureReason())
            .build();
    }
}
