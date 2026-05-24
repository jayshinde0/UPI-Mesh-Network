package com.upi.mesh;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main entry point for UPI Offline Mesh Network Simulation Application.
 * Simulates offline UPI payments via Bluetooth-style mesh propagation.
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class UpiMeshApplication {
    public static void main(String[] args) {
        SpringApplication.run(UpiMeshApplication.class, args);
    }
}
