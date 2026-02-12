package com.rpgcharacter.service;

import com.rpgcharacter.config.JwtUtil;
import com.rpgcharacter.dto.AuthDTO;
import com.rpgcharacter.exception.BusinessException;
import com.rpgcharacter.exception.ResourceNotFoundException;
import com.rpgcharacter.exception.ValidationException;
import com.rpgcharacter.model.User;
import com.rpgcharacter.model.VerificationToken;
import com.rpgcharacter.repository.UserRepository;
import com.rpgcharacter.repository.VerificationTokenRepository;
import com.rpgcharacter.repository.CharacterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository tokenRepository;
    private final CharacterRepository characterRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    
    @Value("${app.email.verification.expiration}")
    private Long verificationExpiration;
    
    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .provider(User.AuthProvider.LOCAL)
                .emailVerified(false)
                .enabled(true)
                .totalCharacters(0L)
                .publicCharacters(0L)
                .build();
        
        user = userRepository.save(user);
        
        // Create verification token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .userId(user.getId())
                .type(VerificationToken.TokenType.EMAIL_VERIFICATION)
                .expiryDate(LocalDateTime.now().plusSeconds(verificationExpiration / 1000))
                .used(false)
                .build();
        
        tokenRepository.save(verificationToken);

        // Send verification email (optional - doesn't block registration if fails)
        try {
            emailService.sendVerificationEmail(user.getEmail(), token);
            log.info("Verification email sent successfully to: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send verification email to: {}. User can still login. Error: {}",
                    user.getEmail(), e.getMessage());
        }

        String jwtToken = jwtUtil.generateToken(user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        
        return AuthDTO.AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .user(mapToUserDTO(user))
                .build();
    }
    
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String jwtToken = jwtUtil.generateToken(user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        
        return AuthDTO.AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .user(mapToUserDTO(user))
                .build();
    }
    
    @Transactional
    public void verifyEmail(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        
        if (verificationToken.isExpired()) {
            throw new RuntimeException("Verification token has expired");
        }
        
        if (verificationToken.getUsed()) {
            throw new RuntimeException("Verification token already used");
        }
        
        User user = userRepository.findById(verificationToken.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setEmailVerified(true);
        userRepository.save(user);
        
        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);
    }
    
    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Delete any existing password reset tokens
        tokenRepository.findByUserIdAndType(user.getId(), VerificationToken.TokenType.PASSWORD_RESET)
                .ifPresent(tokenRepository::delete);
        
        // Create new token
        String token = UUID.randomUUID().toString();
        VerificationToken resetToken = VerificationToken.builder()
                .token(token)
                .userId(user.getId())
                .type(VerificationToken.TokenType.PASSWORD_RESET)
                .expiryDate(LocalDateTime.now().plusSeconds(verificationExpiration / 1000))
                .used(false)
                .build();
        
        tokenRepository.save(resetToken);

        // Send password reset email (optional - doesn't block if fails)
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), token);
            log.info("Password reset email sent successfully to: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send password reset email to: {}. Error: {}",
                    user.getEmail(), e.getMessage());
        }
    }
    
    @Transactional
    public void resetPassword(AuthDTO.PasswordResetConfirm request) {
        VerificationToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));
        
        if (resetToken.isExpired()) {
            throw new RuntimeException("Reset token has expired");
        }
        
        if (resetToken.getUsed()) {
            throw new RuntimeException("Reset token already used");
        }
        
        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
    
    @Transactional
    public void changePassword(String email, AuthDTO.ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
    
    public AuthDTO.AuthResponse refreshToken(String refreshToken) {
        String email = jwtUtil.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!jwtUtil.validateToken(refreshToken, email)) {
            throw new RuntimeException("Invalid refresh token");
        }
        
        String newToken = jwtUtil.generateToken(email);
        String newRefreshToken = jwtUtil.generateRefreshToken(email);
        
        return AuthDTO.AuthResponse.builder()
                .token(newToken)
                .refreshToken(newRefreshToken)
                .user(mapToUserDTO(user))
                .build();
    }

    public AuthDTO.UserDTO getUserInfo(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserDTO(user);
    }

    @Transactional
    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete all characters associated with the user
        long deletedCharacters = characterRepository.deleteByUserId(user.getId());
        log.info("Deleted {} characters for user: {}", deletedCharacters, user.getEmail());

        // Delete all verification tokens
        tokenRepository.deleteByUserId(user.getId());
        log.info("Deleted verification tokens for user: {}", user.getEmail());

        // Delete the user account
        userRepository.delete(user);
        log.info("User account deleted: {}", user.getEmail());
    }

    private AuthDTO.UserDTO mapToUserDTO(User user) {
        return AuthDTO.UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .avatarUrl(user.getAvatarUrl())
                .emailVerified(user.getEmailVerified())
                .totalCharacters(user.getTotalCharacters())
                .publicCharacters(user.getPublicCharacters())
                .build();
    }
}
