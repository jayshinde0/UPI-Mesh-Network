package com.upi.mesh.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "settlement_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SettlementLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mesh_packet_id")
    private MeshPacket meshPacket;

    @Column(name = "packet_hash", nullable = false, length = 64)
    private String packetHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SettlementStatus status;

    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "sender_upi_id", length = 50)
    private String senderUpiId;

    @Column(name = "receiver_upi_id", length = 50)
    private String receiverUpiId;

    @Column(name = "bridge_device_id", length = 50)
    private String bridgeDeviceId;

    @Column(name = "hop_count")
    private Integer hopCount;

    @Column(name = "message", length = 1000)
    private String message;

    @Column(name = "processing_time_ms")
    private Long processingTimeMs;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum SettlementStatus {
        SUCCESS, DUPLICATE, TAMPERED, FAILED, INSUFFICIENT_BALANCE
    }
}
