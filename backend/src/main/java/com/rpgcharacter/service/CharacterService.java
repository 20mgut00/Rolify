package com.rpgcharacter.service;

import com.rpgcharacter.dto.CharacterDTO;
import com.rpgcharacter.exception.ResourceNotFoundException;
import com.rpgcharacter.exception.UnauthorizedException;
import com.rpgcharacter.mapper.CharacterMapper;
import com.rpgcharacter.model.Character;
import com.rpgcharacter.model.ClassTemplate;
import com.rpgcharacter.repository.CharacterRepository;
import com.rpgcharacter.repository.ClassTemplateRepository;
import com.rpgcharacter.repository.UserRepository;
import com.rpgcharacter.validator.CharacterValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CharacterService {
    
    private final CharacterRepository characterRepository;
    private final ClassTemplateRepository classTemplateRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final CharacterValidator characterValidator;
    private final CharacterMapper characterMapper;
    
    @Transactional
    public CharacterDTO.Response createCharacter(CharacterDTO.CreateRequest request, String userEmail) {
        ClassTemplate template = classTemplateRepository
                .findBySystemAndClassName(request.getSystem(), request.getClassName())
                .orElseThrow(() -> new ResourceNotFoundException("Class template not found"));

        characterValidator.validateCharacter(request, template);

        Character character = modelMapper.map(request, Character.class);

        if (userEmail != null) {
            final Character finalCharacter = character;
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                finalCharacter.setUserId(user.getId());
                user.setTotalCharacters(user.getTotalCharacters() + 1);
                if (Boolean.TRUE.equals(request.getIsPublic())) {
                    user.setPublicCharacters(user.getPublicCharacters() + 1);
                }
                userRepository.save(user);
            });
        }

        character = characterRepository.save(character);

        return modelMapper.map(character, CharacterDTO.Response.class);
    }
    
    @Transactional
    public CharacterDTO.Response updateCharacter(String id, CharacterDTO.UpdateRequest request, String userEmail) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Character not found"));

        if (userEmail != null) {
            final Character finalCharacter = character;
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                if (!user.getId().equals(finalCharacter.getUserId())) {
                    throw new UnauthorizedException("Unauthorized to update this character");
                }
            });
        } else {
            if (character.getUserId() != null && !character.getUserId().isBlank()) {
                throw new UnauthorizedException("Must be logged in to update this character");
            }
        }

        if (request.getName() != null) character.setName(request.getName());
        if (request.getSpecies() != null) character.setSpecies(request.getSpecies());
        if (request.getDemeanor() != null) character.setDemeanor(request.getDemeanor());
        if (request.getDetails() != null) character.setDetails(request.getDetails());
        if (request.getAvatarImage() != null) character.setAvatarImage(request.getAvatarImage());
        if (request.getStats() != null) character.setStats(characterMapper.mapStats(request.getStats()));
        if (request.getBackground() != null) character.setBackground(characterMapper.mapBackground(request.getBackground()));
        if (request.getDrives() != null) character.setDrives(characterMapper.mapSelectedOptions(request.getDrives()));
        if (request.getNature() != null) character.setNature(characterMapper.mapSelectedOptions(request.getNature()));
        if (request.getMoves() != null) character.setMoves(characterMapper.mapSelectedOptions(request.getMoves()));
        if (request.getConnections() != null) character.setConnections(characterMapper.mapConnections(request.getConnections()));
        if (request.getWeaponSkills() != null) character.setWeaponSkills(characterMapper.mapWeaponSkills(request.getWeaponSkills()));
        if (request.getRoguishFeats() != null) character.setRoguishFeats(characterMapper.mapRoguishFeats(request.getRoguishFeats()));
        if (request.getEquipment() != null) character.setEquipment(request.getEquipment());
        if (request.getReputation() != null) character.setReputation(characterMapper.mapReputation(request.getReputation()));

        if (request.getIsPublic() != null && !request.getIsPublic().equals(character.getIsPublic())) {
            character.setIsPublic(request.getIsPublic());
            if (character.getUserId() != null && !character.getUserId().isBlank()) {
                userRepository.findById(character.getUserId()).ifPresent(user -> {
                    if (Boolean.TRUE.equals(request.getIsPublic())) {
                        user.setPublicCharacters(user.getPublicCharacters() + 1);
                    } else {
                        user.setPublicCharacters(Math.max(0, user.getPublicCharacters() - 1));
                    }
                    userRepository.save(user);
                });
            }
        }
        
        character = characterRepository.save(character);
        return modelMapper.map(character, CharacterDTO.Response.class);
    }
    
    @Transactional
    public void deleteCharacter(String id, String userEmail) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Character not found"));

        if (userEmail != null) {
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                if (!user.getId().equals(character.getUserId())) {
                    throw new UnauthorizedException("Unauthorized to delete this character");
                }
                user.setTotalCharacters(Math.max(0, user.getTotalCharacters() - 1));
                if (Boolean.TRUE.equals(character.getIsPublic())) {
                    user.setPublicCharacters(Math.max(0, user.getPublicCharacters() - 1));
                }
                userRepository.save(user);
            });
        } else {
            throw new UnauthorizedException("Must be logged in to delete character");
        }
        
        characterRepository.delete(character);
    }
    
    public List<CharacterDTO.CardResponse> getUserCharacters(String userEmail) {
        return userRepository.findByEmail(userEmail)
            .map(user -> {
                List<Character> characters = characterRepository.findByUserId(user.getId());
                Map<String, String> creatorNamesById = resolveCreatorNames(characters);
                return characters.stream()
                    .map(character -> mapToCardResponse(character, creatorNamesById, user.getId()))
                    .collect(Collectors.toList());
            })
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public CharacterDTO.CardResponse toggleLike(String characterId, String userEmail) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new ResourceNotFoundException("Character not found"));

        if (!Boolean.TRUE.equals(character.getIsPublic())) {
            throw new UnauthorizedException("Can only like public characters");
        }

        com.rpgcharacter.model.User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<String> likedByUserIds = character.getLikedByUserIds();
        if (likedByUserIds == null) likedByUserIds = new java.util.ArrayList<>();

        if (likedByUserIds.contains(user.getId())) {
            likedByUserIds.remove(user.getId());
            character.setLikeCount(Math.max(0, character.getLikeCount() - 1));
        } else {
            likedByUserIds.add(user.getId());
            character.setLikeCount(character.getLikeCount() + 1);
        }
        character.setLikedByUserIds(likedByUserIds);
        character = characterRepository.save(character);

        Map<String, String> creatorNamesById = resolveCreatorNames(java.util.List.of(character));
        return mapToCardResponse(character, creatorNamesById, user.getId());
    }
    
    public CharacterDTO.Response getCharacter(String id, String userEmail) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Character not found"));

        if (!Boolean.TRUE.equals(character.getIsPublic())) {
            if (character.getUserId() == null || character.getUserId().isBlank()) {
                return modelMapper.map(character, CharacterDTO.Response.class);
            }

            if (userEmail == null) {
                throw new UnauthorizedException("Character is private");
            }

            userRepository.findByEmail(userEmail).ifPresent(user -> {
                if (!user.getId().equals(character.getUserId())) {
                    throw new UnauthorizedException("Unauthorized to view this character");
                }
            });
        }
        
        return modelMapper.map(character, CharacterDTO.Response.class);
    }
    
    public Page<CharacterDTO.CardResponse> getPublicCharacters(Pageable pageable, String system, String className, String currentUserEmail) {
        Page<Character> characters;

        if (system != null && className != null) {
            characters = characterRepository.findByIsPublicTrueAndSystemAndClassName(system, className, pageable);
        } else if (system != null) {
            characters = characterRepository.findByIsPublicTrueAndSystem(system, pageable);
        } else if (className != null) {
            characters = characterRepository.findByIsPublicTrueAndClassName(className, pageable);
        } else {
            characters = characterRepository.findByIsPublicTrue(pageable);
        }

        String currentUserId = null;
        if (currentUserEmail != null) {
            currentUserId = userRepository.findByEmail(currentUserEmail)
                    .map(u -> u.getId())
                    .orElse(null);
        }

        final String finalCurrentUserId = currentUserId;
        Map<String, String> creatorNamesById = resolveCreatorNames(characters.getContent());
        return characters.map(character -> mapToCardResponse(character, creatorNamesById, finalCurrentUserId));
    }

    private CharacterDTO.CardResponse mapToCardResponse(Character character, Map<String, String> creatorNamesById, String currentUserId) {
        CharacterDTO.CardResponse cardResponse = modelMapper.map(character, CharacterDTO.CardResponse.class);

        String creatorName = "Anonymous";
        if (character.getUserId() != null && !character.getUserId().isBlank()) {
            creatorName = creatorNamesById.getOrDefault(character.getUserId(), "Unknown adventurer");
        }
        cardResponse.setCreatorName(creatorName);
        cardResponse.setLikeCount(character.getLikeCount());

        List<String> likedByUserIds = character.getLikedByUserIds();
        boolean likedByCurrentUser = currentUserId != null
                && likedByUserIds != null
                && likedByUserIds.contains(currentUserId);
        cardResponse.setLikedByCurrentUser(likedByCurrentUser);

        return cardResponse;
    }

    private Map<String, String> resolveCreatorNames(List<Character> characters) {
        Set<String> userIds = new HashSet<>();
        for (Character character : characters) {
            if (character.getUserId() != null && !character.getUserId().isBlank()) {
                userIds.add(character.getUserId());
            }
        }

        if (userIds.isEmpty()) {
            return Map.of();
        }

        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(
                        user -> user.getId(),
                        user -> user.getName() == null || user.getName().isBlank() ? "Unknown adventurer" : user.getName()
                ));
    }
    
}
