package com.upi.mesh.service;

import com.upi.mesh.entity.*;
import com.upi.mesh.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Simulates Bluetooth-style mesh network gossip protocol.
 * Packets propagate through relay nodes with TTL decrement.
 * Bridge nodes with internet connectivity trigger settlement.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MeshSimulatorService {

    private final MeshPacketRepository meshPacketRepository;
    private final DeviceRepository deviceRepository;
    private final PacketAuditRepository packetAuditRepository;
    private final SettlementService settlementService;
    private final SimpMessagingTemplate messagingTemplate;

    private static final int GOSSIP_FANOUT = 3;
    private static final Random RANDOM = new Random();

    /**
     * Runs gossip protocol every 2 seconds for active packets.
     */
    @Scheduled(fixedDelay = 2000)
    @Transactional
    public void runGossipRound() {
        List<MeshPacket> activePackets = meshPacketRepository.findActivePropagatingPackets();
        if (activePackets.isEmpty()) return;

        List<Device> onlineDevices = deviceRepository.findByOnlineTrue();
        List<Device> bridgeDevices = deviceRepository.findByBridgeTrueAndOnlineTrue();

        for (MeshPacket packet : activePackets) {
            propagatePacket(packet, onlineDevices, bridgeDevices);
        }
    }

    /**
     * Propagates a single packet through the mesh using gossip protocol.
     */
    @Transactional
    public void propagatePacket(MeshPacket packet, List<Device> onlineDevices, List<Device> bridgeDevices) {
        if (packet.getTtl() <= 0) {
            packet.setStatus(MeshPacket.PacketStatus.EXPIRED);
            meshPacketRepository.save(packet);
            saveAudit(packet.getPacketHash(), "SYSTEM", PacketAudit.AuditEventType.TTL_EXPIRED,
                "TTL expired", 0, packet.getHopCount());
            messagingTemplate.convertAndSend("/topic/packets", Map.of(
                "packetId", packet.getId(), "status", "EXPIRED", "hash", packet.getPacketHash()
            ));
            return;
        }

        // Select random relay devices (gossip fanout)
        List<Device> relays = selectRandomDevices(onlineDevices, GOSSIP_FANOUT);

        for (Device relay : relays) {
            relay.setPacketsRelayed(relay.getPacketsRelayed() + 1);
            relay.setLastSeen(LocalDateTime.now());
            deviceRepository.save(relay);

            saveAudit(packet.getPacketHash(), relay.getDeviceId(), PacketAudit.AuditEventType.RELAYED,
                "Relayed via " + relay.getDeviceName(), packet.getTtl(), packet.getHopCount());

            // Broadcast propagation event
            messagingTemplate.convertAndSend("/topic/propagation", Map.of(
                "packetId", packet.getId(),
                "packetHash", packet.getPacketHash(),
                "fromDevice", packet.getLastDeviceId() != null ? packet.getLastDeviceId() : "ORIGIN",
                "toDevice", relay.getDeviceId(),
                "ttl", packet.getTtl(),
                "hop", packet.getHopCount()
            ));
        }

        // Decrement TTL, increment hop
        packet.setTtl(packet.getTtl() - 1);
        packet.setHopCount(packet.getHopCount() + 1);
        packet.setStatus(MeshPacket.PacketStatus.PROPAGATING);
        if (!relays.isEmpty()) {
            packet.setLastDeviceId(relays.get(0).getDeviceId());
        }

        // Check if any bridge device is in range (random chance)
        if (!bridgeDevices.isEmpty() && RANDOM.nextDouble() < 0.3) {
            Device bridge = bridgeDevices.get(RANDOM.nextInt(bridgeDevices.size()));
            packet.setStatus(MeshPacket.PacketStatus.BRIDGE_RECEIVED);
            packet.setBridgeDeviceId(bridge.getDeviceId());
            meshPacketRepository.save(packet);

            saveAudit(packet.getPacketHash(), bridge.getDeviceId(), PacketAudit.AuditEventType.BRIDGE_RECEIVED,
                "Received by bridge: " + bridge.getDeviceName(), packet.getTtl(), packet.getHopCount());

            messagingTemplate.convertAndSend("/topic/bridge", Map.of(
                "packetId", packet.getId(),
                "bridgeDevice", bridge.getDeviceId(),
                "bridgeName", bridge.getDeviceName()
            ));

            // Trigger settlement
            settlementService.settlePacket(packet.getId(), bridge.getDeviceId());
            bridge.setPacketsSettled(bridge.getPacketsSettled() + 1);
            deviceRepository.save(bridge);
        } else {
            meshPacketRepository.save(packet);
        }
    }

    /**
     * Injects a new packet into the mesh for simulation.
     */
    @Transactional
    public MeshPacket injectPacketIntoMesh(String packetId) {
        MeshPacket packet = meshPacketRepository.findById(packetId)
            .orElseThrow(() -> new RuntimeException("Packet not found"));
        packet.setStatus(MeshPacket.PacketStatus.PROPAGATING);
        packet.setTtl(10);
        packet.setHopCount(0);
        return meshPacketRepository.save(packet);
    }

    /**
     * Simulates packet tampering for demo purposes.
     */
    @Transactional
    public MeshPacket simulateTampering(String packetId) {
        MeshPacket packet = meshPacketRepository.findById(packetId)
            .orElseThrow(() -> new RuntimeException("Packet not found"));
        packet.setTampered(true);
        packet.setTamperReason("Payload modified by malicious relay node");
        packet.setEncryptedPayload(packet.getEncryptedPayload() + "TAMPERED");
        packet.setStatus(MeshPacket.PacketStatus.TAMPERED);
        meshPacketRepository.save(packet);

        messagingTemplate.convertAndSend("/topic/tamper", Map.of(
            "packetId", packet.getId(),
            "hash", packet.getPacketHash(),
            "reason", "Payload modified by malicious relay node"
        ));

        return packet;
    }

    /**
     * Resets the entire mesh simulation.
     */
    @Transactional
    public void resetMesh() {
        List<MeshPacket> propagating = meshPacketRepository.findByStatusOrderByCreatedAtDesc(
            MeshPacket.PacketStatus.PROPAGATING);
        propagating.forEach(p -> {
            p.setStatus(MeshPacket.PacketStatus.EXPIRED);
            meshPacketRepository.save(p);
        });

        List<Device> devices = deviceRepository.findAll();
        devices.forEach(d -> {
            d.setOnline(RANDOM.nextBoolean());
            d.setLastSeen(LocalDateTime.now());
            deviceRepository.save(d);
        });

        messagingTemplate.convertAndSend("/topic/mesh-reset", Map.of("status", "RESET", "timestamp", LocalDateTime.now().toString()));
        log.info("Mesh simulation reset");
    }

    /**
     * Flushes all bridge nodes (brings them online).
     */
    @Transactional
    public void flushBridgeNodes() {
        List<Device> bridges = deviceRepository.findByBridgeTrue();
        bridges.forEach(b -> {
            b.setOnline(true);
            b.setLastSeen(LocalDateTime.now());
            deviceRepository.save(b);
        });
        messagingTemplate.convertAndSend("/topic/devices", deviceRepository.findAll());
        log.info("Bridge nodes flushed - all online");
    }

    private List<Device> selectRandomDevices(List<Device> devices, int count) {
        if (devices.isEmpty()) return Collections.emptyList();
        List<Device> shuffled = new ArrayList<>(devices);
        Collections.shuffle(shuffled);
        return shuffled.subList(0, Math.min(count, shuffled.size()));
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
