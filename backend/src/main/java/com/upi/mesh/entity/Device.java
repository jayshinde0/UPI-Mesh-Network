package com.upi.mesh.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "devices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "device_name", nullable = false, length = 100)
    private String deviceName;

    @Column(name = "device_id", unique = true, nullable = false, length = 50)
    private String deviceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "device_type", nullable = false)
    @Builder.Default
    private DeviceType deviceType = DeviceType.RELAY;

    @Column(name = "is_online")
    @Builder.Default
    private boolean online = false;

    @Column(name = "is_bridge")
    @Builder.Default
    private boolean bridge = false;

    @Column(name = "signal_strength")
    @Builder.Default
    private Integer signalStrength = 80;

    @Column(name = "packets_relayed")
    @Builder.Default
    private Integer packetsRelayed = 0;

    @Column(name = "packets_settled")
    @Builder.Default
    private Integer packetsSettled = 0;

    @Column(name = "x_position")
    private Double xPosition;

    @Column(name = "y_position")
    private Double yPosition;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum DeviceType {
        ORIGIN, RELAY, BRIDGE
    }
}
