package com.rpgcharacter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class GenerateCharacterDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "System is required")
        private String system;

        @NotBlank(message = "Class name is required")
        private String className;

        @Size(max = 1000, message = "Prompt cannot exceed 1000 characters")
        private String prompt; // Optional additional context from user
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private String name;
        private String species;
        private String demeanor;
        private String details;
        private String equipment;
        // The service will also return selected options for drives, nature, moves, etc.
        // These will match the structure expected by the frontend
    }
}
