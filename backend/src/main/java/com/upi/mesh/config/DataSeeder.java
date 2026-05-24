package com.upi.mesh.config;

import com.upi.mesh.entity.*;
import com.upi.mesh.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final DeviceRepository deviceRepository;
    private final PasswordEncoder passwordEncoder;
    private static final Random RANDOM = new Random();

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            seedUsers();
        }
        if (deviceRepository.count() == 0) {
            seedDevices();
        }
        log.info("Data seeding complete");
    }

    private void seedUsers() {
        List<String[]> users = List.of(
            new String[]{"admin",    "admin@upimesh.dev",    "Admin@123",  "System Admin",     "9000000001", "ADMIN"},
            new String[]{"alice",    "alice@upimesh.dev",    "Alice@123",  "Alice Sharma",     "9000000002", "USER"},
            new String[]{"bob",      "bob@upimesh.dev",      "Bob@1234",   "Bob Verma",        "9000000003", "USER"},
            new String[]{"charlie",  "charlie@upimesh.dev",  "Charlie@1",  "Charlie Singh",    "9000000004", "USER"},
            new String[]{"diana",    "diana@upimesh.dev",    "Diana@123",  "Diana Patel",      "9000000005", "USER"},
            new String[]{"eve",      "eve@upimesh.dev",      "Eve@12345",  "Eve Nair",         "9000000006", "USER"}
        );

        for (String[] u : users) {
            User user = User.builder()
                .username(u[0])
                .email(u[1])
                .password(passwordEncoder.encode(u[2]))
                .fullName(u[3])
                .phoneNumber(u[4])
                .upiId(u[0] + "@upimesh")
                .role(u[5].equals("ADMIN") ? User.Role.ADMIN : User.Role.USER)
                .active(true)
                .verified(true)
                .build();
            user = userRepository.save(user);

            BigDecimal balance = BigDecimal.valueOf(10000 + RANDOM.nextInt(90000));
            Account account = Account.builder()
                .user(user)
                .accountNumber("UPI" + String.format("%012d", RANDOM.nextLong(999999999999L)))
                .balance(balance)
                .upiPinHash(passwordEncoder.encode("1234"))
                .active(true)
                .build();
            accountRepository.save(account);
        }
        log.info("Seeded {} demo users", users.size());
    }

    private void seedDevices() {
        // Grid layout positions for topology visualization
        double[][] positions = {
            {100, 100}, {300, 80},  {500, 100}, {700, 80},  {900, 100},
            {150, 300}, {350, 280}, {550, 300}, {750, 280}, {950, 300},
            {100, 500}, {300, 480}, {500, 500}, {700, 480}, {900, 500}
        };

        String[] names = {
            "Phone-Alpha", "Phone-Beta", "Phone-Gamma", "Phone-Delta", "Phone-Epsilon",
            "Relay-Node-1", "Relay-Node-2", "Relay-Node-3", "Relay-Node-4", "Relay-Node-5",
            "Bridge-Mumbai", "Bridge-Delhi", "Bridge-Bangalore", "Relay-Node-6", "Relay-Node-7"
        };

        boolean[] isBridge = {
            false, false, false, false, false,
            false, false, false, false, false,
            true,  true,  true,  false, false
        };

        Device.DeviceType[] types = {
            Device.DeviceType.ORIGIN, Device.DeviceType.RELAY, Device.DeviceType.RELAY,
            Device.DeviceType.RELAY,  Device.DeviceType.RELAY, Device.DeviceType.RELAY,
            Device.DeviceType.RELAY,  Device.DeviceType.RELAY, Device.DeviceType.RELAY,
            Device.DeviceType.RELAY,  Device.DeviceType.BRIDGE,Device.DeviceType.BRIDGE,
            Device.DeviceType.BRIDGE, Device.DeviceType.RELAY, Device.DeviceType.RELAY
        };

        for (int i = 0; i < names.length; i++) {
            Device device = Device.builder()
                .deviceName(names[i])
                .deviceId("DEV-" + String.format("%03d", i + 1))
                .deviceType(types[i])
                .online(RANDOM.nextBoolean())
                .bridge(isBridge[i])
                .signalStrength(40 + RANDOM.nextInt(60))
                .packetsRelayed(RANDOM.nextInt(50))
                .packetsSettled(isBridge[i] ? RANDOM.nextInt(20) : 0)
                .xPosition(positions[i][0])
                .yPosition(positions[i][1])
                .lastSeen(LocalDateTime.now().minusMinutes(RANDOM.nextInt(60)))
                .build();
            deviceRepository.save(device);
        }
        log.info("Seeded {} demo devices", names.length);
    }
}
