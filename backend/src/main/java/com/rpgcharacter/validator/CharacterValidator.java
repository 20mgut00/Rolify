package com.rpgcharacter.validator;

import com.rpgcharacter.dto.CharacterDTO;
import com.rpgcharacter.exception.ValidationException;
import com.rpgcharacter.model.ClassTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Validator for character creation and updates against class templates.
 */
@Component
public class CharacterValidator {

    /**
     * Validates a character creation request against its class template.
     *
     * @param request  The character creation request
     * @param template The class template to validate against
     * @throws ValidationException if validation fails
     */
    public void validateCharacter(CharacterDTO.CreateRequest request, ClassTemplate template) {
        Map<String, String> errors = new HashMap<>();

        validateDrives(request, template, errors);
        validateMoves(request, template, errors);
        validateNature(request, template, errors);

        if (!errors.isEmpty()) {
            throw new ValidationException("Character validation failed", errors);
        }
    }

    private void validateDrives(CharacterDTO.CreateRequest request, ClassTemplate template, Map<String, String> errors) {
        if (request.getDrives() != null && template.getMaxDrives() != null) {
            long selectedCount = request.getDrives().stream()
                    .filter(CharacterDTO.SelectedOptionDTO::getSelected)
                    .count();

            if (selectedCount > template.getMaxDrives()) {
                errors.put("drives", String.format("Too many drives selected. Maximum allowed: %d, selected: %d",
                        template.getMaxDrives(), selectedCount));
            }
        }
    }

    private void validateMoves(CharacterDTO.CreateRequest request, ClassTemplate template, Map<String, String> errors) {
        if (request.getMoves() != null && template.getMaxMoves() != null) {
            long selectedCount = request.getMoves().stream()
                    .filter(CharacterDTO.SelectedOptionDTO::getSelected)
                    .count();

            if (selectedCount > template.getMaxMoves()) {
                errors.put("moves", String.format("Too many moves selected. Maximum allowed: %d, selected: %d",
                        template.getMaxMoves(), selectedCount));
            }
        }
    }

    private void validateNature(CharacterDTO.CreateRequest request, ClassTemplate template, Map<String, String> errors) {
        if (request.getNature() != null && template.getMaxNature() != null) {
            long selectedCount = request.getNature().stream()
                    .filter(CharacterDTO.SelectedOptionDTO::getSelected)
                    .count();

            if (selectedCount > template.getMaxNature()) {
                errors.put("nature", String.format("Too many nature options selected. Maximum allowed: %d, selected: %d",
                        template.getMaxNature(), selectedCount));
            }
        }
    }
}
