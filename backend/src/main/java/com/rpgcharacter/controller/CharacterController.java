package com.rpgcharacter.controller;

import com.rpgcharacter.dto.CharacterDTO;
import com.rpgcharacter.dto.GenerateCharacterDTO;
import com.rpgcharacter.model.ClassTemplate;
import com.rpgcharacter.repository.ClassTemplateRepository;
import com.rpgcharacter.service.CharacterService;
import com.rpgcharacter.service.GeminiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/characters")
@RequiredArgsConstructor
@CrossOrigin(origins = "*.vercel.app") // Permitir CORS para todas las fuentes (ajustar según sea necesario)
public class CharacterController {

    private final CharacterService characterService;
    private final GeminiService geminiService;
    private final ClassTemplateRepository classTemplateRepository;
    
    @PostMapping
    public ResponseEntity<CharacterDTO.Response> createCharacter(
            @Valid @RequestBody CharacterDTO.CreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(characterService.createCharacter(request, email));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CharacterDTO.Response> updateCharacter(
            @PathVariable String id,
            @Valid @RequestBody CharacterDTO.UpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(characterService.updateCharacter(id, request, userDetails.getUsername()));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCharacter(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        characterService.deleteCharacter(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<CharacterDTO.CardResponse>> getMyCharacters(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(characterService.getUserCharacters(userDetails.getUsername()));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CharacterDTO.Response> getCharacter(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(characterService.getCharacter(id, email));
    }
    
    @GetMapping("/public")
    public ResponseEntity<Page<CharacterDTO.CardResponse>> getPublicCharacters(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String system,
            @RequestParam(required = false) String className
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(characterService.getPublicCharacters(pageable, system, className));
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateCharacter(
            @Valid @RequestBody GenerateCharacterDTO.Request request
    ) {
        ClassTemplate template = classTemplateRepository
                .findBySystemAndClassName(request.getSystem(), request.getClassName())
                .orElseThrow(() -> new RuntimeException("Class template not found"));

        Map<String, Object> generatedData = geminiService.generateCharacter(template, request.getPrompt());
        return ResponseEntity.ok(generatedData);
    }
}
