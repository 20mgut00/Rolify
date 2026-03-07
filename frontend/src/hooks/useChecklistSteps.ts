import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChecklistStep } from '../components/character/CharacterChecklist';
import type { ClassTemplate } from '../types';
import type { CharacterFormData } from './useCharacterForm';

type ChecklistFields = Pick<
  CharacterFormData,
  'name' | 'nature' | 'drives' | 'background' | 'connections' | 'stats' | 'reputations' | 'moves' | 'roguishFeats' | 'weaponSkills'
>;

export function useChecklistSteps(
  selectedClass: ClassTemplate | undefined,
  watchedFields: ChecklistFields
): ChecklistStep[] {
  const { t } = useTranslation();

  return useMemo(() => {
    if (!selectedClass) return [];

    const maxDrives = selectedClass.maxDrives ?? 2;
    const maxMoves = selectedClass.maxMoves ?? 3;
    const templateStats = selectedClass.stats ?? [];
    const featsRemaining = selectedClass.roguishFeats?.remaining ?? 0;
    const preSelectedFeatsCount = selectedClass.roguishFeats?.feats.filter((f) => f.selected).length ?? 0;
    const skillsRemaining = selectedClass.weaponSkills?.remaining ?? 0;

    return [
      {
        label: t('checklist.step1'),
        completed: true,
      },
      {
        label: t('checklist.step2'),
        completed: !!watchedFields.name?.trim(),
      },
      {
        label: t('checklist.step3'),
        completed: !!watchedFields.nature?.name,
      },
      {
        label: t('checklist.step4'),
        completed: (watchedFields.drives?.length ?? 0) >= maxDrives,
      },
      {
        label: t('checklist.step5'),
        completed:
          (watchedFields.background?.length ?? 0) > 0 &&
          watchedFields.background.every((b) => b.answer?.trim()),
      },
      {
        label: t('checklist.step6'),
        completed: watchedFields.connections?.some((c) => c.answer?.trim()) ?? false,
      },
      {
        label: t('checklist.step7'),
        completed:
          watchedFields.stats?.some((s) => {
            const base = templateStats.find(
              (ts) => ts.name.toLowerCase() === s.name.toLowerCase()
            );
            return base !== undefined && s.value !== base.value;
          }) ?? false,
      },
      {
        label: t('checklist.step8'),
        completed: (watchedFields.reputations?.length ?? 0) > 0,
      },
      {
        label: t('checklist.step9'),
        completed: (watchedFields.moves?.length ?? 0) >= maxMoves,
      },
      {
        label: t('checklist.step10'),
        completed:
          (featsRemaining === 0 ||
            (watchedFields.roguishFeats?.length ?? 0) >= preSelectedFeatsCount + featsRemaining) &&
          (skillsRemaining === 0 ||
            (watchedFields.weaponSkills?.length ?? 0) >= skillsRemaining),
      },
    ];
  }, [selectedClass, watchedFields, t]);
}
