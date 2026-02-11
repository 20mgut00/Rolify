package com.rpgcharacter.repository;

import com.rpgcharacter.model.VerificationToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends MongoRepository<VerificationToken, String> {
    
    Optional<VerificationToken> findByToken(String token);
    
    Optional<VerificationToken> findByUserIdAndType(String userId, VerificationToken.TokenType type);
    
    void deleteByUserId(String userId);
}
