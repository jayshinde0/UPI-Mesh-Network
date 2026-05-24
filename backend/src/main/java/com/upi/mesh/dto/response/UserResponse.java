package com.upi.mesh.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String upiId;
    private String role;
    private boolean active;
    private BigDecimal balance;
    private String accountNumber;
    private LocalDateTime createdAt;
}
