package com.upi.mesh.repository;

import com.upi.mesh.entity.PacketAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PacketAuditRepository extends JpaRepository<PacketAudit, String> {
    List<PacketAudit> findByPacketHashOrderByCreatedAtAsc(String packetHash);

    @Query("SELECT pa FROM PacketAudit pa ORDER BY pa.createdAt DESC")
    List<PacketAudit> findAllOrderByCreatedAtDesc();
}
