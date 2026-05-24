package com.upi.mesh.repository;

import com.upi.mesh.entity.SettlementLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SettlementLogRepository extends JpaRepository<SettlementLog, String> {
    List<SettlementLog> findByPacketHashOrderByCreatedAtDesc(String packetHash);

    @Query("SELECT sl FROM SettlementLog sl ORDER BY sl.createdAt DESC")
    List<SettlementLog> findAllOrderByCreatedAtDesc();

    @Query("SELECT sl FROM SettlementLog sl WHERE sl.createdAt >= :since ORDER BY sl.createdAt DESC")
    List<SettlementLog> findRecentLogs(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(sl) FROM SettlementLog sl WHERE sl.status = :status")
    long countByStatus(@Param("status") SettlementLog.SettlementStatus status);
}
