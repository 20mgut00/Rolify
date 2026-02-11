package com.rpgcharacter.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "characters")
public class Character {
    
    @Id
    private String id;
    
    private String userId; // Null if not logged in
    
    // Basic Info
    private String name;
    private String system; // "Root", etc.
    private String className;
    private String species;
    private String demeanor;
    private String details;
    private String avatarImage; // Base64 or URL
    
    // Character specific data (flexible structure)
    private List<Stat> stats;
    private List<BackgroundAnswer> background;
    private List<SelectedOption> drives;
    private List<SelectedOption> nature;
    private List<SelectedOption> moves;
    private List<Connection> connections;
    private WeaponSkillsData weaponSkills;
    private RoguishFeatsData roguishFeats;
    private EquipmentData equipment;
    private ReputationData reputation;
    
    // Metadata
    @Builder.Default
    private Boolean isPublic = false;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Nested classes
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Stat {
        private String name;
        private Integer value;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BackgroundAnswer {
        private String question;
        private String answer;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SelectedOption {
        private String name;
        private String description;
        private Boolean selected;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Connection {
        private String type;
        private String characterName;
        private String description;
        private String story;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeaponSkillsData {
        private Integer remaining;
        private List<Skill> skills;
        
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Skill {
            private String name;
            private String description;
            private Boolean selected;
        }
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoguishFeatsData {
        private Integer remaining;
        private List<Feat> feats;
        
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Feat {
            private String name;
            private String description;
            private Boolean selected;
        }
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentData {
        private Integer startingValue;
        private Integer carrying;
        private Integer burdened;
        private Integer max;
        private List<Item> items;
        
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Item {
            private String name;
            private Integer value;
            private Integer wear;
        }
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReputationData {
        private Map<String, FactionReputation> factions;
        
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class FactionReputation {
            private Integer prestige;
            private Integer notoriety;
        }
    }
}
