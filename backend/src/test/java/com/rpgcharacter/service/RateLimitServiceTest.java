package com.rpgcharacter.service;

import com.rpgcharacter.exception.RateLimitExceededException;
import com.rpgcharacter.exception.ResourceNotFoundException;
import com.rpgcharacter.model.User;
import com.rpgcharacter.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RateLimitServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RateLimitService rateLimitService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(rateLimitService, "userDailyLimit", 3);
        ReflectionTestUtils.setField(rateLimitService, "globalDailyLimit", 18);
        // Obtener referencia al AtomicInteger existente y resetearlo
        getGlobalCounter().set(0);
    }

    // Accede al contador global sin necesidad de modificar el campo final
    private AtomicInteger getGlobalCounter() {
        return (AtomicInteger) ReflectionTestUtils.getField(rateLimitService, "globalDailyCount");
    }

    private User buildUser(int dailyGenerations, LocalDate lastDate) {
        User user = new User();
        user.setId("user-id");
        user.setEmail("test@test.com");
        user.setDailyAiGenerations(dailyGenerations);
        user.setLastAiGenerationDate(lastDate);
        return user;
    }

    // ---- Límite global ----

    @Test
    void checkAndIncrement_whenGlobalLimitReached_throwsRateLimitExceededException() {
        getGlobalCounter().set(18); // Simula que el límite global está lleno

        assertThatThrownBy(() -> rateLimitService.checkAndIncrement("test@test.com"))
                .isInstanceOf(RateLimitExceededException.class);

        verifyNoInteractions(userRepository); // No debe consultar la BD
    }

    // ---- Usuario no encontrado ----

    @Test
    void checkAndIncrement_whenUserNotFound_throwsResourceNotFoundException() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> rateLimitService.checkAndIncrement("test@test.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ---- Límite de usuario ----

    @Test
    void checkAndIncrement_whenUserLimitReached_throwsRateLimitExceededException() {
        User user = buildUser(3, LocalDate.now()); // Ya usó los 3 del día
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> rateLimitService.checkAndIncrement("test@test.com"))
                .isInstanceOf(RateLimitExceededException.class);
    }

    // ---- Incremento exitoso ----

    @Test
    void checkAndIncrement_whenUserUnderLimit_incrementsCountersAndSaves() {
        User user = buildUser(1, LocalDate.now());
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        assertThatCode(() -> rateLimitService.checkAndIncrement("test@test.com"))
                .doesNotThrowAnyException();

        assertThat(user.getDailyAiGenerations()).isEqualTo(2);
        assertThat(getGlobalCounter().get()).isEqualTo(1);
        verify(userRepository, times(1)).save(user);
    }

    // ---- Reset por día nuevo ----

    @Test
    void checkAndIncrement_whenLastGenerationWasYesterday_resetsUserCounter() {
        User user = buildUser(3, LocalDate.now().minusDays(1)); // Límite de ayer
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));

        // No debe lanzar excepción porque el contador se resetea
        assertThatCode(() -> rateLimitService.checkAndIncrement("test@test.com"))
                .doesNotThrowAnyException();

        assertThat(user.getDailyAiGenerations()).isEqualTo(1); // Reseteado a 0, luego +1
        assertThat(user.getLastAiGenerationDate()).isEqualTo(LocalDate.now());
    }

    // ---- Reset programado ----

    @Test
    void resetGlobalCount_resetsCounterToZero() {
        getGlobalCounter().set(15);

        rateLimitService.resetGlobalCount();

        assertThat(getGlobalCounter().get()).isEqualTo(0);
    }
}
