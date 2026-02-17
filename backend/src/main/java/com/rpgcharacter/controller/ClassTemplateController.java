package com.rpgcharacter.controller;

import com.rpgcharacter.model.ClassTemplate;
import com.rpgcharacter.repository.ClassTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/class-templates")
@RequiredArgsConstructor
public class ClassTemplateController {
    
    private final ClassTemplateRepository classTemplateRepository;
    
    @GetMapping
    public ResponseEntity<List<ClassTemplate>> getAllTemplates() {
        return ResponseEntity.ok(classTemplateRepository.findAll());
    }
    
    @GetMapping("/systems/{system}")
    public ResponseEntity<List<ClassTemplate>> getTemplatesBySystem(@PathVariable String system) {
        return ResponseEntity.ok(classTemplateRepository.findBySystem(system));
    }
    
    @GetMapping("/systems/{system}/classes/{className}")
    public ResponseEntity<ClassTemplate> getTemplate(
            @PathVariable String system,
            @PathVariable String className
    ) {
        return classTemplateRepository.findBySystemAndClassName(system, className)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
