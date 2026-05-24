package com.upi.mesh.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "packet_audits")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PacketAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "packet_hash", nullable = false, length = 64)
    private String packetHash;

    @Column(name = "device_id", length = 50)
    private String deviceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private AuditEventType eventType;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "ttl_at_event")
    private Integer ttlAtEvent;

    @Column(name = "hop_at_event")
    private Integer hopAtEvent;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum AuditEventType {
        INJECTED, RELAYED, BRIDGE_RECEIVED, SETTLED, DUPLICATE_DETECTED,
        TAMPER_DETECTED, TTL_EXPIRED, DECRYPTION_FAILED
    }
}
