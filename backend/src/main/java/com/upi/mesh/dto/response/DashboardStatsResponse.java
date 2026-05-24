package com.upi.mesh.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStatsResponse {
    private long totalTransactions;
    private long settledTransactions;
    private long duplicatePackets;
    private long tamperedPackets;
    private long activeDevices;
    private long onlineBridgeDevices;
    private long totalUsers;
    private long pendingPackets;
    private double networkHealth;
    private List<Map<String, Object>> transactionsPerMinute;
    private List<Map<String, Object>> recentTransactions;
}
