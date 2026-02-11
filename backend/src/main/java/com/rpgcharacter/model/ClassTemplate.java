package com.rpgcharacter.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "class_templates")
public class ClassTemplate {
    
    @Id
    private String id;
    
    private String system; // "Root"
    private String className; // "Adventurer", "Arbiter", etc.
    private String description;
    
    private List<BackgroundQuestion> background;
    private List<Option> nature;
    private List<Option> drives;
    private List<Connection> connections;
    private RoguishFeatsTemplate roguishFeats;
    private WeaponSkillsTemplate weaponSkills;
    private List<StatTemplate> stats;
    private List<Option> moves;
    
    // Configuration
    private Integer maxDrives;
    private Integer maxMoves;
    private Integer maxNature;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BackgroundQuestion {
        private String name;
        private List<String> answers;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Option {
        private String name;
        private String description;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Connection {
        private String name;
        private String description;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoguishFeatsTemplate {
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
    public static class WeaponSkillsTemplate {
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
    public static class StatTemplate {
        private String name;
        private Integer value;
    }
}
