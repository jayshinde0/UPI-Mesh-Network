package com.upi.mesh.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {

    @NotBlank(message = "Receiver UPI ID is required")
    private String receiverUpiId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Minimum amount is ₹1")
    @DecimalMax(value = "100000.00", message = "Maximum amount is ₹1,00,000")
    private BigDecimal amount;

    @NotBlank(message = "UPI PIN is required")
    @Pattern(regexp = "^\\d{4,6}$", message = "UPI PIN must be 4-6 digits")
    private String upiPin;

    private String note;
}
