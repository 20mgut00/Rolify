package com.rpgcharacter.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rpgcharacter.model.ClassTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class GeminiService {

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.model}")
    private String model;

    @Value("${app.gemini.api-url}")
    private String apiUrl;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public GeminiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public Map<String, Object> generateCharacter(ClassTemplate classTemplate, String additionalPrompt, String language) {
        try {
            if (apiKey == null || apiKey.isBlank()) {
                throw new IllegalStateException("AI generation is not configured. Missing GEMINI_API_KEY.");
            }

            String prompt = buildPrompt(classTemplate, additionalPrompt, language);
            String response = callGeminiAPI(prompt);
            return parseCharacterResponse(response, classTemplate);
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error generating character with Gemini API", e);

            String errorMessage = e.getMessage() != null ? e.getMessage() : "Unknown Gemini API error";
            if (errorMessage.contains("API_KEY_INVALID") || errorMessage.contains("API key not valid")) {
                throw new IllegalStateException("Invalid GEMINI_API_KEY configured for AI generation.");
            }

            throw new RuntimeException("Failed to generate character: " + e.getMessage());
        }
    }

    private String buildPrompt(ClassTemplate classTemplate, String additionalPrompt, String language) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a detailed RPG character for the game system '").append(classTemplate.getSystem()).append("'.\n");
        prompt.append("Class: ").append(classTemplate.getClassName()).append("\n");
        prompt.append("Description: ").append(classTemplate.getDescription()).append("\n\n");
        prompt.append("IMPORTANT: Be highly creative and unique with the character name. Avoid common/overused names like 'Pip', 'Bramble', 'Thistle', etc. ");
        prompt.append("Use a random seed of ").append(System.currentTimeMillis() % 10000).append(" to inspire uniqueness. ");
        prompt.append("Think of unusual, memorable names that feel fresh and original.\n\n");

        prompt.append("Please generate the following fields in JSON format:\n");
        prompt.append("{\n");
        prompt.append("  \"name\": \"character name\",\n");
        prompt.append("  \"species\": \"character species\",\n");
        prompt.append("  \"demeanor\": \"character demeanor/personality\",\n");
        prompt.append("  \"details\": \"physical appearance details\",\n");
        prompt.append("  \"equipment\": \"starting equipment description\",\n");

        // Add nature selection
        if (classTemplate.getNature() != null && !classTemplate.getNature().isEmpty()) {
            prompt.append("  \"nature\": \"").append(getOptionNames(classTemplate.getNature())).append(" (select one)\",\n");
        }

        // Add drives selection
        if (classTemplate.getDrives() != null && !classTemplate.getDrives().isEmpty()) {
            int maxDrives = classTemplate.getMaxDrives() != null ? classTemplate.getMaxDrives() : 2;
            prompt.append("  \"drives\": [\"").append(getOptionNames(classTemplate.getDrives())).append(" (select ").append(maxDrives).append(")\"],\n");
        }

        // Add moves selection
        if (classTemplate.getMoves() != null && !classTemplate.getMoves().isEmpty()) {
            int maxMoves = classTemplate.getMaxMoves() != null ? classTemplate.getMaxMoves() : 3;
            prompt.append("  \"moves\": [\"").append(getOptionNames(classTemplate.getMoves())).append(" (select ").append(maxMoves).append(")\"],\n");
        }

        // Add background answers
        if (classTemplate.getBackground() != null && !classTemplate.getBackground().isEmpty()) {
            prompt.append("  \"background\": [\n");
            for (ClassTemplate.BackgroundQuestion q : classTemplate.getBackground()) {
                prompt.append("    {\"question\": \"").append(q.getName()).append("\", \"answer\": \"EXACTLY one of: ")
                      .append(String.join(", ", q.getAnswers())).append(" (copy the exact text, do NOT modify or translate)\"},\n");
            }
            prompt.append("  ],\n");
        }

        // Add connections
        if (classTemplate.getConnections() != null && !classTemplate.getConnections().isEmpty()) {
            prompt.append("  \"connections\": [\n");
            for (ClassTemplate.Connection conn : classTemplate.getConnections()) {
                prompt.append("    {\"name\": \"").append(conn.getName()).append("\", \"description\": \"").append(conn.getDescription()).append("\", \"answer\": \"fill this\"},\n");
            }
            prompt.append("  ],\n");
        }

        // Add stats (user must select +1 to one stat, max +2)
        if (classTemplate.getStats() != null && !classTemplate.getStats().isEmpty()) {
            prompt.append("  \"stats\": [\n");
            for (ClassTemplate.StatTemplate stat : classTemplate.getStats()) {
                String statName = stat.getName();
                Integer defaultValue = stat.getValue() != null ? stat.getValue() : 0;
                prompt.append("    {\"name\": \"").append(statName).append("\", \"value\": ").append(defaultValue).append("},\n");
            }
            prompt.append("  ],\n");
            prompt.append("  \"selectedStat\": \"<select ONE stat from the above to add +1, ensuring it doesn't exceed +2>\",\n");
        }

        // Add roguish feats (only if remaining > 0)
        if (classTemplate.getRoguishFeats() != null && classTemplate.getRoguishFeats().getFeats() != null) {
            int remaining = classTemplate.getRoguishFeats().getRemaining();
            if (remaining > 0) {
                prompt.append("  \"roguishFeats\": [\"").append(getFeatNames(classTemplate.getRoguishFeats().getFeats())).append(" (select ").append(remaining).append(")\"],\n");
            }
        }

        // Add weapon skills (only selectable ones from database)
        if (classTemplate.getWeaponSkills() != null && classTemplate.getWeaponSkills().getSkills() != null) {
            int remaining = classTemplate.getWeaponSkills().getRemaining();
            // Only include skills that are selectable (selected: true means they come from DB and are selectable)
            List<ClassTemplate.WeaponSkillsTemplate.Skill> selectableSkills = classTemplate.getWeaponSkills().getSkills().stream()
                    .filter(skill -> skill.getSelected())
                    .collect(Collectors.toList());

            if (!selectableSkills.isEmpty() && remaining > 0) {
                prompt.append("  \"weaponSkills\": [\"").append(getSkillNames(selectableSkills)).append(" (select ").append(remaining).append(")\"],\n");
            }
        }

        prompt.append("}\n\n");

        if (additionalPrompt != null && !additionalPrompt.isEmpty()) {
            prompt.append("Additional context: ").append(additionalPrompt).append("\n");
        }

        if (language != null && !language.isBlank()) {
            prompt.append("\nIMPORTANT: Generate ALL text content (name, species, demeanor, details, equipment) in the '").append(language).append("' language. Option names like natures, drives, moves, roguish feats, weapon skills, and background answers must remain EXACTLY as provided above (do NOT translate them).\n");
        }

        prompt.append("\nIMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or extra text. The response must be parseable as JSON.");

        return prompt.toString();
    }

    private String getOptionNames(List<ClassTemplate.Option> options) {
        return options.stream()
                .map(ClassTemplate.Option::getName)
                .collect(Collectors.joining(", "));
    }

    private String getFeatNames(List<ClassTemplate.RoguishFeatsTemplate.Feat> feats) {
        return feats.stream()
                .map(ClassTemplate.RoguishFeatsTemplate.Feat::getName)
                .collect(Collectors.joining(", "));
    }

    private String getSkillNames(List<ClassTemplate.WeaponSkillsTemplate.Skill> skills) {
        return skills.stream()
                .map(ClassTemplate.WeaponSkillsTemplate.Skill::getName)
                .collect(Collectors.joining(", "));
    }

    private String callGeminiAPI(String prompt) throws Exception {
        String url = apiUrl + "/" + model + ":generateContent";

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        Map<String, String> part = new HashMap<>();
        part.put("text", prompt);
        content.put("parts", List.of(part));
        requestBody.put("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-goog-api-key", apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

        if (response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("Gemini API returned status: " + response.getStatusCode());
        }

        // Extract text from response
        JsonNode root = objectMapper.readTree(response.getBody());
        JsonNode candidates = root.path("candidates");
        if (candidates.isArray() && candidates.size() > 0) {
            JsonNode contentNode = candidates.get(0).path("content");
            JsonNode parts = contentNode.path("parts");
            if (parts.isArray() && parts.size() > 0) {
                String text = parts.get(0).path("text").asText();
                // Clean up markdown code blocks if present
                text = text.replaceAll("```json\\n?", "").replaceAll("```\\n?", "").trim();
                return text;
            }
        }

        throw new RuntimeException("Invalid response format from Gemini API");
    }

    private Map<String, Object> parseCharacterResponse(String response, ClassTemplate classTemplate) {
        try {
            // Parse the JSON response from Gemini
            JsonNode jsonResponse = objectMapper.readTree(response);

            Map<String, Object> result = new HashMap<>();

            // Basic fields
            result.put("name", jsonResponse.path("name").asText(""));
            result.put("species", jsonResponse.path("species").asText(""));
            result.put("demeanor", jsonResponse.path("demeanor").asText(""));
            result.put("details", jsonResponse.path("details").asText(""));
            result.put("equipment", jsonResponse.path("equipment").asText(""));

            // Parse nature
            if (jsonResponse.has("nature")) {
                String natureName = jsonResponse.path("nature").asText();
                result.put("nature", findMatchingOption(classTemplate.getNature(), natureName));
            }

            // Parse drives
            if (jsonResponse.has("drives")) {
                List<Map<String, Object>> drives = new ArrayList<>();
                JsonNode drivesNode = jsonResponse.path("drives");
                if (drivesNode.isArray()) {
                    for (JsonNode driveNode : drivesNode) {
                        String driveName = driveNode.asText();
                        ClassTemplate.Option option = findOptionByName(classTemplate.getDrives(), driveName);
                        if (option != null) {
                            drives.add(Map.of("name", option.getName(), "description", option.getDescription()));
                        }
                    }
                }
                result.put("drives", drives);
            }

            // Parse moves
            if (jsonResponse.has("moves")) {
                List<Map<String, Object>> moves = new ArrayList<>();
                JsonNode movesNode = jsonResponse.path("moves");
                if (movesNode.isArray()) {
                    for (JsonNode moveNode : movesNode) {
                        String moveName = moveNode.asText();
                        ClassTemplate.Option option = findOptionByName(classTemplate.getMoves(), moveName);
                        if (option != null) {
                            moves.add(Map.of("name", option.getName(), "description", option.getDescription()));
                        }
                    }
                }
                result.put("moves", moves);
            }

            // Parse background - validate answers against template options
            if (jsonResponse.has("background") && classTemplate.getBackground() != null) {
                List<Map<String, String>> background = new ArrayList<>();
                JsonNode backgroundNode = jsonResponse.path("background");
                if (backgroundNode.isArray()) {
                    for (int i = 0; i < backgroundNode.size() && i < classTemplate.getBackground().size(); i++) {
                        JsonNode answerNode = backgroundNode.get(i);
                        ClassTemplate.BackgroundQuestion templateQuestion = classTemplate.getBackground().get(i);
                        String aiAnswer = answerNode.path("answer").asText("");

                        // Match against valid template answers (case-insensitive)
                        String matchedAnswer = templateQuestion.getAnswers().stream()
                                .filter(a -> a.equalsIgnoreCase(aiAnswer.trim()))
                                .findFirst()
                                .orElse(aiAnswer);

                        background.add(Map.of(
                            "question", templateQuestion.getName(),
                            "answer", matchedAnswer
                        ));
                    }
                }
                result.put("background", background);
            }

            // Parse connections
            if (jsonResponse.has("connections")) {
                List<Map<String, String>> connections = new ArrayList<>();
                JsonNode connectionsNode = jsonResponse.path("connections");
                if (connectionsNode.isArray()) {
                    for (JsonNode connNode : connectionsNode) {
                        connections.add(Map.of(
                            "name", connNode.path("name").asText(""),
                            "answer", connNode.path("answer").asText("")
                        ));
                    }
                }
                result.put("connections", connections);
            }

            // Parse stats and selectedStat
            if (jsonResponse.has("stats")) {
                List<Map<String, Object>> stats = new ArrayList<>();
                JsonNode statsNode = jsonResponse.path("stats");
                String selectedStat = jsonResponse.path("selectedStat").asText("");

                if (statsNode.isArray()) {
                    for (JsonNode statNode : statsNode) {
                        String statName = statNode.path("name").asText("");
                        int baseValue = statNode.path("value").asInt(0);

                        // Add +1 to the selected stat (if this is the one)
                        int finalValue = baseValue;
                        if (!selectedStat.isEmpty() && statName.equalsIgnoreCase(selectedStat) && baseValue < 2) {
                            finalValue = baseValue + 1;
                        }

                        stats.add(Map.of(
                            "name", statName,
                            "value", finalValue
                        ));
                    }
                }
                result.put("stats", stats);
            }

            // Parse roguish feats
            if (jsonResponse.has("roguishFeats") && classTemplate.getRoguishFeats() != null) {
                List<Map<String, Object>> feats = new ArrayList<>();
                JsonNode featsNode = jsonResponse.path("roguishFeats");
                if (featsNode.isArray()) {
                    for (JsonNode featNode : featsNode) {
                        String featName = featNode.asText();
                        ClassTemplate.RoguishFeatsTemplate.Feat feat = findFeatByName(classTemplate.getRoguishFeats().getFeats(), featName);
                        if (feat != null) {
                            feats.add(Map.of("name", feat.getName(), "description", feat.getDescription()));
                        }
                    }
                }
                result.put("roguishFeats", feats);
            }

            // Parse weapon skills (only accept selectable ones)
            if (jsonResponse.has("weaponSkills") && classTemplate.getWeaponSkills() != null) {
                List<Map<String, Object>> skills = new ArrayList<>();
                JsonNode skillsNode = jsonResponse.path("weaponSkills");
                if (skillsNode.isArray()) {
                    for (JsonNode skillNode : skillsNode) {
                        String skillName = skillNode.asText();
                        ClassTemplate.WeaponSkillsTemplate.Skill skill = findSkillByName(classTemplate.getWeaponSkills().getSkills(), skillName);
                        if (skill != null && skill.getSelected()) {
                            skills.add(Map.of("name", skill.getName(), "description", skill.getDescription()));
                        } else if (skill != null) {
                            log.warn("Gemini returned non-selectable weapon skill: {}", skillName);
                        } else {
                            log.warn("Gemini returned unknown weapon skill: {}", skillName);
                        }
                    }
                }
                result.put("weaponSkills", skills);
            }

            return result;
        } catch (Exception e) {
            log.error("Error parsing Gemini response", e);
            throw new RuntimeException("Failed to parse character data: " + e.getMessage());
        }
    }

    private Map<String, Object> findMatchingOption(List<ClassTemplate.Option> options, String name) {
        ClassTemplate.Option option = findOptionByName(options, name);
        if (option != null) {
            return Map.of("name", option.getName(), "description", option.getDescription());
        }
        return Map.of("name", "", "description", "");
    }

    private ClassTemplate.Option findOptionByName(List<ClassTemplate.Option> options, String name) {
        if (options == null || name == null) return null;
        return options.stream()
                .filter(o -> o.getName().equalsIgnoreCase(name.trim()))
                .findFirst()
                .orElse(null);
    }

    private ClassTemplate.RoguishFeatsTemplate.Feat findFeatByName(List<ClassTemplate.RoguishFeatsTemplate.Feat> feats, String name) {
        if (feats == null || name == null) return null;
        return feats.stream()
                .filter(f -> f.getName().equalsIgnoreCase(name.trim()))
                .findFirst()
                .orElse(null);
    }

    private ClassTemplate.WeaponSkillsTemplate.Skill findSkillByName(List<ClassTemplate.WeaponSkillsTemplate.Skill> skills, String name) {
        if (skills == null || name == null) return null;
        return skills.stream()
                .filter(s -> s.getName().equalsIgnoreCase(name.trim()))
                .findFirst()
                .orElse(null);
    }
}
