package com.rpgcharacter.service;

import com.rpgcharacter.exception.RateLimitExceededException;
import com.rpgcharacter.exception.ResourceNotFoundException;
import com.rpgcharacter.model.User;
import com.rpgcharacter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    @Value("${app.rate-limit.user-daily-limit:3}")
    private int userDailyLimit;

    @Value("${app.rate-limit.global-daily-limit:18}")
    private int globalDailyLimit;

    private final UserRepository userRepository;

    private final AtomicInteger globalDailyCount = new AtomicInteger(0);

    public void checkAndIncrement(String email) {
        if (globalDailyCount.get() >= globalDailyLimit) {
            throw new RateLimitExceededException("Daily AI generation limit reached. Try again tomorrow.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDate today = LocalDate.now();
        if (!today.equals(user.getLastAiGenerationDate())) {
            user.setDailyAiGenerations(0);
            user.setLastAiGenerationDate(today);
        }

        if (user.getDailyAiGenerations() >= userDailyLimit) {
            throw new RateLimitExceededException(
                    "Daily AI generation limit reached (" + userDailyLimit + "/day). Try again tomorrow.");
        }

        user.setDailyAiGenerations(user.getDailyAiGenerations() + 1);
        userRepository.save(user);
        globalDailyCount.incrementAndGet();
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void resetGlobalCount() {
        log.info("Resetting global AI generation counter (was {})", globalDailyCount.get());
        globalDailyCount.set(0);
    }
}
