package com.upi.mesh.controller;

import com.upi.mesh.dto.response.ApiResponse;
import com.upi.mesh.entity.SettlementLog;
import com.upi.mesh.repository.SettlementLogRepository;
import com.upi.mesh.service.SettlementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bridge")
@RequiredArgsConstructor
@Tag(name = "Bridge", description = "Bridge node settlement endpoints")
@SecurityRequirement(name = "bearerAuth")
public class BridgeController {

    private final SettlementService settlementService;
    private final SettlementLogRepository settlementLogRepository;

    @PostMapping("/settle/{packetId}")
    @Operation(summary = "Settle a packet received by bridge node")
    public ResponseEntity<ApiResponse<SettlementLog>> settlePacket(
            @PathVariable String packetId,
            @RequestBody(required = false) Map<String, String> body) {
        String bridgeDeviceId = body != null ? body.getOrDefault("bridgeDeviceId", "BRIDGE-API") : "BRIDGE-API";
        SettlementLog log = settlementService.settlePacket(packetId, bridgeDeviceId);
        return ResponseEntity.ok(ApiResponse.success(log, "Settlement processed"));
    }

    @GetMapping("/logs")
    @Operation(summary = "Get all settlement logs")
    public ResponseEntity<ApiResponse<List<SettlementLog>>> getSettlementLogs() {
        return ResponseEntity.ok(ApiResponse.success(
            settlementLogRepository.findAllOrderByCreatedAtDesc()));
    }

    @GetMapping("/logs/{packetHash}")
    @Operation(summary = "Get settlement logs for a specific packet")
    public ResponseEntity<ApiResponse<List<SettlementLog>>> getLogsForPacket(
            @PathVariable String packetHash) {
        return ResponseEntity.ok(ApiResponse.success(
            settlementLogRepository.findByPacketHashOrderByCreatedAtDesc(packetHash)));
    }
}
