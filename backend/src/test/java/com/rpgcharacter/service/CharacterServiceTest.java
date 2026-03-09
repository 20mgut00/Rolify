package com.rpgcharacter.service;

import com.rpgcharacter.dto.CharacterDTO;
import com.rpgcharacter.exception.ResourceNotFoundException;
import com.rpgcharacter.exception.UnauthorizedException;
import com.rpgcharacter.model.Character;
import com.rpgcharacter.model.User;
import com.rpgcharacter.repository.CharacterRepository;
import com.rpgcharacter.repository.ClassTemplateRepository;
import com.rpgcharacter.repository.UserRepository;
import com.rpgcharacter.validator.CharacterValidator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CharacterServiceTest {

    @Mock private CharacterRepository characterRepository;
    @Mock private ClassTemplateRepository classTemplateRepository;
    @Mock private UserRepository userRepository;
    @Mock private ModelMapper modelMapper;
    @Mock private CharacterValidator characterValidator;

    @InjectMocks
    private CharacterService characterService;

    // ---- Helpers ----

    private User buildUser(String id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setName("Test User");
        user.setTotalCharacters(1L);
        user.setPublicCharacters(0L);
        return user;
    }

    private Character buildCharacter(String id, String userId, boolean isPublic) {
        Character character = new Character();
        character.setId(id);
        character.setUserId(userId);
        character.setIsPublic(isPublic);
        character.setLikeCount(0);
        character.setLikedByUserIds(new ArrayList<>());
        return character;
    }

    // ==================== deleteCharacter ====================

    @Test
    void deleteCharacter_whenUserEmailIsNull_throwsUnauthorizedException() {
        Character character = buildCharacter("char-1", "owner-id", false);
        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));

        assertThatThrownBy(() -> characterService.deleteCharacter("char-1", null))
                .isInstanceOf(UnauthorizedException.class);

        verify(characterRepository, never()).delete(any());
    }

    @Test
    void deleteCharacter_whenCharacterNotFound_throwsResourceNotFoundException() {
        when(characterRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> characterService.deleteCharacter("missing", "user@test.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteCharacter_byOwner_deletesCharacterAndUpdatesStats() {
        Character character = buildCharacter("char-1", "owner-id", false);
        User owner = buildUser("owner-id", "owner@test.com");

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));

        assertThatCode(() -> characterService.deleteCharacter("char-1", "owner@test.com"))
                .doesNotThrowAnyException();

        verify(characterRepository, times(1)).delete(character);
        verify(userRepository, times(1)).save(owner);
        assertThat(owner.getTotalCharacters()).isEqualTo(0L);
    }

    @Test
    void deleteCharacter_byNonOwner_throwsUnauthorizedException() {
        Character character = buildCharacter("char-1", "owner-id", false);
        User otherUser = buildUser("other-id", "other@test.com");

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherUser));

        assertThatThrownBy(() -> characterService.deleteCharacter("char-1", "other@test.com"))
                .isInstanceOf(UnauthorizedException.class);

        verify(characterRepository, never()).delete(any());
    }

    // ==================== toggleLike ====================

    @Test
    void toggleLike_onPrivateCharacter_throwsUnauthorizedException() {
        Character character = buildCharacter("char-1", "owner-id", false); // privado
        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));

        assertThatThrownBy(() -> characterService.toggleLike("char-1", "user@test.com"))
                .isInstanceOf(UnauthorizedException.class);

        verify(characterRepository, never()).save(any());
    }

    @Test
    void toggleLike_whenNotLiked_addsLikeAndIncrementsCount() {
        Character character = buildCharacter("char-1", "creator-id", true);
        User liker = buildUser("liker-id", "liker@test.com");
        User creator = buildUser("creator-id", "creator@test.com");

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(userRepository.findByEmail("liker@test.com")).thenReturn(Optional.of(liker));
        when(characterRepository.save(any())).thenReturn(character);
        when(userRepository.findAllById(any())).thenReturn(List.of(creator));
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.CardResponse.class)))
                .thenReturn(new CharacterDTO.CardResponse());

        characterService.toggleLike("char-1", "liker@test.com");

        assertThat(character.getLikeCount()).isEqualTo(1);
        assertThat(character.getLikedByUserIds()).contains("liker-id");
        verify(characterRepository, times(1)).save(character);
    }

    @Test
    void toggleLike_whenAlreadyLiked_removesLikeAndDecrementsCount() {
        Character character = buildCharacter("char-1", "creator-id", true);
        character.setLikeCount(1);
        character.setLikedByUserIds(new ArrayList<>(List.of("liker-id")));

        User liker = buildUser("liker-id", "liker@test.com");
        User creator = buildUser("creator-id", "creator@test.com");

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(userRepository.findByEmail("liker@test.com")).thenReturn(Optional.of(liker));
        when(characterRepository.save(any())).thenReturn(character);
        when(userRepository.findAllById(any())).thenReturn(List.of(creator));
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.CardResponse.class)))
                .thenReturn(new CharacterDTO.CardResponse());

        characterService.toggleLike("char-1", "liker@test.com");

        assertThat(character.getLikeCount()).isEqualTo(0);
        assertThat(character.getLikedByUserIds()).doesNotContain("liker-id");
    }

    // ==================== getCharacter ====================

    @Test
    void getCharacter_whenPrivateAndNoEmail_throwsUnauthorizedException() {
        Character character = buildCharacter("char-1", "owner-id", false);
        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));

        assertThatThrownBy(() -> characterService.getCharacter("char-1", null))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void getCharacter_whenPublic_returnsWithoutAuth() {
        Character character = buildCharacter("char-1", "owner-id", true);
        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.Response.class)))
                .thenReturn(new CharacterDTO.Response());

        assertThatCode(() -> characterService.getCharacter("char-1", null))
                .doesNotThrowAnyException();
    }

    // ==================== createCharacter ====================

    private CharacterDTO.CreateRequest buildCreateRequest(boolean isPublic) {
        return CharacterDTO.CreateRequest.builder()
                .name("Gideon").system("Root").className("Arbiter")
                .isPublic(isPublic).build();
    }

    @Test
    void createCharacter_asAnonymousUser_savesWithoutUserLookup() {
        CharacterDTO.CreateRequest request = buildCreateRequest(false);
        Character savedChar = buildCharacter("char-1", null, false);

        when(classTemplateRepository.findBySystemAndClassName("Root", "Arbiter"))
                .thenReturn(Optional.of(new com.rpgcharacter.model.ClassTemplate()));
        when(modelMapper.map(any(CharacterDTO.CreateRequest.class), eq(Character.class)))
                .thenReturn(savedChar);
        when(characterRepository.save(any())).thenReturn(savedChar);
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.Response.class)))
                .thenReturn(new CharacterDTO.Response());

        characterService.createCharacter(request, null);

        verify(characterRepository).save(any());
        verifyNoInteractions(userRepository);
    }

    @Test
    void createCharacter_asAuthenticatedUser_incrementsTotalCharacters() {
        CharacterDTO.CreateRequest request = buildCreateRequest(false);
        User user = buildUser("user-id", "user@test.com");
        user.setTotalCharacters(2L);
        Character savedChar = buildCharacter("char-1", "user-id", false);

        when(classTemplateRepository.findBySystemAndClassName("Root", "Arbiter"))
                .thenReturn(Optional.of(new com.rpgcharacter.model.ClassTemplate()));
        when(modelMapper.map(any(CharacterDTO.CreateRequest.class), eq(Character.class)))
                .thenReturn(savedChar);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(characterRepository.save(any())).thenReturn(savedChar);
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.Response.class)))
                .thenReturn(new CharacterDTO.Response());

        characterService.createCharacter(request, "user@test.com");

        assertThat(user.getTotalCharacters()).isEqualTo(3L);
        verify(userRepository).save(user);
    }

    @Test
    void createCharacter_whenPublic_incrementsPublicCharacters() {
        CharacterDTO.CreateRequest request = buildCreateRequest(true);
        User user = buildUser("user-id", "user@test.com");
        user.setPublicCharacters(0L);
        Character savedChar = buildCharacter("char-1", "user-id", true);

        when(classTemplateRepository.findBySystemAndClassName("Root", "Arbiter"))
                .thenReturn(Optional.of(new com.rpgcharacter.model.ClassTemplate()));
        when(modelMapper.map(any(CharacterDTO.CreateRequest.class), eq(Character.class)))
                .thenReturn(savedChar);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(characterRepository.save(any())).thenReturn(savedChar);
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.Response.class)))
                .thenReturn(new CharacterDTO.Response());

        characterService.createCharacter(request, "user@test.com");

        assertThat(user.getPublicCharacters()).isEqualTo(1L);
    }

    @Test
    void createCharacter_whenTemplateNotFound_throwsResourceNotFoundException() {
        CharacterDTO.CreateRequest request = buildCreateRequest(false);
        when(classTemplateRepository.findBySystemAndClassName("Root", "Arbiter"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> characterService.createCharacter(request, null))
                .isInstanceOf(com.rpgcharacter.exception.ResourceNotFoundException.class);

        verify(characterRepository, never()).save(any());
    }

    @Test
    void createCharacter_whenValidationFails_propagatesException() {
        CharacterDTO.CreateRequest request = buildCreateRequest(false);
        when(classTemplateRepository.findBySystemAndClassName("Root", "Arbiter"))
                .thenReturn(Optional.of(new com.rpgcharacter.model.ClassTemplate()));
        doThrow(new com.rpgcharacter.exception.ValidationException("invalid"))
                .when(characterValidator).validateCharacter(any(), any());

        assertThatThrownBy(() -> characterService.createCharacter(request, null))
                .isInstanceOf(com.rpgcharacter.exception.ValidationException.class);

        verify(characterRepository, never()).save(any());
    }

    // ==================== updateCharacter ====================

    @Test
    void updateCharacter_byOwner_savesUpdatedCharacter() {
        Character character = buildCharacter("char-1", "owner-id", false);
        User owner = buildUser("owner-id", "owner@test.com");
        CharacterDTO.UpdateRequest request = CharacterDTO.UpdateRequest.builder()
                .name("Nuevo Nombre").build();

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(characterRepository.save(any())).thenReturn(character);
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.Response.class)))
                .thenReturn(new CharacterDTO.Response());

        characterService.updateCharacter("char-1", request, "owner@test.com");

        assertThat(character.getName()).isEqualTo("Nuevo Nombre");
        verify(characterRepository).save(character);
    }

    @Test
    void updateCharacter_byNonOwner_throwsUnauthorizedException() {
        Character character = buildCharacter("char-1", "owner-id", false);
        User other = buildUser("other-id", "other@test.com");
        CharacterDTO.UpdateRequest request = CharacterDTO.UpdateRequest.builder().build();

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> characterService.updateCharacter("char-1", request, "other@test.com"))
                .isInstanceOf(UnauthorizedException.class);

        verify(characterRepository, never()).save(any());
    }

    @Test
    void updateCharacter_makingPublic_incrementsPublicCharacters() {
        Character character = buildCharacter("char-1", "owner-id", false);
        User owner = buildUser("owner-id", "owner@test.com");
        owner.setPublicCharacters(0L);
        CharacterDTO.UpdateRequest request = CharacterDTO.UpdateRequest.builder()
                .isPublic(true).build();

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(userRepository.findById("owner-id")).thenReturn(Optional.of(owner));
        when(characterRepository.save(any())).thenReturn(character);
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.Response.class)))
                .thenReturn(new CharacterDTO.Response());

        characterService.updateCharacter("char-1", request, "owner@test.com");

        assertThat(owner.getPublicCharacters()).isEqualTo(1L);
    }

    @Test
    void updateCharacter_makingPrivate_decrementsPublicCharacters() {
        Character character = buildCharacter("char-1", "owner-id", true);
        User owner = buildUser("owner-id", "owner@test.com");
        owner.setPublicCharacters(3L);
        CharacterDTO.UpdateRequest request = CharacterDTO.UpdateRequest.builder()
                .isPublic(false).build();

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(userRepository.findById("owner-id")).thenReturn(Optional.of(owner));
        when(characterRepository.save(any())).thenReturn(character);
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.Response.class)))
                .thenReturn(new CharacterDTO.Response());

        characterService.updateCharacter("char-1", request, "owner@test.com");

        assertThat(owner.getPublicCharacters()).isEqualTo(2L);
    }

    @Test
    void updateCharacter_whenCharacterNotFound_throwsResourceNotFoundException() {
        when(characterRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> characterService.updateCharacter(
                "missing", CharacterDTO.UpdateRequest.builder().build(), "user@test.com"))
                .isInstanceOf(com.rpgcharacter.exception.ResourceNotFoundException.class);
    }

    // ==================== getUserCharacters ====================

    @Test
    void getUserCharacters_whenUserFound_returnsCards() {
        User user = buildUser("user-id", "user@test.com");
        Character char1 = buildCharacter("char-1", "user-id", false);

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(characterRepository.findByUserId("user-id")).thenReturn(List.of(char1));
        when(userRepository.findAllById(any())).thenReturn(List.of(user));
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.CardResponse.class)))
                .thenReturn(new CharacterDTO.CardResponse());

        List<CharacterDTO.CardResponse> result = characterService.getUserCharacters("user@test.com");

        assertThat(result).hasSize(1);
    }

    @Test
    void getUserCharacters_whenUserNotFound_throwsResourceNotFoundException() {
        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> characterService.getUserCharacters("missing@test.com"))
                .isInstanceOf(com.rpgcharacter.exception.ResourceNotFoundException.class);
    }

    // ==================== getPublicCharacters ====================

    @Test
    void getPublicCharacters_withNoFilters_callsFindByIsPublicTrue() {
        Character character = buildCharacter("char-1", "owner-id", true);
        Page<Character> page = new PageImpl<>(List.of(character));
        Pageable pageable = PageRequest.of(0, 10);

        when(characterRepository.findByIsPublicTrue(pageable)).thenReturn(page);
        when(userRepository.findAllById(any())).thenReturn(List.of());
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.CardResponse.class)))
                .thenReturn(new CharacterDTO.CardResponse());

        Page<CharacterDTO.CardResponse> result = characterService.getPublicCharacters(pageable, null, null, null);

        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(characterRepository).findByIsPublicTrue(pageable);
        verify(characterRepository, never()).findByIsPublicTrueAndSystem(any(), any());
    }

    @Test
    void getPublicCharacters_withSystemFilter_callsFindByIsPublicTrueAndSystem() {
        Character character = buildCharacter("char-1", "owner-id", true);
        Page<Character> page = new PageImpl<>(List.of(character));
        Pageable pageable = PageRequest.of(0, 10);

        when(characterRepository.findByIsPublicTrueAndSystem("Root", pageable)).thenReturn(page);
        when(userRepository.findAllById(any())).thenReturn(List.of());
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.CardResponse.class)))
                .thenReturn(new CharacterDTO.CardResponse());

        Page<CharacterDTO.CardResponse> result = characterService.getPublicCharacters(pageable, "Root", null, null);

        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(characterRepository).findByIsPublicTrueAndSystem("Root", pageable);
    }

    @Test
    void getPublicCharacters_withClassNameFilter_callsFindByIsPublicTrueAndClassName() {
        Character character = buildCharacter("char-1", "owner-id", true);
        Page<Character> page = new PageImpl<>(List.of(character));
        Pageable pageable = PageRequest.of(0, 10);

        when(characterRepository.findByIsPublicTrueAndClassName("Arbiter", pageable)).thenReturn(page);
        when(userRepository.findAllById(any())).thenReturn(List.of());
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.CardResponse.class)))
                .thenReturn(new CharacterDTO.CardResponse());

        Page<CharacterDTO.CardResponse> result = characterService.getPublicCharacters(pageable, null, "Arbiter", null);

        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(characterRepository).findByIsPublicTrueAndClassName("Arbiter", pageable);
    }

    @Test
    void getPublicCharacters_withBothFilters_callsFindByIsPublicTrueAndSystemAndClassName() {
        Character character = buildCharacter("char-1", "owner-id", true);
        Page<Character> page = new PageImpl<>(List.of(character));
        Pageable pageable = PageRequest.of(0, 10);

        when(characterRepository.findByIsPublicTrueAndSystemAndClassName("Root", "Arbiter", pageable)).thenReturn(page);
        when(userRepository.findAllById(any())).thenReturn(List.of());
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.CardResponse.class)))
                .thenReturn(new CharacterDTO.CardResponse());

        Page<CharacterDTO.CardResponse> result = characterService.getPublicCharacters(pageable, "Root", "Arbiter", null);

        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(characterRepository).findByIsPublicTrueAndSystemAndClassName("Root", "Arbiter", pageable);
    }

    @Test
    void getPublicCharacters_withAuthenticatedUser_resolvesLikedByCurrentUser() {
        Character character = buildCharacter("char-1", "creator-id", true);
        character.setLikedByUserIds(new ArrayList<>(List.of("user-id")));
        Page<Character> page = new PageImpl<>(List.of(character));
        Pageable pageable = PageRequest.of(0, 10);
        User currentUser = buildUser("user-id", "user@test.com");

        when(characterRepository.findByIsPublicTrue(pageable)).thenReturn(page);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(currentUser));
        when(userRepository.findAllById(any())).thenReturn(List.of());
        CharacterDTO.CardResponse cardResponse = new CharacterDTO.CardResponse();
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.CardResponse.class))).thenReturn(cardResponse);

        characterService.getPublicCharacters(pageable, null, null, "user@test.com");

        verify(userRepository).findByEmail("user@test.com");
        assertThat(cardResponse.isLikedByCurrentUser()).isTrue();
    }

    // ==================== deleteCharacter (public character) ====================

    @Test
    void deleteCharacter_publicCharacter_byOwner_decrementsPublicCharacters() {
        Character character = buildCharacter("char-1", "owner-id", true); // public
        User owner = buildUser("owner-id", "owner@test.com");
        owner.setPublicCharacters(2L);

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));

        characterService.deleteCharacter("char-1", "owner@test.com");

        assertThat(owner.getPublicCharacters()).isEqualTo(1L);
        verify(characterRepository).delete(character);
    }

    // ==================== getCharacter (edge cases) ====================

    @Test
    void getCharacter_whenPrivateAndUserIdIsNull_returnsWithoutAuth() {
        Character character = buildCharacter("char-1", null, false); // private, anonymous
        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.Response.class)))
                .thenReturn(new CharacterDTO.Response());

        assertThatCode(() -> characterService.getCharacter("char-1", null))
                .doesNotThrowAnyException();
    }

    @Test
    void getCharacter_whenPrivateAndAccessedByOwner_returnsCharacter() {
        Character character = buildCharacter("char-1", "owner-id", false);
        User owner = buildUser("owner-id", "owner@test.com");

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.Response.class)))
                .thenReturn(new CharacterDTO.Response());

        assertThatCode(() -> characterService.getCharacter("char-1", "owner@test.com"))
                .doesNotThrowAnyException();
    }

    @Test
    void getCharacter_whenPrivateAndAccessedByNonOwner_throwsUnauthorizedException() {
        Character character = buildCharacter("char-1", "owner-id", false);
        User other = buildUser("other-id", "other@test.com");

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> characterService.getCharacter("char-1", "other@test.com"))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void getCharacter_whenNotFound_throwsResourceNotFoundException() {
        when(characterRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> characterService.getCharacter("missing", null))
                .isInstanceOf(com.rpgcharacter.exception.ResourceNotFoundException.class);
    }

    // ==================== toggleLike (edge cases) ====================

    @Test
    void toggleLike_whenUserNotFound_throwsResourceNotFoundException() {
        Character character = buildCharacter("char-1", "creator-id", true);

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> characterService.toggleLike("char-1", "missing@test.com"))
                .isInstanceOf(com.rpgcharacter.exception.ResourceNotFoundException.class);
    }

    // ==================== updateCharacter (anonymous character, no email) ====================

    @Test
    void updateCharacter_whenNullEmailAndCharacterHasNoOwner_savesCharacter() {
        Character character = buildCharacter("char-1", null, false); // no owner
        CharacterDTO.UpdateRequest request = CharacterDTO.UpdateRequest.builder()
                .name("Updated Name").build();

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(characterRepository.save(any())).thenReturn(character);
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.Response.class)))
                .thenReturn(new CharacterDTO.Response());

        assertThatCode(() -> characterService.updateCharacter("char-1", request, null))
                .doesNotThrowAnyException();

        verify(characterRepository).save(character);
    }

    @Test
    void updateCharacter_whenNullEmailAndCharacterHasOwner_throwsUnauthorizedException() {
        Character character = buildCharacter("char-1", "owner-id", false); // has owner
        CharacterDTO.UpdateRequest request = CharacterDTO.UpdateRequest.builder().build();

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));

        assertThatThrownBy(() -> characterService.updateCharacter("char-1", request, null))
                .isInstanceOf(UnauthorizedException.class);

        verify(characterRepository, never()).save(any());
    }

    @Test
    void updateCharacter_withAllMappableFields_exercisesAllMappers() {
        Character character = buildCharacter("char-1", "owner-id", false);
        User owner = buildUser("owner-id", "owner@test.com");

        CharacterDTO.UpdateRequest request = CharacterDTO.UpdateRequest.builder()
                .name("New Name")
                .species("Fox")
                .demeanor("Calm")
                .details("Tall")
                .avatarImage("avatar.png")
                .equipment("Sword and shield")
                .stats(List.of(new CharacterDTO.StatDTO("Cunning", 1), new CharacterDTO.StatDTO("Might", 0)))
                .background(List.of(new CharacterDTO.BackgroundAnswerDTO("Where are you from?", "The woods")))
                .drives(List.of(new CharacterDTO.SelectedOptionDTO("Justice", "Uphold the law", true)))
                .nature(List.of(new CharacterDTO.SelectedOptionDTO("Defender", "Protect others", true)))
                .moves(List.of(new CharacterDTO.SelectedOptionDTO("Strike", "Attack move", true)))
                .connections(List.of(new CharacterDTO.ConnectionDTO("friend", "Alice", "Old friend", "Met in battle")))
                .weaponSkills(new CharacterDTO.WeaponSkillsDTO(2,
                        List.of(new CharacterDTO.SkillDTO("Swords", "Blade mastery", true))))
                .roguishFeats(new CharacterDTO.RoguishFeatsDTO(1,
                        List.of(new CharacterDTO.FeatDTO("Pickpocket", "Steal small items", true))))
                .reputation(new CharacterDTO.ReputationDTO(
                        Map.of("Cats", new CharacterDTO.FactionReputationDTO(3, 1))))
                .build();

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(characterRepository.save(any())).thenReturn(character);
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.Response.class)))
                .thenReturn(new CharacterDTO.Response());

        assertThatCode(() -> characterService.updateCharacter("char-1", request, "owner@test.com"))
                .doesNotThrowAnyException();

        // Verify all mapped fields were applied to the character
        assertThat(character.getName()).isEqualTo("New Name");
        assertThat(character.getSpecies()).isEqualTo("Fox");
        assertThat(character.getEquipment()).isEqualTo("Sword and shield");
        assertThat(character.getStats()).hasSize(2);
        assertThat(character.getBackground()).hasSize(1);
        assertThat(character.getDrives()).hasSize(1);
        assertThat(character.getNature()).hasSize(1);
        assertThat(character.getMoves()).hasSize(1);
        assertThat(character.getConnections()).hasSize(1);
        assertThat(character.getWeaponSkills().getSkills()).hasSize(1);
        assertThat(character.getRoguishFeats().getFeats()).hasSize(1);
        assertThat(character.getReputation().getFactions()).containsKey("Cats");
        verify(characterRepository).save(character);
    }

    // ==================== toggleLike — likedByUserIds null ====================

    @Test
    void toggleLike_whenLikedByUserIdsIsNull_treatsAsEmpty() {
        Character character = buildCharacter("char-1", "creator-id", true);
        character.setLikedByUserIds(null); // force null
        User liker = buildUser("liker-id", "liker@test.com");

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(userRepository.findByEmail("liker@test.com")).thenReturn(Optional.of(liker));
        when(characterRepository.save(any())).thenReturn(character);
        when(userRepository.findAllById(any())).thenReturn(List.of());
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.CardResponse.class)))
                .thenReturn(new CharacterDTO.CardResponse());

        assertThatCode(() -> characterService.toggleLike("char-1", "liker@test.com"))
                .doesNotThrowAnyException();
        assertThat(character.getLikeCount()).isEqualTo(1);
    }

    // ==================== resolveCreatorNames edge cases ====================

    @Test
    void getPublicCharacters_withEmptyPage_callsResolveCreatorNamesWithEmptyList() {
        Page<Character> emptyPage = new PageImpl<>(List.of());
        Pageable pageable = PageRequest.of(0, 10);

        when(characterRepository.findByIsPublicTrue(pageable)).thenReturn(emptyPage);

        Page<CharacterDTO.CardResponse> result = characterService.getPublicCharacters(pageable, null, null, null);

        assertThat(result.getTotalElements()).isEqualTo(0);
        // userRepository.findAllById should NOT be called when list is empty
        verify(userRepository, never()).findAllById(any());
    }

    @Test
    void getPublicCharacters_withAnonymousCharacter_setsCreatorNameAnonymous() {
        Character character = buildCharacter("char-1", null, true); // no userId
        Page<Character> page = new PageImpl<>(List.of(character));
        Pageable pageable = PageRequest.of(0, 10);

        when(characterRepository.findByIsPublicTrue(pageable)).thenReturn(page);
        CharacterDTO.CardResponse card = new CharacterDTO.CardResponse();
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.CardResponse.class))).thenReturn(card);

        characterService.getPublicCharacters(pageable, null, null, null);

        assertThat(card.getCreatorName()).isEqualTo("Anonymous");
    }

    @Test
    void getUserCharacters_whenUserHasNullName_setsUnknownAdventurer() {
        User user = buildUser("user-id", "user@test.com");
        user.setName(null); // null name → should resolve to "Unknown adventurer"
        Character char1 = buildCharacter("char-1", "user-id", false);

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(characterRepository.findByUserId("user-id")).thenReturn(List.of(char1));
        when(userRepository.findAllById(any())).thenReturn(List.of(user));
        CharacterDTO.CardResponse card = new CharacterDTO.CardResponse();
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.CardResponse.class))).thenReturn(card);

        characterService.getUserCharacters("user@test.com");

        assertThat(card.getCreatorName()).isEqualTo("Unknown adventurer");
    }

    // ==================== updateCharacter — isPublic same value / no userId ====================

    @Test
    void updateCharacter_whenIsPublicSameAsCurrentValue_skipsUserStatUpdate() {
        Character character = buildCharacter("char-1", "owner-id", true); // already public
        User owner = buildUser("owner-id", "owner@test.com");
        CharacterDTO.UpdateRequest request = CharacterDTO.UpdateRequest.builder()
                .isPublic(true).build(); // same value → no stat update

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(characterRepository.save(any())).thenReturn(character);
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.Response.class)))
                .thenReturn(new CharacterDTO.Response());

        characterService.updateCharacter("char-1", request, "owner@test.com");

        verify(userRepository, never()).findById(any());
    }

    @Test
    void updateCharacter_makingPublicWhenCharacterHasNoOwner_skipsUserStatUpdate() {
        Character character = buildCharacter("char-1", null, false); // no owner
        CharacterDTO.UpdateRequest request = CharacterDTO.UpdateRequest.builder()
                .isPublic(true).build();

        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(characterRepository.save(any())).thenReturn(character);
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.Response.class)))
                .thenReturn(new CharacterDTO.Response());

        characterService.updateCharacter("char-1", request, null);

        verify(userRepository, never()).findById(any());
    }

    // ==================== getCharacter — userId blank (not null) ====================

    @Test
    void getCharacter_whenPrivateAndUserIdIsBlank_returnsWithoutAuth() {
        Character character = buildCharacter("char-1", "  ", false); // blank userId
        when(characterRepository.findById("char-1")).thenReturn(Optional.of(character));
        when(modelMapper.map(any(Character.class), eq(CharacterDTO.Response.class)))
                .thenReturn(new CharacterDTO.Response());

        assertThatCode(() -> characterService.getCharacter("char-1", null))
                .doesNotThrowAnyException();
    }
}
