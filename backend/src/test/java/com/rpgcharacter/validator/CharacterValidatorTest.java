package com.rpgcharacter.validator;

import com.rpgcharacter.dto.CharacterDTO;
import com.rpgcharacter.exception.ValidationException;
import com.rpgcharacter.model.ClassTemplate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CharacterValidatorTest {

    private CharacterValidator validator;

    @BeforeEach
    void setUp() {
        validator = new CharacterValidator();
    }

    // ---- Helpers ----

    /** Crea una lista de SelectedOptionDTO con 'selectedCount' opciones seleccionadas. */
    private List<CharacterDTO.SelectedOptionDTO> options(int total, int selectedCount) {
        List<CharacterDTO.SelectedOptionDTO> list = new ArrayList<>();
        for (int i = 0; i < total; i++) {
            list.add(new CharacterDTO.SelectedOptionDTO("Opción " + i, "desc", i < selectedCount));
        }
        return list;
    }

    /** Crea una CreateRequest mínima con las listas indicadas. */
    private CharacterDTO.CreateRequest buildRequest(
            List<CharacterDTO.SelectedOptionDTO> drives,
            List<CharacterDTO.SelectedOptionDTO> moves,
            List<CharacterDTO.SelectedOptionDTO> nature) {
        return CharacterDTO.CreateRequest.builder()
                .name("Gideon")
                .system("Root")
                .className("Arbiter")
                .drives(drives)
                .moves(moves)
                .nature(nature)
                .build();
    }

    /** Crea un ClassTemplate con los límites indicados. */
    private ClassTemplate buildTemplate(Integer maxDrives, Integer maxMoves, Integer maxNature) {
        ClassTemplate t = new ClassTemplate();
        t.setMaxDrives(maxDrives);
        t.setMaxMoves(maxMoves);
        t.setMaxNature(maxNature);
        return t;
    }

    // ---- Drives ----

    @Test
    void validateCharacter_whenDrivesWithinLimit_doesNotThrow() {
        ClassTemplate template = buildTemplate(2, null, null);
        CharacterDTO.CreateRequest request = buildRequest(options(3, 2), null, null);

        assertThatCode(() -> validator.validateCharacter(request, template))
                .doesNotThrowAnyException();
    }

    @Test
    void validateCharacter_whenDrivesExceedLimit_throwsValidationException() {
        ClassTemplate template = buildTemplate(2, null, null);
        CharacterDTO.CreateRequest request = buildRequest(options(4, 3), null, null);

        assertThatThrownBy(() -> validator.validateCharacter(request, template))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void validateCharacter_whenDrivesIsNull_doesNotThrow() {
        ClassTemplate template = buildTemplate(2, null, null);
        CharacterDTO.CreateRequest request = buildRequest(null, null, null);

        assertThatCode(() -> validator.validateCharacter(request, template))
                .doesNotThrowAnyException();
    }

    // ---- Moves ----

    @Test
    void validateCharacter_whenMovesExceedLimit_throwsValidationException() {
        ClassTemplate template = buildTemplate(null, 3, null);
        CharacterDTO.CreateRequest request = buildRequest(null, options(5, 4), null);

        assertThatThrownBy(() -> validator.validateCharacter(request, template))
                .isInstanceOf(ValidationException.class);
    }

    // ---- Nature ----

    @Test
    void validateCharacter_whenNatureExceedsLimit_throwsValidationException() {
        ClassTemplate template = buildTemplate(null, null, 1);
        CharacterDTO.CreateRequest request = buildRequest(null, null, options(3, 2));

        assertThatThrownBy(() -> validator.validateCharacter(request, template))
                .isInstanceOf(ValidationException.class);
    }

    // ---- Múltiples errores ----

    @Test
    void validateCharacter_whenMultipleFieldsExceedLimit_errorMapContainsBothKeys() {
        ClassTemplate template = buildTemplate(2, 3, null);
        CharacterDTO.CreateRequest request = buildRequest(options(4, 3), options(5, 4), null);

        assertThatThrownBy(() -> validator.validateCharacter(request, template))
                .isInstanceOf(ValidationException.class)
                .satisfies(ex -> {
                    ValidationException ve = (ValidationException) ex;
                    org.assertj.core.api.Assertions.assertThat(ve.getFieldErrors())
                            .containsKeys("drives", "moves");
                });
    }

    // ---- Contenido del mensaje de error ----

    @Test
    void validateCharacter_errorMessage_containsExpectedCount() {
        ClassTemplate template = buildTemplate(2, null, null);
        CharacterDTO.CreateRequest request = buildRequest(options(4, 3), null, null);

        assertThatThrownBy(() -> validator.validateCharacter(request, template))
                .isInstanceOf(ValidationException.class)
                .satisfies(ex -> {
                    ValidationException ve = (ValidationException) ex;
                    String driveError = ve.getFieldErrors().get("drives");
                    org.assertj.core.api.Assertions.assertThat(driveError)
                            .contains("Maximum allowed: 2")
                            .contains("selected: 3");
                });
    }

    // ---- Casos de éxito para moves y nature ----

    @Test
    void validateCharacter_whenMovesWithinLimit_doesNotThrow() {
        ClassTemplate template = buildTemplate(null, 3, null);
        CharacterDTO.CreateRequest request = buildRequest(null, options(5, 3), null);

        assertThatCode(() -> validator.validateCharacter(request, template))
                .doesNotThrowAnyException();
    }

    @Test
    void validateCharacter_whenNatureWithinLimit_doesNotThrow() {
        ClassTemplate template = buildTemplate(null, null, 1);
        CharacterDTO.CreateRequest request = buildRequest(null, null, options(3, 1));

        assertThatCode(() -> validator.validateCharacter(request, template))
                .doesNotThrowAnyException();
    }

    // ---- Salta la validación cuando el template no define límite (max = null) ----

    @Test
    void validateCharacter_whenMaxDrivesIsNull_skipsValidation() {
        ClassTemplate template = buildTemplate(null, null, null); // sin límite definido
        CharacterDTO.CreateRequest request = buildRequest(options(5, 5), null, null);

        // Aunque haya 5 seleccionados, sin límite no debe validar
        assertThatCode(() -> validator.validateCharacter(request, template))
                .doesNotThrowAnyException();
    }

    @Test
    void validateCharacter_whenMaxMovesIsNull_skipsValidation() {
        ClassTemplate template = buildTemplate(null, null, null);
        CharacterDTO.CreateRequest request = buildRequest(null, options(10, 10), null);

        assertThatCode(() -> validator.validateCharacter(request, template))
                .doesNotThrowAnyException();
    }

    @Test
    void validateCharacter_whenMaxNatureIsNull_skipsValidation() {
        ClassTemplate template = buildTemplate(null, null, null);
        CharacterDTO.CreateRequest request = buildRequest(null, null, options(3, 3));

        assertThatCode(() -> validator.validateCharacter(request, template))
                .doesNotThrowAnyException();
    }

    // ---- Los tres campos exceden a la vez ----

    @Test
    void validateCharacter_whenAllThreeFieldsExceedLimit_errorMapHasThreeKeys() {
        ClassTemplate template = buildTemplate(2, 3, 1);
        CharacterDTO.CreateRequest request = buildRequest(
                options(4, 3), options(5, 4), options(3, 2));

        assertThatThrownBy(() -> validator.validateCharacter(request, template))
                .isInstanceOf(ValidationException.class)
                .satisfies(ex -> {
                    ValidationException ve = (ValidationException) ex;
                    org.assertj.core.api.Assertions.assertThat(ve.getFieldErrors())
                            .containsKeys("drives", "moves", "nature");
                });
    }
}
