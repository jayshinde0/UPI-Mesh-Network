package com.upi.mesh.repository;

import com.upi.mesh.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, String> {
    Optional<Device> findByDeviceId(String deviceId);
    List<Device> findByOnlineTrue();
    List<Device> findByBridgeTrue();
    List<Device> findByBridgeTrueAndOnlineTrue();

    @Query("SELECT COUNT(d) FROM Device d WHERE d.online = true")
    long countOnlineDevices();

    @Query("SELECT COUNT(d) FROM Device d WHERE d.bridge = true AND d.online = true")
    long countOnlineBridgeDevices();

    @Query("SELECT d FROM Device d ORDER BY d.packetsRelayed DESC")
    List<Device> findAllOrderByPacketsRelayed();
}
