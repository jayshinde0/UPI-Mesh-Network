package com.upi.mesh.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DeviceResponse {
    private String id;
    private String deviceName;
    private String deviceId;
    private String deviceType;
    private boolean online;
    private boolean bridge;
    private Integer signalStrength;
    private Integer packetsRelayed;
    private Integer packetsSettled;
    private Double xPosition;
    private Double yPosition;
    private LocalDateTime lastSeen;
    private LocalDateTime createdAt;
}
