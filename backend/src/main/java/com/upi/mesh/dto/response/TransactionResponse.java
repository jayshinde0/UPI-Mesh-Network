package com.upi.mesh.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TransactionResponse {
    private String id;
    private String senderUpiId;
    private String receiverUpiId;
    private String senderName;
    private String receiverName;
    private BigDecimal amount;
    private String status;
    private String transactionHash;
    private String meshPacketId;
    private Integer propagationHops;
    private LocalDateTime settlementTime;
    private LocalDateTime createdAt;
    private String failureReason;
}
