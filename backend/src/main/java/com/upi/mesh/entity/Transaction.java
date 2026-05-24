package com.upi.mesh.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_transaction_hash", columnList = "transaction_hash"),
    @Index(name = "idx_sender_id", columnList = "sender_id"),
    @Index(name = "idx_receiver_id", columnList = "receiver_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "transaction_hash", unique = true, nullable = false, length = 64)
    private String transactionHash;

    @Column(name = "nonce", nullable = false, length = 64)
    private String nonce;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.PENDING;

    @Column(name = "mesh_packet_id")
    private String meshPacketId;

    @Column(name = "settlement_time")
    private LocalDateTime settlementTime;

    @Column(name = "propagation_hops")
    @Builder.Default
    private Integer propagationHops = 0;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "sender_upi_id", length = 50)
    private String senderUpiId;

    @Column(name = "receiver_upi_id", length = 50)
    private String receiverUpiId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum TransactionStatus {
        PENDING, PROPAGATING, SETTLED, FAILED, DUPLICATE, TAMPERED
    }
}
