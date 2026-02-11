package com.rpgcharacter.service;

import com.rpgcharacter.model.User;
import com.rpgcharacter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String googleId = oAuth2User.getAttribute("sub");

        log.info("Processing OAuth2 login for email: {}", email);

        // Find or create user
        User user = userRepository.findByEmail(email)
                .map(existingUser -> updateExistingUser(existingUser, name, picture, googleId))
                .orElseGet(() -> createNewUser(email, name, picture, googleId));

        userRepository.save(user);
        log.info("User saved/updated: {}", email);

        return oAuth2User;
    }

    private User updateExistingUser(User user, String name, String picture, String googleId) {
        // Update user info from Google if changed
        if (name != null && !name.equals(user.getName())) {
            user.setName(name);
        }
        if (picture != null && !picture.equals(user.getAvatarUrl())) {
            user.setAvatarUrl(picture);
        }
        if (googleId != null && user.getProviderId() == null) {
            user.setProviderId(googleId);
            user.setProvider(User.AuthProvider.GOOGLE);
        }
        // Email from Google is always verified
        user.setEmailVerified(true);
        user.setUpdatedAt(LocalDateTime.now());
        return user;
    }

    private User createNewUser(String email, String name, String picture, String googleId) {
        return User.builder()
                .email(email)
                .name(name)
                .avatarUrl(picture)
                .provider(User.AuthProvider.GOOGLE)
                .providerId(googleId)
                .emailVerified(true)
                .enabled(true)
                .totalCharacters(0L)
                .publicCharacters(0L)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
