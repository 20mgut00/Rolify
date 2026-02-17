package com.rpgcharacter.service;

import com.rpgcharacter.dto.CharacterDTO;
import com.rpgcharacter.model.Character;
import com.rpgcharacter.model.ClassTemplate;
import com.rpgcharacter.repository.CharacterRepository;
import com.rpgcharacter.repository.ClassTemplateRepository;
import com.rpgcharacter.repository.UserRepository;
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
    
    @Transactional
    public CharacterDTO.Response createCharacter(CharacterDTO.CreateRequest request, String userEmail) {
        // Validate class template exists
        ClassTemplate template = classTemplateRepository
                .findBySystemAndClassName(request.getSystem(), request.getClassName())
                .orElseThrow(() -> new RuntimeException("Class template not found"));

        // Validate character data against template
        validateCharacter(request, template);

        Character character = modelMapper.map(request, Character.class);

        // Set user if logged in
        if (userEmail != null) {
            final Character finalCharacter = character;
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                finalCharacter.setUserId(user.getId());

                // Update user statistics
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
                .orElseThrow(() -> new RuntimeException("Character not found"));

        // Verify ownership
        if (userEmail != null) {
            final Character finalCharacter = character;
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                if (!user.getId().equals(finalCharacter.getUserId())) {
                    throw new RuntimeException("Unauthorized to update this character");
                }
            });
        } else {
            if (character.getUserId() != null && !character.getUserId().isBlank()) {
                throw new RuntimeException("Must be logged in to update this character");
            }
        }
        
        // Update fields
        if (request.getName() != null) character.setName(request.getName());
        if (request.getSpecies() != null) character.setSpecies(request.getSpecies());
        if (request.getDemeanor() != null) character.setDemeanor(request.getDemeanor());
        if (request.getDetails() != null) character.setDetails(request.getDetails());
        if (request.getAvatarImage() != null) character.setAvatarImage(request.getAvatarImage());
        if (request.getStats() != null) character.setStats(mapStats(request.getStats()));
        if (request.getBackground() != null) character.setBackground(mapBackground(request.getBackground()));
        if (request.getDrives() != null) character.setDrives(mapSelectedOptions(request.getDrives()));
        if (request.getNature() != null) character.setNature(mapSelectedOptions(request.getNature()));
        if (request.getMoves() != null) character.setMoves(mapSelectedOptions(request.getMoves()));
        if (request.getConnections() != null) character.setConnections(mapConnections(request.getConnections()));
        if (request.getWeaponSkills() != null) character.setWeaponSkills(mapWeaponSkills(request.getWeaponSkills()));
        if (request.getRoguishFeats() != null) character.setRoguishFeats(mapRoguishFeats(request.getRoguishFeats()));
        if (request.getEquipment() != null) character.setEquipment(request.getEquipment());
        if (request.getReputation() != null) character.setReputation(mapReputation(request.getReputation()));
        
        // Update public status
        if (request.getIsPublic() != null && !request.getIsPublic().equals(character.getIsPublic())) {
            character.setIsPublic(request.getIsPublic());
            
            // Update user statistics
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
                .orElseThrow(() -> new RuntimeException("Character not found"));
        
        // Verify ownership
        if (userEmail != null) {
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                if (!user.getId().equals(character.getUserId())) {
                    throw new RuntimeException("Unauthorized to delete this character");
                }
                
                // Update user statistics
                user.setTotalCharacters(Math.max(0, user.getTotalCharacters() - 1));
                if (Boolean.TRUE.equals(character.getIsPublic())) {
                    user.setPublicCharacters(Math.max(0, user.getPublicCharacters() - 1));
                }
                userRepository.save(user);
            });
        } else {
            throw new RuntimeException("Must be logged in to delete character");
        }
        
        characterRepository.delete(character);
    }
    
    public List<CharacterDTO.CardResponse> getUserCharacters(String userEmail) {
        return userRepository.findByEmail(userEmail)
            .map(user -> {
                List<Character> characters = characterRepository.findByUserId(user.getId());
                Map<String, String> creatorNamesById = resolveCreatorNames(characters);
                return characters.stream()
                    .map(character -> mapToCardResponse(character, creatorNamesById))
                    .collect(Collectors.toList());
            })
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public CharacterDTO.Response getCharacter(String id, String userEmail) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Character not found"));
        
        // Check if user can access this character
        if (!Boolean.TRUE.equals(character.getIsPublic())) {
            if (character.getUserId() == null || character.getUserId().isBlank()) {
                return modelMapper.map(character, CharacterDTO.Response.class);
            }

            if (userEmail == null) {
                throw new RuntimeException("Character is private");
            }
            
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                if (!user.getId().equals(character.getUserId())) {
                    throw new RuntimeException("Unauthorized to view this character");
                }
            });
        }
        
        return modelMapper.map(character, CharacterDTO.Response.class);
    }
    
    public Page<CharacterDTO.CardResponse> getPublicCharacters(Pageable pageable, String system, String className) {
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
        
        Map<String, String> creatorNamesById = resolveCreatorNames(characters.getContent());
        return characters.map(character -> mapToCardResponse(character, creatorNamesById));
    }

    private CharacterDTO.CardResponse mapToCardResponse(Character character, Map<String, String> creatorNamesById) {
        CharacterDTO.CardResponse cardResponse = modelMapper.map(character, CharacterDTO.CardResponse.class);

        String creatorName = "Anonymous";
        if (character.getUserId() != null && !character.getUserId().isBlank()) {
            creatorName = creatorNamesById.getOrDefault(character.getUserId(), "Unknown adventurer");
        }

        cardResponse.setCreatorName(creatorName);
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
    
    private void validateCharacter(CharacterDTO.CreateRequest request, ClassTemplate template) {
        // Validate drives count
        if (request.getDrives() != null) {
            long selectedDrives = request.getDrives().stream()
                    .filter(CharacterDTO.SelectedOptionDTO::getSelected)
                    .count();
            if (template.getMaxDrives() != null && selectedDrives > template.getMaxDrives()) {
                throw new RuntimeException("Too many drives selected. Max: " + template.getMaxDrives());
            }
        }
        
        // Validate moves count
        if (request.getMoves() != null) {
            long selectedMoves = request.getMoves().stream()
                    .filter(CharacterDTO.SelectedOptionDTO::getSelected)
                    .count();
            if (template.getMaxMoves() != null && selectedMoves > template.getMaxMoves()) {
                throw new RuntimeException("Too many moves selected. Max: " + template.getMaxMoves());
            }
        }
        
        // Validate nature count
        if (request.getNature() != null) {
            long selectedNature = request.getNature().stream()
                    .filter(CharacterDTO.SelectedOptionDTO::getSelected)
                    .count();
            if (template.getMaxNature() != null && selectedNature > template.getMaxNature()) {
                throw new RuntimeException("Too many nature options selected. Max: " + template.getMaxNature());
            }
        }
    }
    
    // Helper mapping methods
    private List<Character.Stat> mapStats(List<CharacterDTO.StatDTO> stats) {
        return stats.stream()
                .map(s -> new Character.Stat(s.getName(), s.getValue()))
                .collect(Collectors.toList());
    }
    
    private List<Character.BackgroundAnswer> mapBackground(List<CharacterDTO.BackgroundAnswerDTO> background) {
        return background.stream()
                .map(b -> new Character.BackgroundAnswer(b.getQuestion(), b.getAnswer()))
                .collect(Collectors.toList());
    }
    
    private List<Character.SelectedOption> mapSelectedOptions(List<CharacterDTO.SelectedOptionDTO> options) {
        return options.stream()
                .map(o -> new Character.SelectedOption(o.getName(), o.getDescription(), o.getSelected()))
                .collect(Collectors.toList());
    }
    
    private List<Character.Connection> mapConnections(List<CharacterDTO.ConnectionDTO> connections) {
        return connections.stream()
                .map(c -> new Character.Connection(c.getType(), c.getCharacterName(), c.getDescription(), c.getStory()))
                .collect(Collectors.toList());
    }
    
    private Character.WeaponSkillsData mapWeaponSkills(CharacterDTO.WeaponSkillsDTO dto) {
        List<Character.WeaponSkillsData.Skill> skills = dto.getSkills().stream()
                .map(s -> new Character.WeaponSkillsData.Skill(s.getName(), s.getDescription(), s.getSelected()))
                .collect(Collectors.toList());
        return new Character.WeaponSkillsData(dto.getRemaining(), skills);
    }
    
    private Character.RoguishFeatsData mapRoguishFeats(CharacterDTO.RoguishFeatsDTO dto) {
        List<Character.RoguishFeatsData.Feat> feats = dto.getFeats().stream()
                .map(f -> new Character.RoguishFeatsData.Feat(f.getName(), f.getDescription(), f.getSelected()))
                .collect(Collectors.toList());
        return new Character.RoguishFeatsData(dto.getRemaining(), feats);
    }
    
    // Equipment is now a simple String field, no mapping needed
    
    private Character.ReputationData mapReputation(CharacterDTO.ReputationDTO dto) {
        return new Character.ReputationData(
                dto.getFactions().entrySet().stream()
                        .collect(Collectors.toMap(
                                e -> e.getKey(),
                                e -> new Character.ReputationData.FactionReputation(
                                        e.getValue().getPrestige(),
                                        e.getValue().getNotoriety()
                                )
                        ))
        );
    }
}
