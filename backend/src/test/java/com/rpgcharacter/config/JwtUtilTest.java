package com.rpgcharacter.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.assertj.core.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    // Mínimo 256 bits (32 chars) para HS256
    private static final String SECRET = "test-secret-key-for-jwt-signing-minimum-256-bits!!";
    private static final Long EXPIRATION = 3600000L;        // 1 hora
    private static final Long REFRESH_EXPIRATION = 86400000L; // 24 horas

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expiration", EXPIRATION);
        ReflectionTestUtils.setField(jwtUtil, "refreshExpiration", REFRESH_EXPIRATION);
    }

    // ── generateToken / extractUsername ───────────────────────────────────────

    @Test
    void generateToken_extractUsername_returnsEmail() {
        String token = jwtUtil.generateToken("user@example.com");
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("user@example.com");
    }

    @Test
    void generateRefreshToken_extractUsername_returnsEmail() {
        String token = jwtUtil.generateRefreshToken("user@example.com");
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("user@example.com");
    }

    // ── extractExpiration ─────────────────────────────────────────────────────

    @Test
    void generateToken_expirationIsInFuture() {
        String token = jwtUtil.generateToken("user@example.com");
        Date expiration = jwtUtil.extractExpiration(token);
        assertThat(expiration).isAfter(new Date());
    }

    @Test
    void generateRefreshToken_expirationIsLongerThanAccessToken() {
        String accessToken = jwtUtil.generateToken("user@example.com");
        String refreshToken = jwtUtil.generateRefreshToken("user@example.com");

        Date accessExp = jwtUtil.extractExpiration(accessToken);
        Date refreshExp = jwtUtil.extractExpiration(refreshToken);

        assertThat(refreshExp).isAfter(accessExp);
    }

    // ── validateToken ─────────────────────────────────────────────────────────

    @Test
    void validateToken_validTokenAndEmail_returnsTrue() {
        String token = jwtUtil.generateToken("user@example.com");
        assertThat(jwtUtil.validateToken(token, "user@example.com")).isTrue();
    }

    @Test
    void validateToken_wrongEmail_returnsFalse() {
        String token = jwtUtil.generateToken("user@example.com");
        assertThat(jwtUtil.validateToken(token, "other@example.com")).isFalse();
    }

    @Test
    void validateToken_expiredToken_throwsExpiredJwtException() {
        ReflectionTestUtils.setField(jwtUtil, "expiration", -1000L); // ya expirado
        String token = jwtUtil.generateToken("user@example.com");

        // La librería JJWT lanza ExpiredJwtException al parsear un token expirado
        assertThatThrownBy(() -> jwtUtil.validateToken(token, "user@example.com"))
                .isInstanceOf(Exception.class);
    }

    // ── token inválido ────────────────────────────────────────────────────────

    @Test
    void extractUsername_invalidToken_throwsException() {
        assertThatThrownBy(() -> jwtUtil.extractUsername("not.a.valid.token"))
                .isInstanceOf(Exception.class);
    }

    @Test
    void extractUsername_tokenSignedWithDifferentSecret_throwsException() {
        JwtUtil otherUtil = new JwtUtil();
        ReflectionTestUtils.setField(otherUtil, "secret", "different-secret-key-for-testing-purposes!!");
        ReflectionTestUtils.setField(otherUtil, "expiration", EXPIRATION);
        ReflectionTestUtils.setField(otherUtil, "refreshExpiration", REFRESH_EXPIRATION);

        String tokenFromOther = otherUtil.generateToken("user@example.com");

        assertThatThrownBy(() -> jwtUtil.extractUsername(tokenFromOther))
                .isInstanceOf(Exception.class);
    }
}
