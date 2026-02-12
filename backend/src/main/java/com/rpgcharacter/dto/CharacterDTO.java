package com.rpgcharacter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class CharacterDTO {
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Name is required")
        private String name;
        
        @NotBlank(message = "System is required")
        private String system;
        
        @NotBlank(message = "Class name is required")
        private String className;
        
        private String species;
        private String demeanor;
        private String details;
        private String avatarImage;
        private List<StatDTO> stats;
        private List<BackgroundAnswerDTO> background;
        private List<SelectedOptionDTO> drives;
        private List<SelectedOptionDTO> nature;
        private List<SelectedOptionDTO> moves;
        private List<ConnectionDTO> connections;
        private WeaponSkillsDTO weaponSkills;
        private RoguishFeatsDTO roguishFeats;
        private String equipment;  // Changed from EquipmentDTO to String for simplicity
        private ReputationDTO reputation;
        private Boolean isPublic;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String name;
        private String species;
        private String demeanor;
        private String details;
        private String avatarImage;
        private List<StatDTO> stats;
        private List<BackgroundAnswerDTO> background;
        private List<SelectedOptionDTO> drives;
        private List<SelectedOptionDTO> nature;
        private List<SelectedOptionDTO> moves;
        private List<ConnectionDTO> connections;
        private WeaponSkillsDTO weaponSkills;
        private RoguishFeatsDTO roguishFeats;
        private String equipment;  // Changed from EquipmentDTO to String for simplicity
        private ReputationDTO reputation;
        private Boolean isPublic;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String id;
        private String userId;
        private String name;
        private String system;
        private String className;
        private String species;
        private String demeanor;
        private String details;
        private String avatarImage;
        private List<StatDTO> stats;
        private List<BackgroundAnswerDTO> background;
        private List<SelectedOptionDTO> drives;
        private List<SelectedOptionDTO> nature;
        private List<SelectedOptionDTO> moves;
        private List<ConnectionDTO> connections;
        private WeaponSkillsDTO weaponSkills;
        private RoguishFeatsDTO roguishFeats;
        private String equipment;  // Changed from EquipmentDTO to String for simplicity
        private ReputationDTO reputation;
        private Boolean isPublic;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CardResponse {
        private String id;
        private String name;
        private String system;
        private String className;
        private String species;
        private String avatarImage;
        private Boolean isPublic;
        private LocalDateTime createdAt;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatDTO {
        private String name;
        private Integer value;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BackgroundAnswerDTO {
        private String question;
        private String answer;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SelectedOptionDTO {
        private String name;
        private String description;
        private Boolean selected;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConnectionDTO {
        private String type;
        private String characterName;
        private String description;
        private String story;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeaponSkillsDTO {
        private Integer remaining;
        private List<SkillDTO> skills;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillDTO {
        private String name;
        private String description;
        private Boolean selected;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoguishFeatsDTO {
        private Integer remaining;
        private List<FeatDTO> feats;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeatDTO {
        private String name;
        private String description;
        private Boolean selected;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentDTO {
        private Integer startingValue;
        private Integer carrying;
        private Integer burdened;
        private Integer max;
        private List<ItemDTO> items;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemDTO {
        private String name;
        private Integer value;
        private Integer wear;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReputationDTO {
        private java.util.Map<String, FactionReputationDTO> factions;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FactionReputationDTO {
        private Integer prestige;
        private Integer notoriety;
    }
}
