package com.upi.mesh.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "mesh_packets", indexes = {
    @Index(name = "idx_packet_hash", columnList = "packet_hash"),
    @Index(name = "idx_packet_status", columnList = "status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MeshPacket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "packet_hash", unique = true, nullable = false, length = 64)
    private String packetHash;

    @Column(name = "encrypted_payload", nullable = false, columnDefinition = "TEXT")
    private String encryptedPayload;

    @Column(name = "encrypted_aes_key", nullable = false, columnDefinition = "TEXT")
    private String encryptedAesKey;

    @Column(name = "iv", nullable = false, length = 64)
    private String iv;

    @Column(name = "sender_upi_id", nullable = false, length = 50)
    private String senderUpiId;

    @Column(name = "receiver_upi_id", nullable = false, length = 50)
    private String receiverUpiId;

    @Column(name = "ttl", nullable = false)
    @Builder.Default
    private Integer ttl = 10;

    @Column(name = "hop_count")
    @Builder.Default
    private Integer hopCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PacketStatus status = PacketStatus.INJECTED;

    @Column(name = "origin_device_id", length = 50)
    private String originDeviceId;

    @Column(name = "last_device_id", length = 50)
    private String lastDeviceId;

    @Column(name = "bridge_device_id", length = 50)
    private String bridgeDeviceId;

    @Column(name = "is_tampered")
    @Builder.Default
    private boolean tampered = false;

    @Column(name = "tamper_reason", length = 500)
    private String tamperReason;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum PacketStatus {
        INJECTED, PROPAGATING, BRIDGE_RECEIVED, SETTLED, DUPLICATE, TAMPERED, EXPIRED
    }
}
