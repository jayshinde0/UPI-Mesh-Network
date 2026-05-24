package com.upi.mesh.controller;

import com.upi.mesh.dto.response.ApiResponse;
import com.upi.mesh.dto.response.DashboardStatsResponse;
import com.upi.mesh.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Dashboard and analytics endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDashboardStats()));
    }

    @GetMapping("/network")
    @Operation(summary = "Get network analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNetworkAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getNetworkAnalytics()));
    }

    @GetMapping("/top-senders")
    @Operation(summary = "Get top senders")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopSenders() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getTopSenders()));
    }
}
