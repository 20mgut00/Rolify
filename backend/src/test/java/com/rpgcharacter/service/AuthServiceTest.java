package com.rpgcharacter.service;

import com.rpgcharacter.config.JwtUtil;
import com.rpgcharacter.dto.AuthDTO;
import com.rpgcharacter.exception.BusinessException;
import com.rpgcharacter.exception.ResourceNotFoundException;
import com.rpgcharacter.model.User;
import com.rpgcharacter.model.VerificationToken;
import com.rpgcharacter.repository.CharacterRepository;
import com.rpgcharacter.repository.UserRepository;
import com.rpgcharacter.repository.VerificationTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private VerificationTokenRepository tokenRepository;
    @Mock private CharacterRepository characterRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "verificationExpiration", 86400000L); // 24h en ms
    }

    // ---- Helpers ----

    private User buildUser(String id, String email, User.AuthProvider provider) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setName("Test User");
        user.setProvider(provider);
        user.setEmailVerified(false);
        user.setTotalCharacters(0L);
        user.setPublicCharacters(0L);
        return user;
    }

    private VerificationToken buildToken(boolean expired, boolean used) {
        return VerificationToken.builder()
                .token("test-token")
                .userId("user-id")
                .type(VerificationToken.TokenType.EMAIL_VERIFICATION)
                .expiryDate(expired
                        ? LocalDateTime.now().minusHours(1)
                        : LocalDateTime.now().plusHours(1))
                .used(used)
                .build();
    }

    // ==================== register ====================

    @Test
    void register_withNewEmail_savesUserAndReturnsTokens() {
        AuthDTO.RegisterRequest request = AuthDTO.RegisterRequest.builder()
                .name("Test User").email("new@test.com").password("password123").build();

        User savedUser = buildUser("user-id", "new@test.com", User.AuthProvider.LOCAL);

        when(userRepository.findByEmail("new@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(userRepository.save(any())).thenReturn(savedUser);
        when(jwtUtil.generateToken("new@test.com")).thenReturn("jwt-token");
        when(jwtUtil.generateRefreshToken("new@test.com")).thenReturn("refresh-token");

        AuthDTO.AuthResponse response = authService.register(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        assertThat(response.getUser().getEmail()).isEqualTo("new@test.com");
        verify(userRepository).save(any());
        verify(tokenRepository).save(any());
    }

    @Test
    void register_withExistingLocalEmail_throwsBusinessException() {
        AuthDTO.RegisterRequest request = AuthDTO.RegisterRequest.builder()
                .name("Test User").email("existing@test.com").password("password123").build();

        User existing = buildUser("user-id", "existing@test.com", User.AuthProvider.LOCAL);
        when(userRepository.findByEmail("existing@test.com")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already registered");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_withExistingGoogleEmail_throwsBusinessExceptionMentioningGoogle() {
        AuthDTO.RegisterRequest request = AuthDTO.RegisterRequest.builder()
                .name("Test User").email("google@test.com").password("password123").build();

        User googleUser = buildUser("user-id", "google@test.com", User.AuthProvider.GOOGLE);
        when(userRepository.findByEmail("google@test.com")).thenReturn(Optional.of(googleUser));

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Google");
    }

    @Test
    void register_whenEmailServiceFails_doesNotBlockRegistration() {
        AuthDTO.RegisterRequest request = AuthDTO.RegisterRequest.builder()
                .name("Test User").email("new@test.com").password("password123").build();

        User savedUser = buildUser("user-id", "new@test.com", User.AuthProvider.LOCAL);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any())).thenReturn(savedUser);
        when(jwtUtil.generateToken(anyString())).thenReturn("jwt-token");
        when(jwtUtil.generateRefreshToken(anyString())).thenReturn("refresh-token");
        doThrow(new RuntimeException("SMTP error")).when(emailService).sendVerificationEmail(anyString(), anyString());

        // El fallo del email no debe impedir el registro
        assertThatCode(() -> authService.register(request)).doesNotThrowAnyException();
    }

    // ==================== verifyEmail ====================

    @Test
    void verifyEmail_withValidToken_marksUserAsVerified() {
        VerificationToken token = buildToken(false, false);
        User user = buildUser("user-id", "user@test.com", User.AuthProvider.LOCAL);

        when(tokenRepository.findByToken("test-token")).thenReturn(Optional.of(token));
        when(userRepository.findById("user-id")).thenReturn(Optional.of(user));

        authService.verifyEmail("test-token");

        assertThat(user.getEmailVerified()).isTrue();
        assertThat(token.getUsed()).isTrue();
        verify(userRepository).save(user);
        verify(tokenRepository).save(token);
    }

    @Test
    void verifyEmail_withInvalidToken_throwsBusinessException() {
        when(tokenRepository.findByToken("bad-token")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.verifyEmail("bad-token"))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void verifyEmail_withExpiredToken_throwsBusinessException() {
        VerificationToken expired = buildToken(true, false);
        when(tokenRepository.findByToken("test-token")).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> authService.verifyEmail("test-token"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void verifyEmail_withAlreadyUsedToken_throwsBusinessException() {
        VerificationToken used = buildToken(false, true);
        when(tokenRepository.findByToken("test-token")).thenReturn(Optional.of(used));

        assertThatThrownBy(() -> authService.verifyEmail("test-token"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already used");
    }

    // ==================== changePassword ====================

    @Test
    void changePassword_withCorrectPassword_updatesPassword() {
        User user = buildUser("user-id", "user@test.com", User.AuthProvider.LOCAL);
        user.setPassword("encoded-old");

        AuthDTO.ChangePasswordRequest request = new AuthDTO.ChangePasswordRequest("oldPass", "newPass123");

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPass", "encoded-old")).thenReturn(true);
        when(passwordEncoder.encode("newPass123")).thenReturn("encoded-new");

        authService.changePassword("user@test.com", request);

        assertThat(user.getPassword()).isEqualTo("encoded-new");
        verify(userRepository).save(user);
    }

    @Test
    void changePassword_withWrongPassword_throwsBusinessException() {
        User user = buildUser("user-id", "user@test.com", User.AuthProvider.LOCAL);
        user.setPassword("encoded-old");

        AuthDTO.ChangePasswordRequest request = new AuthDTO.ChangePasswordRequest("wrongPass", "newPass123");

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPass", "encoded-old")).thenReturn(false);

        assertThatThrownBy(() -> authService.changePassword("user@test.com", request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("incorrect");

        verify(userRepository, never()).save(any());
    }

    // ==================== deleteAccount ====================

    @Test
    void deleteAccount_deletesCharactersTokensAndUser() {
        User user = buildUser("user-id", "user@test.com", User.AuthProvider.LOCAL);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(characterRepository.deleteByUserId("user-id")).thenReturn(3L);

        authService.deleteAccount("user@test.com");

        verify(characterRepository).deleteByUserId("user-id");
        verify(tokenRepository).deleteByUserId("user-id");
        verify(userRepository).delete(user);
    }

    @Test
    void deleteAccount_whenUserNotFound_throwsResourceNotFoundException() {
        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.deleteAccount("missing@test.com"))
                .isInstanceOf(ResourceNotFoundException.class);

        verifyNoInteractions(characterRepository, tokenRepository);
    }

    // ==================== login ====================

    @Test
    void login_withValidCredentials_returnsTokens() {
        User user = buildUser("user-id", "user@test.com", User.AuthProvider.LOCAL);
        AuthDTO.LoginRequest request = AuthDTO.LoginRequest.builder()
                .email("user@test.com").password("password123").build();

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken("user@test.com")).thenReturn("jwt-token");
        when(jwtUtil.generateRefreshToken("user@test.com")).thenReturn("refresh-token");

        AuthDTO.AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUser().getEmail()).isEqualTo("user@test.com");
    }

    @Test
    void login_whenUserNotFound_throwsResourceNotFoundException() {
        AuthDTO.LoginRequest request = AuthDTO.LoginRequest.builder()
                .email("missing@test.com").password("password123").build();

        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ==================== requestPasswordReset ====================

    @Test
    void requestPasswordReset_whenUserFound_createsTokenAndSendsEmail() {
        User user = buildUser("user-id", "user@test.com", User.AuthProvider.LOCAL);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(tokenRepository.findByUserIdAndType("user-id", VerificationToken.TokenType.PASSWORD_RESET))
                .thenReturn(Optional.empty());

        authService.requestPasswordReset("user@test.com");

        verify(tokenRepository).save(any(VerificationToken.class));
        verify(emailService).sendPasswordResetEmail(eq("user@test.com"), anyString());
    }

    @Test
    void requestPasswordReset_whenUserNotFound_throwsResourceNotFoundException() {
        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.requestPasswordReset("missing@test.com"))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(tokenRepository, never()).save(any());
    }

    @Test
    void requestPasswordReset_whenExistingTokenPresent_deletesOldAndCreatesNew() {
        User user = buildUser("user-id", "user@test.com", User.AuthProvider.LOCAL);
        VerificationToken oldToken = buildToken(false, false);

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(tokenRepository.findByUserIdAndType("user-id", VerificationToken.TokenType.PASSWORD_RESET))
                .thenReturn(Optional.of(oldToken));

        authService.requestPasswordReset("user@test.com");

        verify(tokenRepository).delete(oldToken);
        verify(tokenRepository).save(any(VerificationToken.class));
    }

    // ==================== resetPassword ====================

    @Test
    void resetPassword_withValidToken_updatesPassword() {
        VerificationToken resetToken = VerificationToken.builder()
                .token("reset-token").userId("user-id")
                .type(VerificationToken.TokenType.PASSWORD_RESET)
                .expiryDate(LocalDateTime.now().plusHours(1)).used(false).build();

        User user = buildUser("user-id", "user@test.com", User.AuthProvider.LOCAL);
        user.setPassword("encoded-old");

        AuthDTO.PasswordResetConfirm request = AuthDTO.PasswordResetConfirm.builder()
                .token("reset-token").newPassword("newPass123").build();

        when(tokenRepository.findByToken("reset-token")).thenReturn(Optional.of(resetToken));
        when(userRepository.findById("user-id")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPass123")).thenReturn("encoded-new");

        authService.resetPassword(request);

        assertThat(user.getPassword()).isEqualTo("encoded-new");
        assertThat(resetToken.getUsed()).isTrue();
        verify(userRepository).save(user);
        verify(tokenRepository).save(resetToken);
    }

    @Test
    void resetPassword_withExpiredToken_throwsBusinessException() {
        VerificationToken expired = VerificationToken.builder()
                .token("reset-token").userId("user-id")
                .type(VerificationToken.TokenType.PASSWORD_RESET)
                .expiryDate(LocalDateTime.now().minusHours(1)).used(false).build();

        AuthDTO.PasswordResetConfirm request = AuthDTO.PasswordResetConfirm.builder()
                .token("reset-token").newPassword("newPass123").build();

        when(tokenRepository.findByToken("reset-token")).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> authService.resetPassword(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void resetPassword_withUsedToken_throwsBusinessException() {
        VerificationToken used = VerificationToken.builder()
                .token("reset-token").userId("user-id")
                .type(VerificationToken.TokenType.PASSWORD_RESET)
                .expiryDate(LocalDateTime.now().plusHours(1)).used(true).build();

        AuthDTO.PasswordResetConfirm request = AuthDTO.PasswordResetConfirm.builder()
                .token("reset-token").newPassword("newPass123").build();

        when(tokenRepository.findByToken("reset-token")).thenReturn(Optional.of(used));

        assertThatThrownBy(() -> authService.resetPassword(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already used");
    }

    @Test
    void resetPassword_withInvalidToken_throwsBusinessException() {
        AuthDTO.PasswordResetConfirm request = AuthDTO.PasswordResetConfirm.builder()
                .token("bad-token").newPassword("newPass123").build();

        when(tokenRepository.findByToken("bad-token")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.resetPassword(request))
                .isInstanceOf(BusinessException.class);
    }

    // ==================== refreshToken ====================

    @Test
    void refreshToken_withValidToken_returnsNewTokens() {
        User user = buildUser("user-id", "user@test.com", User.AuthProvider.LOCAL);

        when(jwtUtil.extractUsername("old-refresh")).thenReturn("user@test.com");
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(jwtUtil.validateToken("old-refresh", "user@test.com")).thenReturn(true);
        when(jwtUtil.generateToken("user@test.com")).thenReturn("new-jwt");
        when(jwtUtil.generateRefreshToken("user@test.com")).thenReturn("new-refresh");

        AuthDTO.AuthResponse response = authService.refreshToken("old-refresh");

        assertThat(response.getToken()).isEqualTo("new-jwt");
        assertThat(response.getRefreshToken()).isEqualTo("new-refresh");
    }

    @Test
    void refreshToken_withInvalidToken_throwsBusinessException() {
        when(jwtUtil.extractUsername("bad-token")).thenReturn("user@test.com");
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(
                buildUser("user-id", "user@test.com", User.AuthProvider.LOCAL)));
        when(jwtUtil.validateToken("bad-token", "user@test.com")).thenReturn(false);

        assertThatThrownBy(() -> authService.refreshToken("bad-token"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid refresh token");
    }

    @Test
    void requestPasswordReset_whenEmailFails_doesNotThrow() {
        User user = buildUser("user-id", "user@test.com", User.AuthProvider.LOCAL);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(tokenRepository.findByUserIdAndType("user-id", VerificationToken.TokenType.PASSWORD_RESET))
                .thenReturn(Optional.empty());
        doThrow(new RuntimeException("SMTP error")).when(emailService).sendPasswordResetEmail(anyString(), anyString());

        // Email failure should NOT propagate — it's caught and logged
        assertThatCode(() -> authService.requestPasswordReset("user@test.com"))
                .doesNotThrowAnyException();

        verify(tokenRepository).save(any(VerificationToken.class));
    }

    // ==================== orElseThrow branches (user not found by ID) ====================

    @Test
    void verifyEmail_whenUserNotFoundAfterValidToken_throwsResourceNotFoundException() {
        VerificationToken token = buildToken(false, false);
        when(tokenRepository.findByToken("test-token")).thenReturn(Optional.of(token));
        when(userRepository.findById("user-id")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.verifyEmail("test-token"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void resetPassword_whenUserNotFoundAfterValidToken_throwsResourceNotFoundException() {
        VerificationToken resetToken = VerificationToken.builder()
                .token("reset-token").userId("user-id")
                .type(VerificationToken.TokenType.PASSWORD_RESET)
                .expiryDate(LocalDateTime.now().plusHours(1)).used(false).build();
        AuthDTO.PasswordResetConfirm request = AuthDTO.PasswordResetConfirm.builder()
                .token("reset-token").newPassword("newPass123").build();

        when(tokenRepository.findByToken("reset-token")).thenReturn(Optional.of(resetToken));
        when(userRepository.findById("user-id")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.resetPassword(request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void changePassword_whenUserNotFound_throwsResourceNotFoundException() {
        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.changePassword("missing@test.com",
                new AuthDTO.ChangePasswordRequest("old", "new")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void refreshToken_whenUserNotFound_throwsResourceNotFoundException() {
        when(jwtUtil.extractUsername("orphan-token")).thenReturn("ghost@test.com");
        when(userRepository.findByEmail("ghost@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refreshToken("orphan-token"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ==================== getUserInfo ====================

    @Test
    void getUserInfo_whenUserFound_returnsUserDTO() {
        User user = buildUser("user-id", "user@test.com", User.AuthProvider.LOCAL);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));

        AuthDTO.UserDTO result = authService.getUserInfo("user@test.com");

        assertThat(result.getEmail()).isEqualTo("user@test.com");
        assertThat(result.getId()).isEqualTo("user-id");
    }

    @Test
    void getUserInfo_whenUserNotFound_throwsResourceNotFoundException() {
        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.getUserInfo("missing@test.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
