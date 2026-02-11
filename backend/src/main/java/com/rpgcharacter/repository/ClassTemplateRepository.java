package com.rpgcharacter.repository;

import com.rpgcharacter.model.ClassTemplate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassTemplateRepository extends MongoRepository<ClassTemplate, String> {
    
    List<ClassTemplate> findBySystem(String system);
    
    Optional<ClassTemplate> findBySystemAndClassName(String system, String className);
    
    List<ClassTemplate> findDistinctSystemBy();
}
