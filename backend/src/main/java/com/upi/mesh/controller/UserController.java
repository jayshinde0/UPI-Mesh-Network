package com.upi.mesh.controller;

import com.upi.mesh.dto.response.ApiResponse;
import com.upi.mesh.dto.response.UserResponse;
import com.upi.mesh.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile endpoints")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponse response = userService.getUserProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/upi/{upiId}")
    @Operation(summary = "Look up user by UPI ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByUpiId(@PathVariable String upiId) {
        UserResponse response = userService.getUserByUpiId(upiId);
        // Mask sensitive data for public lookup
        response.setAccountNumber(null);
        response.setBalance(null);
        response.setEmail(null);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
