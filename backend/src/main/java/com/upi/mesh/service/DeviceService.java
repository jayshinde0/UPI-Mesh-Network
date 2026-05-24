package com.upi.mesh.service;

import com.upi.mesh.dto.response.DeviceResponse;
import com.upi.mesh.entity.Device;
import com.upi.mesh.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private static final Random RANDOM = new Random();

    @Transactional(readOnly = true)
    public List<DeviceResponse> getAllDevices() {
        return deviceRepository.findAll().stream()
            .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<DeviceResponse> getOnlineDevices() {
        return deviceRepository.findByOnlineTrue().stream()
            .map(this::toResponse).toList();
    }

    @Transactional
    public DeviceResponse toggleDeviceStatus(String deviceId) {
        Device device = deviceRepository.findByDeviceId(deviceId)
            .orElseThrow(() -> new RuntimeException("Device not found: " + deviceId));
        device.setOnline(!device.isOnline());
        device.setLastSeen(LocalDateTime.now());
        device = deviceRepository.save(device);
        messagingTemplate.convertAndSend("/topic/devices", toResponse(device));
        return toResponse(device);
    }

    @Transactional
    public void randomizeDeviceStatuses() {
        deviceRepository.findAll().forEach(d -> {
            d.setOnline(RANDOM.nextBoolean());
            d.setSignalStrength(30 + RANDOM.nextInt(70));
            d.setLastSeen(LocalDateTime.now());
            deviceRepository.save(d);
        });
        messagingTemplate.convertAndSend("/topic/devices", getAllDevices());
    }

    private DeviceResponse toResponse(Device d) {
        return DeviceResponse.builder()
            .id(d.getId())
            .deviceName(d.getDeviceName())
            .deviceId(d.getDeviceId())
            .deviceType(d.getDeviceType().name())
            .online(d.isOnline())
            .bridge(d.isBridge())
            .signalStrength(d.getSignalStrength())
            .packetsRelayed(d.getPacketsRelayed())
            .packetsSettled(d.getPacketsSettled())
            .xPosition(d.getXPosition())
            .yPosition(d.getYPosition())
            .lastSeen(d.getLastSeen())
            .createdAt(d.getCreatedAt())
            .build();
    }
}
