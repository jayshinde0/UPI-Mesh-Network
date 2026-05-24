package com.upi.mesh.repository;

import com.upi.mesh.entity.MeshPacket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeshPacketRepository extends JpaRepository<MeshPacket, String> {
    Optional<MeshPacket> findByPacketHash(String hash);
    boolean existsByPacketHash(String hash);

    List<MeshPacket> findByStatusOrderByCreatedAtDesc(MeshPacket.PacketStatus status);

    @Query("SELECT mp FROM MeshPacket mp WHERE mp.status = 'PROPAGATING' AND mp.ttl > 0")
    List<MeshPacket> findActivePropagatingPackets();

    @Query("SELECT COUNT(mp) FROM MeshPacket mp WHERE mp.status = :status")
    long countByStatus(@Param("status") MeshPacket.PacketStatus status);

    @Query("SELECT mp FROM MeshPacket mp ORDER BY mp.createdAt DESC")
    List<MeshPacket> findAllOrderByCreatedAtDesc();

    @Query("SELECT mp FROM MeshPacket mp WHERE mp.senderUpiId = :upiId OR mp.receiverUpiId = :upiId ORDER BY mp.createdAt DESC")
    List<MeshPacket> findByUpiId(@Param("upiId") String upiId);
}
