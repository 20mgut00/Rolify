package com.rpgcharacter.mapper;

import com.rpgcharacter.dto.CharacterDTO;
import com.rpgcharacter.model.Character;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class CharacterMapperTest {

    private CharacterMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new CharacterMapper();
    }

    // ── mapStats ──────────────────────────────────────────────────────────────

    @Test
    void mapStats_null_returnsEmptyList() {
        assertThat(mapper.mapStats(null)).isEmpty();
    }

    @Test
    void mapStats_emptyList_returnsEmptyList() {
        assertThat(mapper.mapStats(List.of())).isEmpty();
    }

    @Test
    void mapStats_mapsNameAndValue() {
        var dto = new CharacterDTO.StatDTO("Cunning", 2);
        List<Character.Stat> result = mapper.mapStats(List.of(dto));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Cunning");
        assertThat(result.get(0).getValue()).isEqualTo(2);
    }

    // ── mapBackground ─────────────────────────────────────────────────────────

    @Test
    void mapBackground_null_returnsEmptyList() {
        assertThat(mapper.mapBackground(null)).isEmpty();
    }

    @Test
    void mapBackground_mapsQuestionAndAnswer() {
        var dto = new CharacterDTO.BackgroundAnswerDTO("Why did you leave?", "Looking for adventure");
        List<Character.BackgroundAnswer> result = mapper.mapBackground(List.of(dto));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getQuestion()).isEqualTo("Why did you leave?");
        assertThat(result.get(0).getAnswer()).isEqualTo("Looking for adventure");
    }

    // ── mapSelectedOptions ────────────────────────────────────────────────────

    @Test
    void mapSelectedOptions_null_returnsEmptyList() {
        assertThat(mapper.mapSelectedOptions(null)).isEmpty();
    }

    @Test
    void mapSelectedOptions_mapsAllFields() {
        var dto = new CharacterDTO.SelectedOptionDTO("Drive A", "Desc A", true);
        List<Character.SelectedOption> result = mapper.mapSelectedOptions(List.of(dto));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Drive A");
        assertThat(result.get(0).getDescription()).isEqualTo("Desc A");
        assertThat(result.get(0).getSelected()).isTrue();
    }

    @Test
    void mapSelectedOptions_preservesMultipleItems() {
        var dtos = List.of(
                new CharacterDTO.SelectedOptionDTO("Move 1", "Desc 1", true),
                new CharacterDTO.SelectedOptionDTO("Move 2", "Desc 2", false)
        );
        List<Character.SelectedOption> result = mapper.mapSelectedOptions(dtos);

        assertThat(result).hasSize(2);
        assertThat(result.get(1).getSelected()).isFalse();
    }

    // ── mapConnections ────────────────────────────────────────────────────────

    @Test
    void mapConnections_null_returnsEmptyList() {
        assertThat(mapper.mapConnections(null)).isEmpty();
    }

    @Test
    void mapConnections_mapsAllFields() {
        var dto = new CharacterDTO.ConnectionDTO("Friend", "Alice", "Old ally", "Met in battle");
        List<Character.Connection> result = mapper.mapConnections(List.of(dto));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo("Friend");
        assertThat(result.get(0).getCharacterName()).isEqualTo("Alice");
        assertThat(result.get(0).getDescription()).isEqualTo("Old ally");
        assertThat(result.get(0).getStory()).isEqualTo("Met in battle");
    }

    // ── mapWeaponSkills ───────────────────────────────────────────────────────

    @Test
    void mapWeaponSkills_null_returnsNull() {
        assertThat(mapper.mapWeaponSkills(null)).isNull();
    }

    @Test
    void mapWeaponSkills_mapsRemainingAndSkills() {
        var skillDTO = new CharacterDTO.SkillDTO("Sword", "Slash attack", true);
        var dto = new CharacterDTO.WeaponSkillsDTO(2, List.of(skillDTO));

        Character.WeaponSkillsData result = mapper.mapWeaponSkills(dto);

        assertThat(result.getRemaining()).isEqualTo(2);
        assertThat(result.getSkills()).hasSize(1);
        assertThat(result.getSkills().get(0).getName()).isEqualTo("Sword");
        assertThat(result.getSkills().get(0).getDescription()).isEqualTo("Slash attack");
        assertThat(result.getSkills().get(0).getSelected()).isTrue();
    }

    @Test
    void mapWeaponSkills_emptySkillsList() {
        var dto = new CharacterDTO.WeaponSkillsDTO(3, List.of());
        Character.WeaponSkillsData result = mapper.mapWeaponSkills(dto);

        assertThat(result.getRemaining()).isEqualTo(3);
        assertThat(result.getSkills()).isEmpty();
    }

    // ── mapRoguishFeats ───────────────────────────────────────────────────────

    @Test
    void mapRoguishFeats_null_returnsNull() {
        assertThat(mapper.mapRoguishFeats(null)).isNull();
    }

    @Test
    void mapRoguishFeats_mapsRemainingAndFeats() {
        var featDTO = new CharacterDTO.FeatDTO("Pickpocket", "Steal items", false);
        var dto = new CharacterDTO.RoguishFeatsDTO(1, List.of(featDTO));

        Character.RoguishFeatsData result = mapper.mapRoguishFeats(dto);

        assertThat(result.getRemaining()).isEqualTo(1);
        assertThat(result.getFeats()).hasSize(1);
        assertThat(result.getFeats().get(0).getName()).isEqualTo("Pickpocket");
        assertThat(result.getFeats().get(0).getDescription()).isEqualTo("Steal items");
        assertThat(result.getFeats().get(0).getSelected()).isFalse();
    }

    @Test
    void mapRoguishFeats_emptyFeatsList() {
        var dto = new CharacterDTO.RoguishFeatsDTO(0, List.of());
        Character.RoguishFeatsData result = mapper.mapRoguishFeats(dto);

        assertThat(result.getRemaining()).isEqualTo(0);
        assertThat(result.getFeats()).isEmpty();
    }

    // ── mapReputation ─────────────────────────────────────────────────────────

    @Test
    void mapReputation_null_returnsNull() {
        assertThat(mapper.mapReputation(null)).isNull();
    }

    @Test
    void mapReputation_nullFactions_returnsNull() {
        var dto = new CharacterDTO.ReputationDTO(null);
        assertThat(mapper.mapReputation(dto)).isNull();
    }

    @Test
    void mapReputation_mapsFactionPrestigeAndNotoriety() {
        var factionDTO = new CharacterDTO.FactionReputationDTO(5, 2);
        var dto = new CharacterDTO.ReputationDTO(Map.of("Woodland Alliance", factionDTO));

        Character.ReputationData result = mapper.mapReputation(dto);

        assertThat(result.getFactions()).containsKey("Woodland Alliance");
        assertThat(result.getFactions().get("Woodland Alliance").getPrestige()).isEqualTo(5);
        assertThat(result.getFactions().get("Woodland Alliance").getNotoriety()).isEqualTo(2);
    }

    @Test
    void mapReputation_mapsMultipleFactions() {
        var dto = new CharacterDTO.ReputationDTO(Map.of(
                "Faction A", new CharacterDTO.FactionReputationDTO(3, 1),
                "Faction B", new CharacterDTO.FactionReputationDTO(0, 4)
        ));

        Character.ReputationData result = mapper.mapReputation(dto);

        assertThat(result.getFactions()).hasSize(2);
        assertThat(result.getFactions().get("Faction B").getNotoriety()).isEqualTo(4);
    }
}
