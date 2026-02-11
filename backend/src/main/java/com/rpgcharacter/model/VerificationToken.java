package com.rpgcharacter.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "verification_tokens")
public class VerificationToken {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String token;
    
    private String userId;
    
    private TokenType type;
    
    @Indexed(expireAfter = "0s")
    private LocalDateTime expiryDate;
    
    @Builder.Default
    private Boolean used = false;
    
    public enum TokenType {
        EMAIL_VERIFICATION,
        PASSWORD_RESET
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
}
