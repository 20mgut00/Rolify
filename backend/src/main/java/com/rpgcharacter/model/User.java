package com.rpgcharacter.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String email;
    
    private String password; // Null for OAuth users
    
    private String name;
    
    private String avatarUrl;
    
    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;
    
    private String providerId; // Google ID for OAuth users
    
    @Builder.Default
    private Boolean emailVerified = false;
    
    @Builder.Default
    private Boolean enabled = true;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Statistics
    @Builder.Default
    private Long totalCharacters = 0L;
    
    @Builder.Default
    private Long publicCharacters = 0L;
    
    public enum AuthProvider {
        LOCAL,
        GOOGLE
    }
}
