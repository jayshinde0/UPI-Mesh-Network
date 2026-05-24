package com.upi.mesh.controller;

import com.upi.mesh.dto.response.ApiResponse;
import com.upi.mesh.dto.response.UserResponse;
import com.upi.mesh.entity.MeshPacket;
import com.upi.mesh.entity.SettlementLog;
import com.upi.mesh.repository.MeshPacketRepository;
import com.upi.mesh.repository.SettlementLogRepository;
import com.upi.mesh.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin-only management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final UserService userService;
    private final MeshPacketRepository meshPacketRepository;
    private final SettlementLogRepository settlementLogRepository;

    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @PostMapping("/users/{userId}/toggle")
    @Operation(summary = "Toggle user active status")
    public ResponseEntity<ApiResponse<String>> toggleUser(@PathVariable String userId) {
        userService.toggleUserStatus(userId);
        return ResponseEntity.ok(ApiResponse.success("Status toggled"));
    }

    @GetMapping("/packets")
    @Operation(summary = "Get all mesh packets")
    public ResponseEntity<ApiResponse<List<MeshPacket>>> getAllPackets() {
        return ResponseEntity.ok(ApiResponse.success(
            meshPacketRepository.findAllOrderByCreatedAtDesc()));
    }

    @GetMapping("/packets/tampered")
    @Operation(summary = "Get tampered packets")
    public ResponseEntity<ApiResponse<List<MeshPacket>>> getTamperedPackets() {
        return ResponseEntity.ok(ApiResponse.success(
            meshPacketRepository.findByStatusOrderByCreatedAtDesc(MeshPacket.PacketStatus.TAMPERED)));
    }

    @GetMapping("/packets/duplicate")
    @Operation(summary = "Get duplicate packets")
    public ResponseEntity<ApiResponse<List<MeshPacket>>> getDuplicatePackets() {
        return ResponseEntity.ok(ApiResponse.success(
            meshPacketRepository.findByStatusOrderByCreatedAtDesc(MeshPacket.PacketStatus.DUPLICATE)));
    }

    @GetMapping("/settlements")
    @Operation(summary = "Get all settlement logs")
    public ResponseEntity<ApiResponse<List<SettlementLog>>> getSettlements() {
        return ResponseEntity.ok(ApiResponse.success(
            settlementLogRepository.findAllOrderByCreatedAtDesc()));
    }
}
