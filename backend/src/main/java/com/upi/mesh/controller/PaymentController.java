package com.upi.mesh.controller;

import com.upi.mesh.dto.request.PaymentRequest;
import com.upi.mesh.dto.response.ApiResponse;
import com.upi.mesh.dto.response.MeshPacketResponse;
import com.upi.mesh.dto.response.TransactionResponse;
import com.upi.mesh.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment and transaction endpoints")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/send")
    @Operation(summary = "Send money via mesh network")
    public ResponseEntity<ApiResponse<MeshPacketResponse>> sendPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PaymentRequest request) throws Exception {
        MeshPacketResponse response = paymentService.initiatePayment(
            userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment packet injected into mesh"));
    }

    @GetMapping("/transactions")
    @Operation(summary = "Get user transaction history")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactions(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<TransactionResponse> transactions = paymentService.getUserTransactions(
            userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    @GetMapping("/balance")
    @Operation(summary = "Get current balance")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> getBalance(
            @AuthenticationPrincipal UserDetails userDetails) {
        BigDecimal balance = paymentService.getUserBalance(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(Map.of("balance", balance)));
    }
}
