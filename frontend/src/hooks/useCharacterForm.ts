import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { FieldPath, FieldPathValue } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { characterAPI, classTemplateAPI } from '../services/api';
import { useAuthStore, useCharacterStore, useUIStore } from '../store';
import { getClassDefaultAvatar } from '../utils/avatarUrl';
import type { Character } from '../types';

export interface CharacterFormData {
  name: string;
  species: string;
  details: string;
  demeanor: string;
  avatarImage: string;
  nature: { name: string; description: string };
  drives: Array<{ name: string; description: string }>;
  background: Array<{ question: string; answer: string }>;
  connections: Array<{ name: string; answer: string }>;
  stats: Array<{ name: string; value: number }>;
  reputations: Array<{ name: string; notoriety: number; prestige: number }>;
  moves: Array<{ name: string; description: string }>;
  roguishFeats: Array<{ name: string; description: string }>;
  weaponSkills: Array<{ name: string; description: string }>;
  equipment: string;
}

export function useCharacterForm(onSuccess: (characterId: string) => void) {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { addSessionCharacter } = useCharacterStore();
  const { selectedSystem } = useUIStore();

  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [isPublic, setIsPublic] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const { data: templates } = useQuery({
    queryKey: ['classTemplates', selectedSystem],
    queryFn: () => classTemplateAPI.getBySystem(selectedSystem),
  });

  const { data: existingCharacter } = useQuery({
    queryKey: ['character', editId],
    queryFn: () => characterAPI.getById(editId!),
    enabled: isEditing,
  });

  const { register, setValue, handleSubmit, control, reset, formState } = useForm<CharacterFormData>({
    defaultValues: {
      name: '',
      species: '',
      details: '',
      demeanor: '',
      avatarImage: '',
      nature: { name: '', description: '' },
      drives: [],
      background: [],
      connections: [],
      stats: [],
      reputations: [],
      moves: [],
      roguishFeats: [],
      weaponSkills: [],
      equipment: '',
    },
  });

  const watchedFields = {
    name: useWatch({ control, name: 'name' }),
    background: useWatch({ control, name: 'background' }),
    connections: useWatch({ control, name: 'connections' }),
    stats: useWatch({ control, name: 'stats' }),
    reputations: useWatch({ control, name: 'reputations' }),
    nature: useWatch({ control, name: 'nature' }),
    drives: useWatch({ control, name: 'drives' }),
    moves: useWatch({ control, name: 'moves' }),
    roguishFeats: useWatch({ control, name: 'roguishFeats' }),
    weaponSkills: useWatch({ control, name: 'weaponSkills' }),
    avatarImage: useWatch({ control, name: 'avatarImage' }),
  };

  const setField = useCallback(
    <K extends FieldPath<CharacterFormData>>(key: K) =>
      (val: FieldPathValue<CharacterFormData, K>) =>
        setValue(key, val),
    [setValue]
  );

  const selectedClass = useMemo(
    () => templates?.[selectedClassIndex] ?? templates?.[0],
    [templates, selectedClassIndex]
  );

  const preSelectedFeats = useMemo(
    () =>
      selectedClass?.roguishFeats?.feats
        .filter((f) => f.selected)
        .map((f) => ({ name: f.name, description: f.description })) || [],
    [selectedClass?.roguishFeats?.feats]
  );

  // In the template, 'selected: true' on weapon skills means the skill is available to pick,
  // not that it should be pre-selected. New characters start with none chosen.
  const preSelectedSkills = useMemo(() => [], []);

  const saveMutation = useMutation({
    mutationFn: async (data: CharacterFormData) => {
      if (!selectedClass) throw new Error('No class selected');

      const apiData = {
        name: data.name,
        system: selectedClass.system,
        className: selectedClass.className,
        species: data.species,
        demeanor: data.demeanor,
        details: data.details,
        avatarImage: data.avatarImage,
        stats: data.stats,
        background: data.background,
        connections: data.connections.map(c => ({
          characterName: c.name || '',
          description: c.answer || '',
        })),
        isPublic,
        nature: [{ ...data.nature, selected: true }],
        drives: data.drives.map(d => ({ ...d, selected: true })),
        moves: data.moves.map(m => ({ ...m, selected: true })),
        roguishFeats: {
          remaining: 0,
          feats: data.roguishFeats.map(f => ({ ...f, selected: true })),
        },
        weaponSkills: {
          remaining: 0,
          skills: data.weaponSkills.map(s => ({ ...s, selected: true })),
        },
        equipment: data.equipment,
        reputation: {
          factions: data.reputations.reduce((acc, rep) => {
            acc[rep.name] = { prestige: rep.prestige, notoriety: rep.notoriety };
            return acc;
          }, {} as Record<string, { prestige: number; notoriety: number }>),
        },
      };

      if (isEditing && editId) {
        return characterAPI.update(editId, apiData as Partial<Character>);
      } else {
        return characterAPI.create(apiData as Partial<Character>);
      }
    },
    onSuccess: (data) => {
      if (!isAuthenticated && !isEditing) {
        addSessionCharacter(data);
      }
      queryClient.invalidateQueries({ queryKey: ['myCharacters'] });
      toast.success(isEditing ? t('characterForm.characterUpdated') : t('characterForm.characterCreated'));
      reset(); // clear dirty state before navigating so useBlocker doesn't trigger
      if (data.id) {
        onSuccess(data.id);
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save character';
      toast.error(errorMessage);
    },
  });

  const onSubmit = async (data: CharacterFormData) => {
    if (!selectedClass) {
      toast.error(t('characterForm.selectClassRequired'));
      return;
    }

    const errors: Record<string, string> = {};

    if (!data.name.trim()) {
      errors.name = t('characterForm.nameRequired');
    }

    const templateStats = selectedClass.stats || [];
    const hasStatBoost = data.stats.some((s) => {
      const base = templateStats.find((t) => t.name.toLowerCase() === s.name.toLowerCase());
      return base && s.value !== base.value;
    });
    if (!hasStatBoost && templateStats.length > 0) {
      errors.stats = t('characterForm.statBoostRequired');
    }

    const requiredMoves = selectedClass.maxMoves ?? 3;
    if (data.moves.length < requiredMoves) {
      errors.moves = t('characterForm.movesRequired', { count: requiredMoves, selected: data.moves.length });
    }

    const featsRemaining = selectedClass.roguishFeats?.remaining ?? 0;
    if (featsRemaining > 0) {
      const preSelectedCount = selectedClass.roguishFeats?.feats.filter((f) => f.selected).length ?? 0;
      const requiredFeats = preSelectedCount + featsRemaining;
      if (data.roguishFeats.length < requiredFeats) {
        errors.roguishFeats = t('characterForm.roguishFeatsRequired', {
          count: featsRemaining,
          selected: Math.max(0, data.roguishFeats.length - preSelectedCount),
          total: featsRemaining,
        });
      }
    }

    const skillsRemaining = selectedClass.weaponSkills?.remaining ?? 0;
    if (skillsRemaining > 0) {
      if (data.weaponSkills.length < skillsRemaining) {
        errors.weaponSkills = t('characterForm.weaponSkillsRequired', {
          count: skillsRemaining,
          selected: data.weaponSkills.length,
        });
      }
    }

    const requiredDrives = selectedClass.maxDrives ?? 2;
    if (data.drives.length < requiredDrives) {
      errors.drives = t('characterForm.drivesRequired', { count: requiredDrives, selected: data.drives.length });
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error(t('characterForm.requiredFieldsMissing'));
      return;
    }

    setValidationErrors({});

    // Auto-add reputation entries from background answers if the player hasn't added them manually.
    // The ReputationSelector already handles the prestige/notoriety bonus, so we just ensure the faction exists.
    const reputations = [...data.reputations];
    const servedMost = data.background?.[3]?.answer?.trim().toLowerCase();
    const specialEnmity = data.background?.[4]?.answer?.trim().toLowerCase();

    if (servedMost && !reputations.some((r) => r.name.trim().toLowerCase() === servedMost)) {
      reputations.push({ name: data.background[3].answer, notoriety: 0, prestige: 2 });
    }

    if (specialEnmity && !reputations.some((r) => r.name.trim().toLowerCase() === specialEnmity)) {
      reputations.push({ name: data.background[4].answer, notoriety: 1, prestige: 0 });
    }

    const avatarImage = data.avatarImage || getClassDefaultAvatar(selectedClass.className);

    saveMutation.mutate({ ...data, reputations, avatarImage });
  };

  // reset() sets defaultValues baseline so isDirty stays false until the user actually edits
  useEffect(() => {
    if (selectedClass && !isEditing) {
      const firstNature = selectedClass.nature?.[0];
      reset({
        name: '',
        species: '',
        details: '',
        demeanor: '',
        avatarImage: '',
        nature: firstNature ? { name: firstNature.name, description: firstNature.description } : { name: '', description: '' },
        drives: [],
        moves: selectedClass.moves?.filter(m => m.mandatory).map(m => ({ name: m.name, description: m.description })) || [],
        roguishFeats: preSelectedFeats,
        weaponSkills: preSelectedSkills,
        stats: selectedClass.stats || [],
        background: selectedClass.background?.map(q => ({ question: q.name, answer: '' })) || [],
        connections: [],
        reputations: [],
        equipment: '',
      });
    }
  }, [selectedClass, preSelectedFeats, preSelectedSkills, reset, isEditing]);

  useEffect(() => {
    if (existingCharacter && isEditing) {
      const selectedNature = existingCharacter.nature.find(n => n.selected);
      const selectedDrives = existingCharacter.drives.filter(d => d.selected).map(d => ({ name: d.name, description: d.description }));
      const selectedMoves = existingCharacter.moves.filter(m => m.selected).map(m => ({ name: m.name, description: m.description }));
      const selectedFeats = existingCharacter.roguishFeats.feats.filter(f => f.selected).map(f => ({ name: f.name, description: f.description }));
      const selectedSkills = existingCharacter.weaponSkills.skills.filter(s => s.selected).map(s => ({ name: s.name, description: s.description }));

      const reputations = Object.entries(existingCharacter.reputation.factions).map(([name, rep]) => ({
        name,
        notoriety: rep.notoriety,
        prestige: rep.prestige,
      }));

      reset({
        name: existingCharacter.name,
        species: existingCharacter.species,
        details: existingCharacter.details,
        demeanor: existingCharacter.demeanor,
        avatarImage: existingCharacter.avatarImage,
        nature: selectedNature ? { name: selectedNature.name, description: selectedNature.description } : { name: '', description: '' },
        drives: selectedDrives,
        background: existingCharacter.background,
        connections: existingCharacter.connections.map(c => ({
          name: c.characterName || '',
          answer: c.description || '',
        })),
        stats: existingCharacter.stats,
        reputations,
        moves: selectedMoves,
        roguishFeats: selectedFeats,
        weaponSkills: selectedSkills,
        equipment: typeof existingCharacter.equipment === 'string'
          ? existingCharacter.equipment
          : JSON.stringify(existingCharacter.equipment),
      });

      setIsPublic(existingCharacter.isPublic || false);

      if (templates) {
        const classIndex = templates.findIndex((t) => t.className === existingCharacter.className);
        if (classIndex !== -1) {
          setSelectedClassIndex(classIndex);
        }
      }
    }
  }, [existingCharacter, isEditing, reset, templates]);

  return {
    // Form state
    register,
    handleSubmit,
    control,
    watchedFields,
    setField,

    // Data
    templates,
    selectedClass,
    selectedClassIndex,
    setSelectedClassIndex,
    isPublic,
    setIsPublic,

    // Status
    isEditing,
    editId,
    isAuthenticated,
    isSaving: saveMutation.isPending,
    isDirty: formState.isDirty,
    validationErrors,

    // Actions
    onSubmit,
  };
}
