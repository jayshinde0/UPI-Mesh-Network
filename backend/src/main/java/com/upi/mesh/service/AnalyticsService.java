package com.upi.mesh.service;

import com.upi.mesh.dto.response.DashboardStatsResponse;
import com.upi.mesh.entity.Transaction;
import com.upi.mesh.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final MeshPacketRepository meshPacketRepository;
    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;
    private final SettlementLogRepository settlementLogRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long total = transactionRepository.count();
        long settled = transactionRepository.countSettled();
        long duplicates = transactionRepository.countDuplicates();
        long tampered = transactionRepository.countTampered();
        long activeDevices = deviceRepository.countOnlineDevices();
        long bridgeDevices = deviceRepository.countOnlineBridgeDevices();
        long totalUsers = userRepository.countActiveUsers();
        long pending = meshPacketRepository.countByStatus(
            com.upi.mesh.entity.MeshPacket.PacketStatus.PROPAGATING);

        double networkHealth = activeDevices > 0
            ? Math.min(100.0, (settled * 100.0 / Math.max(total, 1)) + (activeDevices * 5.0))
            : 0.0;

        // Transactions per minute (last 30 minutes)
        List<Object[]> rawData = transactionRepository.countTransactionsPerMinute(
            LocalDateTime.now().minusMinutes(30));
        List<Map<String, Object>> tpm = rawData.stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("time", row[0].toString());
            m.put("count", row[1]);
            return m;
        }).toList();

        // Recent transactions
        List<Map<String, Object>> recent = transactionRepository
            .findRecentTransactions(LocalDateTime.now().minusHours(1))
            .stream().limit(10).map(t -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", t.getId());
                m.put("senderUpiId", t.getSenderUpiId());
                m.put("receiverUpiId", t.getReceiverUpiId());
                m.put("amount", t.getAmount());
                m.put("status", t.getStatus().name());
                m.put("createdAt", t.getCreatedAt().toString());
                return m;
            }).toList();

        return DashboardStatsResponse.builder()
            .totalTransactions(total)
            .settledTransactions(settled)
            .duplicatePackets(duplicates)
            .tamperedPackets(tampered)
            .activeDevices(activeDevices)
            .onlineBridgeDevices(bridgeDevices)
            .totalUsers(totalUsers)
            .pendingPackets(pending)
            .networkHealth(networkHealth)
            .transactionsPerMinute(tpm)
            .recentTransactions(recent)
            .build();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getNetworkAnalytics() {
        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("totalPackets", meshPacketRepository.count());
        analytics.put("settledPackets", meshPacketRepository.countByStatus(
            com.upi.mesh.entity.MeshPacket.PacketStatus.SETTLED));
        analytics.put("propagatingPackets", meshPacketRepository.countByStatus(
            com.upi.mesh.entity.MeshPacket.PacketStatus.PROPAGATING));
        analytics.put("tamperedPackets", meshPacketRepository.countByStatus(
            com.upi.mesh.entity.MeshPacket.PacketStatus.TAMPERED));
        analytics.put("duplicatePackets", meshPacketRepository.countByStatus(
            com.upi.mesh.entity.MeshPacket.PacketStatus.DUPLICATE));
        analytics.put("totalDevices", deviceRepository.count());
        analytics.put("onlineDevices", deviceRepository.countOnlineDevices());
        analytics.put("bridgeDevices", deviceRepository.countOnlineBridgeDevices());
        analytics.put("recentLogs", settlementLogRepository
            .findRecentLogs(LocalDateTime.now().minusHours(1)).stream().limit(20).toList());
        return analytics;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTopSenders() {
        return transactionRepository.findAll().stream()
            .filter(t -> t.getStatus() == Transaction.TransactionStatus.SETTLED)
            .collect(java.util.stream.Collectors.groupingBy(
                t -> t.getSenderUpiId(),
                java.util.stream.Collectors.counting()
            ))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(10)
            .map(e -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("upiId", e.getKey());
                m.put("count", e.getValue());
                return m;
            })
            .toList();
    }
}
