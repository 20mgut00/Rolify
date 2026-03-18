package com.rpgcharacter.service;

import com.rpgcharacter.model.User;
import com.rpgcharacter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                // Usuarios OAuth no tienen password local; se usa string vacio para que Spring Security no falle
                user.getPassword() != null ? user.getPassword() : "",
                user.getEnabled(),
                true,
                true,
                true,
                new ArrayList<>()
        );
    }
}
