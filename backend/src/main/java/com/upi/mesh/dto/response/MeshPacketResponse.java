package com.upi.mesh.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MeshPacketResponse {
    private String id;
    private String packetHash;
    private String encryptedPayload;
    private String encryptedAesKey;
    private String iv;
    private String senderUpiId;
    private String receiverUpiId;
    private Integer ttl;
    private Integer hopCount;
    private String status;
    private String originDeviceId;
    private String lastDeviceId;
    private String bridgeDeviceId;
    private boolean tampered;
    private String tamperReason;
    private LocalDateTime settledAt;
    private LocalDateTime createdAt;
}
