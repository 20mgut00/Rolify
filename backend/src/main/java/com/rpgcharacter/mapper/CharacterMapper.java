package com.rpgcharacter.mapper;

import com.rpgcharacter.dto.CharacterDTO;
import com.rpgcharacter.model.Character;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CharacterMapper {

    public List<Character.Stat> mapStats(List<CharacterDTO.StatDTO> stats) {
        if (stats == null) return List.of();

        return stats.stream()
                .map(s -> new Character.Stat(s.getName(), s.getValue()))
                .collect(Collectors.toList());
    }

    public List<Character.BackgroundAnswer> mapBackground(List<CharacterDTO.BackgroundAnswerDTO> background) {
        if (background == null) return List.of();

        return background.stream()
                .map(b -> new Character.BackgroundAnswer(b.getQuestion(), b.getAnswer()))
                .collect(Collectors.toList());
    }

    public List<Character.SelectedOption> mapSelectedOptions(List<CharacterDTO.SelectedOptionDTO> options) {
        if (options == null) return List.of();

        return options.stream()
                .map(o -> new Character.SelectedOption(o.getName(), o.getDescription(), o.getSelected()))
                .collect(Collectors.toList());
    }

    public List<Character.Connection> mapConnections(List<CharacterDTO.ConnectionDTO> connections) {
        if (connections == null) return List.of();

        return connections.stream()
                .map(c -> new Character.Connection(c.getType(), c.getCharacterName(), c.getDescription(), c.getStory()))
                .collect(Collectors.toList());
    }

    public Character.WeaponSkillsData mapWeaponSkills(CharacterDTO.WeaponSkillsDTO dto) {
        if (dto == null) return null;

        List<Character.WeaponSkillsData.Skill> skills = dto.getSkills().stream()
                .map(s -> new Character.WeaponSkillsData.Skill(s.getName(), s.getDescription(), s.getSelected()))
                .collect(Collectors.toList());

        return new Character.WeaponSkillsData(dto.getRemaining(), skills);
    }

    public Character.RoguishFeatsData mapRoguishFeats(CharacterDTO.RoguishFeatsDTO dto) {
        if (dto == null) return null;

        List<Character.RoguishFeatsData.Feat> feats = dto.getFeats().stream()
                .map(f -> new Character.RoguishFeatsData.Feat(f.getName(), f.getDescription(), f.getSelected()))
                .collect(Collectors.toList());

        return new Character.RoguishFeatsData(dto.getRemaining(), feats);
    }

    public Character.ReputationData mapReputation(CharacterDTO.ReputationDTO dto) {
        if (dto == null || dto.getFactions() == null) return null;

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
