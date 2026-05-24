package com.upi.mesh.controller;

import com.upi.mesh.dto.response.ApiResponse;
import com.upi.mesh.dto.response.DeviceResponse;
import com.upi.mesh.dto.response.MeshPacketResponse;
import com.upi.mesh.entity.MeshPacket;
import com.upi.mesh.entity.PacketAudit;
import com.upi.mesh.repository.MeshPacketRepository;
import com.upi.mesh.repository.PacketAuditRepository;
import com.upi.mesh.service.DeviceService;
import com.upi.mesh.service.MeshSimulatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/mesh")
@RequiredArgsConstructor
@Tag(name = "Mesh Network", description = "Mesh simulation and device endpoints")
@SecurityRequirement(name = "bearerAuth")
public class MeshController {

    private final MeshSimulatorService meshSimulatorService;
    private final DeviceService deviceService;
    private final MeshPacketRepository meshPacketRepository;
    private final PacketAuditRepository packetAuditRepository;

    @GetMapping("/devices")
    @Operation(summary = "Get all mesh devices")
    public ResponseEntity<ApiResponse<List<DeviceResponse>>> getAllDevices() {
        return ResponseEntity.ok(ApiResponse.success(deviceService.getAllDevices()));
    }

    @GetMapping("/devices/online")
    @Operation(summary = "Get online devices")
    public ResponseEntity<ApiResponse<List<DeviceResponse>>> getOnlineDevices() {
        return ResponseEntity.ok(ApiResponse.success(deviceService.getOnlineDevices()));
    }

    @PostMapping("/devices/{deviceId}/toggle")
    @Operation(summary = "Toggle device online/offline")
    public ResponseEntity<ApiResponse<DeviceResponse>> toggleDevice(@PathVariable String deviceId) {
        return ResponseEntity.ok(ApiResponse.success(deviceService.toggleDeviceStatus(deviceId)));
    }

    @GetMapping("/packets")
    @Operation(summary = "Get all mesh packets")
    public ResponseEntity<ApiResponse<List<MeshPacket>>> getAllPackets() {
        return ResponseEntity.ok(ApiResponse.success(
            meshPacketRepository.findAllOrderByCreatedAtDesc()));
    }

    @GetMapping("/packets/{id}/audit")
    @Operation(summary = "Get packet audit trail")
    public ResponseEntity<ApiResponse<List<PacketAudit>>> getPacketAudit(@PathVariable String id) {
        MeshPacket packet = meshPacketRepository.findById(id)
            .orElseThrow(() -> new com.upi.mesh.exception.ResourceNotFoundException("Packet not found"));
        List<PacketAudit> audits = packetAuditRepository
            .findByPacketHashOrderByCreatedAtAsc(packet.getPacketHash());
        return ResponseEntity.ok(ApiResponse.success(audits));
    }

    @PostMapping("/simulate/inject/{packetId}")
    @Operation(summary = "Inject packet into mesh propagation")
    public ResponseEntity<ApiResponse<MeshPacket>> injectPacket(@PathVariable String packetId) {
        MeshPacket packet = meshSimulatorService.injectPacketIntoMesh(packetId);
        return ResponseEntity.ok(ApiResponse.success(packet, "Packet injected into mesh"));
    }

    @PostMapping("/simulate/tamper/{packetId}")
    @Operation(summary = "Simulate packet tampering")
    public ResponseEntity<ApiResponse<MeshPacket>> simulateTamper(@PathVariable String packetId) {
        MeshPacket packet = meshSimulatorService.simulateTampering(packetId);
        return ResponseEntity.ok(ApiResponse.success(packet, "Packet tampered for simulation"));
    }

    @PostMapping("/simulate/reset")
    @Operation(summary = "Reset mesh simulation")
    public ResponseEntity<ApiResponse<String>> resetMesh() {
        meshSimulatorService.resetMesh();
        return ResponseEntity.ok(ApiResponse.success("Mesh reset", "Mesh simulation reset"));
    }

    @PostMapping("/simulate/flush-bridges")
    @Operation(summary = "Flush bridge nodes (bring all online)")
    public ResponseEntity<ApiResponse<String>> flushBridges() {
        meshSimulatorService.flushBridgeNodes();
        return ResponseEntity.ok(ApiResponse.success("Bridges flushed", "All bridge nodes online"));
    }

    @PostMapping("/simulate/randomize-devices")
    @Operation(summary = "Randomize device online statuses")
    public ResponseEntity<ApiResponse<String>> randomizeDevices() {
        deviceService.randomizeDeviceStatuses();
        return ResponseEntity.ok(ApiResponse.success("Randomized", "Device statuses randomized"));
    }
}
