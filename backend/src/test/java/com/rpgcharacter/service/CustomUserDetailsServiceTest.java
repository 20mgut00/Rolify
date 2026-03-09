package com.rpgcharacter.service;

import com.rpgcharacter.model.User;
import com.rpgcharacter.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    private User buildUser(String email, String password, boolean enabled) {
        User user = new User();
        user.setId("user-id");
        user.setEmail(email);
        user.setPassword(password);
        user.setEnabled(enabled);
        return user;
    }

    @Test
    void loadUserByUsername_whenUserFound_returnsCorrectDetails() {
        User user = buildUser("user@test.com", "hashed-password", true);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));

        UserDetails details = userDetailsService.loadUserByUsername("user@test.com");

        assertThat(details.getUsername()).isEqualTo("user@test.com");
        assertThat(details.getPassword()).isEqualTo("hashed-password");
        assertThat(details.isEnabled()).isTrue();
    }

    @Test
    void loadUserByUsername_whenUserNotFound_throwsUsernameNotFoundException() {
        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("missing@test.com"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void loadUserByUsername_whenPasswordIsNull_usesEmptyString() {
        User user = buildUser("oauth@test.com", null, true); // OAuth user has no password
        when(userRepository.findByEmail("oauth@test.com")).thenReturn(Optional.of(user));

        UserDetails details = userDetailsService.loadUserByUsername("oauth@test.com");

        assertThat(details.getPassword()).isEqualTo("");
    }

    @Test
    void loadUserByUsername_whenUserDisabled_returnsDisabledDetails() {
        User user = buildUser("disabled@test.com", "pass", false);
        when(userRepository.findByEmail("disabled@test.com")).thenReturn(Optional.of(user));

        UserDetails details = userDetailsService.loadUserByUsername("disabled@test.com");

        assertThat(details.isEnabled()).isFalse();
    }
}
