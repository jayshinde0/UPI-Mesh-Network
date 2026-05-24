package com.upi.mesh.service;

import com.upi.mesh.dto.request.LoginRequest;
import com.upi.mesh.dto.request.RegisterRequest;
import com.upi.mesh.dto.response.AuthResponse;
import com.upi.mesh.dto.response.UserResponse;
import com.upi.mesh.entity.Account;
import com.upi.mesh.entity.RefreshToken;
import com.upi.mesh.entity.User;
import com.upi.mesh.exception.BadRequestException;
import com.upi.mesh.exception.ResourceNotFoundException;
import com.upi.mesh.repository.AccountRepository;
import com.upi.mesh.repository.RefreshTokenRepository;
import com.upi.mesh.repository.UserRepository;
import com.upi.mesh.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        String upiId = generateUpiId(request.getUsername());

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .fullName(request.getFullName())
            .phoneNumber(request.getPhoneNumber())
            .upiId(upiId)
            .role(User.Role.USER)
            .active(true)
            .verified(false)
            .build();

        user = userRepository.save(user);

        Account account = Account.builder()
            .user(user)
            .accountNumber(generateAccountNumber())
            .balance(java.math.BigDecimal.valueOf(10000.00))
            .upiPinHash(passwordEncoder.encode(request.getUpiPin()))
            .active(true)
            .build();

        accountRepository.save(account);

        log.info("New user registered: {} with UPI ID: {}", user.getUsername(), upiId);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String accessToken = jwtTokenProvider.generateToken(userDetails);
        String refreshToken = saveRefreshToken(user, userDetails);

        return buildAuthResponse(accessToken, refreshToken, user, account);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsernameOrEmail(), request.getPassword()
            )
        );

        User user = userRepository.findByUsername(request.getUsernameOrEmail())
            .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Account account = accountRepository.findByUserId(user.getId()).orElse(null);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String accessToken = jwtTokenProvider.generateToken(userDetails);

        refreshTokenRepository.revokeAllUserTokens(user.getId());
        String refreshToken = saveRefreshToken(user, userDetails);

        log.info("User logged in: {}", user.getUsername());
        return buildAuthResponse(accessToken, refreshToken, user, account);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
            .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Refresh token expired or revoked");
        }

        User user = refreshToken.getUser();
        Account account = accountRepository.findByUserId(user.getId()).orElse(null);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());

        String newAccessToken = jwtTokenProvider.generateToken(userDetails);
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        String newRefreshToken = saveRefreshToken(user, userDetails);

        return buildAuthResponse(newAccessToken, newRefreshToken, user, account);
    }

    private String saveRefreshToken(User user, UserDetails userDetails) {
        String tokenStr = jwtTokenProvider.generateRefreshToken(userDetails);
        RefreshToken token = RefreshToken.builder()
            .token(tokenStr)
            .user(user)
            .expiresAt(LocalDateTime.now().plusDays(7))
            .createdAt(LocalDateTime.now())
            .revoked(false)
            .build();
        refreshTokenRepository.save(token);
        return tokenStr;
    }

    private AuthResponse buildAuthResponse(String accessToken, String refreshToken, User user, Account account) {
        UserResponse userResponse = UserResponse.builder()
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

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(jwtTokenProvider.getExpirationTime())
            .user(userResponse)
            .build();
    }

    private String generateUpiId(String username) {
        return username.toLowerCase() + "@upimesh";
    }

    private String generateAccountNumber() {
        return "UPI" + String.format("%012d", new Random().nextLong(999999999999L));
    }
}
