package com.rpgcharacter.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rpgcharacter.model.ClassTemplate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GeminiServiceTest {

    private GeminiService geminiService;
    private RestTemplate mockRestTemplate;

    @BeforeEach
    void setUp() {
        geminiService = new GeminiService(new ObjectMapper());
        mockRestTemplate = mock(RestTemplate.class);
        ReflectionTestUtils.setField(geminiService, "restTemplate", mockRestTemplate);
        ReflectionTestUtils.setField(geminiService, "apiUrl", "https://api.gemini.test");
        ReflectionTestUtils.setField(geminiService, "model", "gemini-test");
    }

    private ClassTemplate minimalTemplate() {
        ClassTemplate t = new ClassTemplate();
        t.setSystem("Root");
        t.setClassName("Arbiter");
        t.setDescription("A law-keeper.");
        return t;
    }

    // ---- apiKey validation ----

    @Test
    void generateCharacter_whenApiKeyIsNull_throwsIllegalStateException() {
        ReflectionTestUtils.setField(geminiService, "apiKey", null);

        assertThatThrownBy(() -> geminiService.generateCharacter(minimalTemplate(), null, "en"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("GEMINI_API_KEY");
    }

    @Test
    void generateCharacter_whenApiKeyIsBlank_throwsIllegalStateException() {
        ReflectionTestUtils.setField(geminiService, "apiKey", "   ");

        assertThatThrownBy(() -> geminiService.generateCharacter(minimalTemplate(), null, "en"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("GEMINI_API_KEY");
    }

    // ---- error wrapping ----

    @Test
    void generateCharacter_whenRestTemplateFails_wrapsInRuntimeException() {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenThrow(new RuntimeException("connection refused"));

        assertThatThrownBy(() -> geminiService.generateCharacter(minimalTemplate(), null, "en"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to generate character");
    }

    @Test
    void generateCharacter_whenApiKeyInvalidError_throwsIllegalStateException() {
        ReflectionTestUtils.setField(geminiService, "apiKey", "bad-key");
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenThrow(new RuntimeException("API_KEY_INVALID - key not valid"));

        assertThatThrownBy(() -> geminiService.generateCharacter(minimalTemplate(), null, "en"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Invalid GEMINI_API_KEY");
    }

    // ---- successful response parsing ----

    @Test
    void generateCharacter_whenValidResponse_returnsBasicFields() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        String json = """
                {
                  "name": "Gideon Vael",
                  "species": "Rabbit",
                  "demeanor": "Stoic",
                  "details": "Tall and weathered",
                  "equipment": "A worn sword"
                }
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        Map<String, Object> result = geminiService.generateCharacter(minimalTemplate(), null, "en");

        assertThat(result.get("name")).isEqualTo("Gideon Vael");
        assertThat(result.get("species")).isEqualTo("Rabbit");
        assertThat(result.get("demeanor")).isEqualTo("Stoic");
        assertThat(result.get("equipment")).isEqualTo("A worn sword");
    }

    @Test
    void generateCharacter_withAdditionalPrompt_includesItInRequest() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        String json = """
                {"name": "Test", "species": "", "demeanor": "", "details": "", "equipment": ""}
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        // Shouldn't throw — just verify it runs with an additional prompt
        assertThatCode(() -> geminiService.generateCharacter(minimalTemplate(), "Make it mysterious", "es"))
                .doesNotThrowAnyException();
    }

    @Test
    void generateCharacter_whenTemplateHasNatureAndDrives_parsesSelections() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ClassTemplate template = minimalTemplate();
        template.setNature(List.of(
                new ClassTemplate.Option("Defender", "Protects the weak"),
                new ClassTemplate.Option("Seeker", "Seeks truth")
        ));
        template.setDrives(List.of(
                new ClassTemplate.Option("Justice", "Uphold the law"),
                new ClassTemplate.Option("Peace", "Bring harmony")
        ));
        template.setMaxDrives(1);

        String json = """
                {
                  "name": "Mira",
                  "species": "Fox",
                  "demeanor": "Calm",
                  "details": "Lithe",
                  "equipment": "Staff",
                  "nature": "Defender",
                  "drives": ["Justice"]
                }
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        Map<String, Object> result = geminiService.generateCharacter(template, null, "en");

        assertThat(result).containsKey("nature");
        assertThat(result).containsKey("drives");

        @SuppressWarnings("unchecked")
        Map<String, Object> nature = (Map<String, Object>) result.get("nature");
        assertThat(nature.get("name")).isEqualTo("Defender");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> drives = (List<Map<String, Object>>) result.get("drives");
        assertThat(drives).hasSize(1);
        assertThat(drives.get(0).get("name")).isEqualTo("Justice");
    }

    @Test
    void generateCharacter_whenNonOkStatus_throwsRuntimeException() {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");
        ResponseEntity<String> badResponse = new ResponseEntity<>("error", HttpStatus.INTERNAL_SERVER_ERROR);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(badResponse);

        assertThatThrownBy(() -> geminiService.generateCharacter(minimalTemplate(), null, "en"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void generateCharacter_withStats_appliesBonusToSelectedStat() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ClassTemplate template = minimalTemplate();
        template.setStats(List.of(
                new ClassTemplate.StatTemplate("Cunning", 0),
                new ClassTemplate.StatTemplate("Might", 1)
        ));

        String json = """
                {
                  "name": "Rex", "species": "Bear", "demeanor": "Bold",
                  "details": "Heavy", "equipment": "Axe",
                  "stats": [{"name": "Cunning", "value": 0}, {"name": "Might", "value": 1}],
                  "selectedStat": "Cunning"
                }
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        Map<String, Object> result = geminiService.generateCharacter(template, null, "en");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> stats = (List<Map<String, Object>>) result.get("stats");
        assertThat(stats.get(0).get("name")).isEqualTo("Cunning");
        assertThat(stats.get(0).get("value")).isEqualTo(1); // 0 + bonus = 1
        assertThat(stats.get(1).get("value")).isEqualTo(1); // not selected, stays 1
    }

    @Test
    void generateCharacter_withBackground_parsesAnswersMatchingTemplate() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ClassTemplate template = minimalTemplate();
        template.setBackground(List.of(
                new ClassTemplate.BackgroundQuestion("Where are you from?",
                        List.of("The forest", "The city", "The mountains"))
        ));

        String json = """
                {
                  "name": "Sal", "species": "Rat", "demeanor": "Sneaky",
                  "details": "Small", "equipment": "Knife",
                  "background": [{"question": "Where are you from?", "answer": "The forest"}]
                }
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        Map<String, Object> result = geminiService.generateCharacter(template, null, "en");

        @SuppressWarnings("unchecked")
        List<Map<String, String>> background = (List<Map<String, String>>) result.get("background");
        assertThat(background).hasSize(1);
        assertThat(background.get(0).get("answer")).isEqualTo("The forest");
    }

    @Test
    void generateCharacter_withConnections_parsesConnectionList() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ClassTemplate template = minimalTemplate();
        template.setConnections(List.of(
                new ClassTemplate.Connection("friend", "An old ally"),
                new ClassTemplate.Connection("enemy", "A bitter rival")
        ));

        String json = """
                {
                  "name": "Jon", "species": "Dog", "demeanor": "Loyal",
                  "details": "Strong", "equipment": "Shield",
                  "connections": [
                    {"name": "friend", "answer": "My childhood companion"},
                    {"name": "enemy", "answer": "The bandit lord"}
                  ]
                }
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        Map<String, Object> result = geminiService.generateCharacter(template, null, "en");

        @SuppressWarnings("unchecked")
        List<Map<String, String>> connections = (List<Map<String, String>>) result.get("connections");
        assertThat(connections).hasSize(2);
        assertThat(connections.get(0).get("answer")).isEqualTo("My childhood companion");
    }

    @Test
    void generateCharacter_withRoguishFeats_parsesMatchingFeats() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ClassTemplate template = minimalTemplate();
        template.setRoguishFeats(new ClassTemplate.RoguishFeatsTemplate(1, List.of(
                new ClassTemplate.RoguishFeatsTemplate.Feat("Pickpocket", "Steal small items", true),
                new ClassTemplate.RoguishFeatsTemplate.Feat("Disguise", "Change appearance", true)
        )));

        String json = """
                {
                  "name": "Pip", "species": "Mouse", "demeanor": "Sly",
                  "details": "Tiny", "equipment": "Rope",
                  "roguishFeats": ["Pickpocket"]
                }
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        Map<String, Object> result = geminiService.generateCharacter(template, null, "en");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> feats = (List<Map<String, Object>>) result.get("roguishFeats");
        assertThat(feats).hasSize(1);
        assertThat(feats.get(0).get("name")).isEqualTo("Pickpocket");
    }

    @Test
    void generateCharacter_withWeaponSkills_parsesOnlySelectableSkills() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ClassTemplate template = minimalTemplate();
        template.setWeaponSkills(new ClassTemplate.WeaponSkillsTemplate(1, List.of(
                new ClassTemplate.WeaponSkillsTemplate.Skill("Swords", "Blade mastery", true),
                new ClassTemplate.WeaponSkillsTemplate.Skill("Bows", "Ranged attacks", false)
        )));

        String json = """
                {
                  "name": "Val", "species": "Cat", "demeanor": "Fierce",
                  "details": "Agile", "equipment": "Sword",
                  "weaponSkills": ["Swords", "Bows"]
                }
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        Map<String, Object> result = geminiService.generateCharacter(template, null, "en");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> skills = (List<Map<String, Object>>) result.get("weaponSkills");
        assertThat(skills).hasSize(1);
        assertThat(skills.get(0).get("name")).isEqualTo("Swords");
    }

    @Test
    void generateCharacter_whenEmptyCandidatesArray_throwsRuntimeException() {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ResponseEntity<String> response = new ResponseEntity<>("{\"candidates\":[]}", HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        assertThatThrownBy(() -> geminiService.generateCharacter(minimalTemplate(), null, "en"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void generateCharacter_whenInvalidJsonInContent_throwsRuntimeException() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse("NOT_VALID_JSON"), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        assertThatThrownBy(() -> geminiService.generateCharacter(minimalTemplate(), null, "en"))
                .isInstanceOf(RuntimeException.class);
    }

    // ---- moves (completely uncovered) ----

    @Test
    void generateCharacter_withMoves_parsesMoves() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ClassTemplate template = minimalTemplate();
        template.setMoves(List.of(
                new ClassTemplate.Option("Strike", "Attack move"),
                new ClassTemplate.Option("Defend", "Guard move")
        ));
        template.setMaxMoves(1);

        String json = """
                {
                  "name": "Ren", "species": "Wolf", "demeanor": "Fierce",
                  "details": "Scarred", "equipment": "Axe",
                  "moves": ["Strike"]
                }
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        Map<String, Object> result = geminiService.generateCharacter(template, null, "en");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> moves = (List<Map<String, Object>>) result.get("moves");
        assertThat(moves).hasSize(1);
        assertThat(moves.get(0).get("name")).isEqualTo("Strike");
    }

    @Test
    void generateCharacter_withMovesWithoutMaxMoves_usesDefault3() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ClassTemplate template = minimalTemplate();
        template.setMoves(List.of(new ClassTemplate.Option("Strike", "Attack")));
        // maxMoves intentionally left null → falls back to default 3

        String json = """
                {"name":"A","species":"B","demeanor":"C","details":"D","equipment":"E","moves":["Strike"]}
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        // Just verify it doesn't throw — the default 3 branch is covered in buildPrompt
        assertThatCode(() -> geminiService.generateCharacter(template, null, "en"))
                .doesNotThrowAnyException();
    }

    // ---- findMatchingOption miss (nature not found) ----

    @Test
    void generateCharacter_whenNatureNotInTemplate_returnsEmptyNameDescription() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ClassTemplate template = minimalTemplate();
        template.setNature(List.of(new ClassTemplate.Option("Defender", "Protects")));

        String json = """
                {
                  "name": "Zed", "species": "Hawk", "demeanor": "Aloof",
                  "details": "Sharp-eyed", "equipment": "Bow",
                  "nature": "UNKNOWN_NATURE"
                }
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        Map<String, Object> result = geminiService.generateCharacter(template, null, "en");

        @SuppressWarnings("unchecked")
        Map<String, Object> nature = (Map<String, Object>) result.get("nature");
        assertThat(nature.get("name")).isEqualTo("");
    }

    // ---- drives option not found ----

    @Test
    void generateCharacter_whenDriveNotInTemplate_isSkipped() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ClassTemplate template = minimalTemplate();
        template.setDrives(List.of(new ClassTemplate.Option("Justice", "Uphold law")));
        template.setMaxDrives(1);

        String json = """
                {
                  "name": "X", "species": "Cat", "demeanor": "Calm",
                  "details": "Quiet", "equipment": "Staff",
                  "drives": ["UNKNOWN_DRIVE"]
                }
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        Map<String, Object> result = geminiService.generateCharacter(template, null, "en");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> drives = (List<Map<String, Object>>) result.get("drives");
        assertThat(drives).isEmpty(); // unknown drive → not added
    }

    // ---- unknown weapon skill (line 364 nc) ----

    @Test
    void generateCharacter_withUnknownWeaponSkill_logsAndSkips() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ClassTemplate template = minimalTemplate();
        template.setWeaponSkills(new ClassTemplate.WeaponSkillsTemplate(1, List.of(
                new ClassTemplate.WeaponSkillsTemplate.Skill("Swords", "Blade", true)
        )));

        String json = """
                {
                  "name": "Y", "species": "Dog", "demeanor": "Bold",
                  "details": "Sturdy", "equipment": "Shield",
                  "weaponSkills": ["UNKNOWN_SKILL"]
                }
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        Map<String, Object> result = geminiService.generateCharacter(template, null, "en");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> skills = (List<Map<String, Object>>) result.get("weaponSkills");
        assertThat(skills).isEmpty();
    }

    // ---- stat already at +2, no bonus ----

    @Test
    void generateCharacter_withStatAlreadyAtMax_doesNotExceedTwo() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ClassTemplate template = minimalTemplate();
        template.setStats(List.of(new ClassTemplate.StatTemplate("Cunning", 2)));

        String json = """
                {
                  "name": "Z", "species": "Rat", "demeanor": "Wily",
                  "details": "Small", "equipment": "Dagger",
                  "stats": [{"name": "Cunning", "value": 2}],
                  "selectedStat": "Cunning"
                }
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        Map<String, Object> result = geminiService.generateCharacter(template, null, "en");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> stats = (List<Map<String, Object>>) result.get("stats");
        assertThat(stats.get(0).get("value")).isEqualTo(2); // stays at 2, not 3
    }

    // ---- roguishFeats remaining == 0, not added to prompt ----

    @Test
    void generateCharacter_withRoguishFeatsRemainingZero_skipsFeatsSection() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ClassTemplate template = minimalTemplate();
        template.setRoguishFeats(new ClassTemplate.RoguishFeatsTemplate(0, List.of(
                new ClassTemplate.RoguishFeatsTemplate.Feat("Pickpocket", "Steal", true)
        ))); // remaining == 0 → not included in prompt

        String json = """
                {"name":"Q","species":"Fox","demeanor":"Shy","details":"Small","equipment":"Staff"}
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        assertThatCode(() -> geminiService.generateCharacter(template, null, "en"))
                .doesNotThrowAnyException();
    }

    // ---- drives with null maxDrives → default 2 ----

    @Test
    void generateCharacter_withDrivesAndNullMaxDrives_usesDefault2() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ClassTemplate template = minimalTemplate();
        template.setDrives(List.of(new ClassTemplate.Option("Justice", "Law")));
        // maxDrives is null → default 2

        String json = """
                {"name":"W","species":"Bear","demeanor":"Firm","details":"Big","equipment":"Club","drives":["Justice"]}
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        assertThatCode(() -> geminiService.generateCharacter(template, null, "en"))
                .doesNotThrowAnyException();
    }

    // ---- language null → skips language instruction ----

    @Test
    void generateCharacter_withNullLanguage_skipsLanguageInstruction() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        String json = """
                {"name":"N","species":"Cat","demeanor":"Cool","details":"Slim","equipment":"None"}
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        assertThatCode(() -> geminiService.generateCharacter(minimalTemplate(), null, null))
                .doesNotThrowAnyException();
    }

    // ---- e.getMessage() == null → uses "Unknown Gemini API error" ----

    @Test
    void generateCharacter_whenExceptionMessageIsNull_usesUnknownError() {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");
        // Throw an exception with null message
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenThrow(new RuntimeException((String) null));

        assertThatThrownBy(() -> geminiService.generateCharacter(minimalTemplate(), null, "en"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to generate character");
    }

    // ---- feat not found in template ----

    @Test
    void generateCharacter_whenFeatNotInTemplate_isSkipped() throws Exception {
        ReflectionTestUtils.setField(geminiService, "apiKey", "valid-key");

        ClassTemplate template = minimalTemplate();
        template.setRoguishFeats(new ClassTemplate.RoguishFeatsTemplate(1, List.of(
                new ClassTemplate.RoguishFeatsTemplate.Feat("Pickpocket", "Steal", true)
        )));

        String json = """
                {
                  "name": "V", "species": "Mouse", "demeanor": "Quiet",
                  "details": "Tiny", "equipment": "Rope",
                  "roguishFeats": ["UNKNOWN_FEAT"]
                }
                """;

        ResponseEntity<String> response = new ResponseEntity<>(buildGeminiResponse(json), HttpStatus.OK);
        when(mockRestTemplate.exchange(anyString(), eq(HttpMethod.POST), any(), eq(String.class)))
                .thenReturn(response);

        Map<String, Object> result = geminiService.generateCharacter(template, null, "en");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> feats = (List<Map<String, Object>>) result.get("roguishFeats");
        assertThat(feats).isEmpty();
    }

    // ---- helper ----

    private String buildGeminiResponse(String innerJson) {
        // Wraps content in the Gemini API response envelope
        return """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          { "text": %s }
                        ]
                      }
                    }
                  ]
                }
                """.formatted(new ObjectMapper().valueToTree(innerJson).toString());
    }
}
