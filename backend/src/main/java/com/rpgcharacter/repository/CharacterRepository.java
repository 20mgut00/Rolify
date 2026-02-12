package com.rpgcharacter.repository;

import com.rpgcharacter.model.Character;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CharacterRepository extends MongoRepository<Character, String> {
    
    List<Character> findByUserId(String userId);
    
    Page<Character> findByIsPublicTrue(Pageable pageable);
    
    Page<Character> findByIsPublicTrueAndClassName(String className, Pageable pageable);
    
    Page<Character> findByIsPublicTrueAndSystem(String system, Pageable pageable);
    
    Page<Character> findByIsPublicTrueAndSystemAndClassName(String system, String className, Pageable pageable);
    
    Long countByUserId(String userId);

    Long countByUserIdAndIsPublicTrue(String userId);

    Long deleteByUserId(String userId);
}
