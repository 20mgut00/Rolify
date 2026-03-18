package com.rpgcharacter.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "characters")
// Indices compuestos para optimizar las consultas mas frecuentes (galeria publica, personajes del usuario)
@CompoundIndexes({
    @CompoundIndex(name = "public_system_class_idx", def = "{'isPublic': 1, 'system': 1, 'className': 1}"),
    @CompoundIndex(name = "public_created_idx", def = "{'isPublic': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "user_created_idx", def = "{'userId': 1, 'createdAt': -1}")
})
public class Character {

    @Id
    private String id;

    @Indexed
    // Nullable: null si el personaje fue creado por un usuario anonimo (modo invitado)
    private String userId;
    
    private String name;
    private String system;
    private String className;
    private String species;
    private String demeanor;
    private String details;
    private String avatarImage;

    private List<Stat> stats;
    private List<BackgroundAnswer> background;
    private List<SelectedOption> drives;
    private List<SelectedOption> nature;
    private List<SelectedOption> moves;
    private List<Connection> connections;
    private WeaponSkillsData weaponSkills;
    private RoguishFeatsData roguishFeats;
    private String equipment;
    private ReputationData reputation;

    @Builder.Default
    @Indexed
    private Boolean isPublic = false;

    @Builder.Default
    private int likeCount = 0;

    @Builder.Default
    private List<String> likedByUserIds = new java.util.ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
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
