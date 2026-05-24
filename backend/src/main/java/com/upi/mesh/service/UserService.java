package com.upi.mesh.service;

import com.upi.mesh.dto.response.UserResponse;
import com.upi.mesh.entity.Account;
import com.upi.mesh.entity.User;
import com.upi.mesh.exception.ResourceNotFoundException;
import com.upi.mesh.repository.AccountRepository;
import com.upi.mesh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    @Transactional(readOnly = true)
    public UserResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        Account account = accountRepository.findByUserId(user.getId()).orElse(null);
        return toResponse(user, account);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByUpiId(String upiId) {
        User user = userRepository.findByUpiId(upiId)
            .orElseThrow(() -> new ResourceNotFoundException("UPI ID not found: " + upiId));
        Account account = accountRepository.findByUserId(user.getId()).orElse(null);
        return toResponse(user, account);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(u -> {
                Account acc = accountRepository.findByUserId(u.getId()).orElse(null);
                return toResponse(u, acc);
            }).toList();
    }

    @Transactional
    public void toggleUserStatus(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    private UserResponse toResponse(User user, Account account) {
        return UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .phoneNumber(user.getPhoneNumber())
            .upiId(user.getUpiId())
            .role(user.getRole().name())
            .active(user.isActive())
            .balance(account != null ? account.getBalance() : null)
            .accountNumber(account != null ? account.getAccountNumber() : null)
            .createdAt(user.getCreatedAt())
            .build();
    }
}
