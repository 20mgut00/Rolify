import { useTranslation } from 'react-i18next';
import { UseFormRegister } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Card from '../common/Card';
import NatureSelector from '../root/NatureSelector';
import DriveSelector from '../root/DriveSelector';
import BackgroundSelector from '../root/BackgroundSelector';
import ConnectionsSelector from '../root/ConnectionsSelector';
import AttributesSelector from '../root/AttributesSelector';
import ReputationSelector from '../root/ReputationSelector';
import MovesSelector from '../root/MovesSelector';
import RoguishFeatsSelector from '../root/RoguishFeatsSelector';
import WeaponSkillsSelector from '../root/WeaponSkillsSelector';
import type { CharacterFormData } from '../../hooks/useCharacterForm';
import type { ClassTemplate } from '../../types';

interface CharacterFormFieldsProps {
  register: UseFormRegister<CharacterFormData>;
  selectedClass: ClassTemplate;
  isEditing: boolean;
  editId: string | null;
  selectedClassIndex: number;
  watchedFields: {
    background: Array<{ question: string; answer: string }>;
    connections: Array<{ name: string; answer: string }>;
    stats: Array<{ name: string; value: number }>;
    reputations: Array<{ name: string; notoriety: number; prestige: number }>;
    nature: { name: string; description: string };
    drives: Array<{ name: string; description: string }>;
    moves: Array<{ name: string; description: string }>;
    roguishFeats: Array<{ name: string; description: string }>;
    weaponSkills: Array<{ name: string; description: string }>;
  };
  onNatureChange: (value: { name: string; description: string }) => void;
  onDrivesChange: (value: Array<{ name: string; description: string }>) => void;
  onBackgroundChange: (value: Array<{ question: string; answer: string }>) => void;
  onConnectionsChange: (value: Array<{ name: string; answer: string }>) => void;
  onStatsChange: (value: Array<{ name: string; value: number }>) => void;
  onReputationsChange: (value: Array<{ name: string; notoriety: number; prestige: number }>) => void;
  onMovesChange: (value: Array<{ name: string; description: string }>) => void;
  onFeatsChange: (value: Array<{ name: string; description: string }>) => void;
  onSkillsChange: (value: Array<{ name: string; description: string }>) => void;
  validationErrors?: Record<string, string>;
}

const textFieldStyles = {
  '& .MuiInputBase-root': { color: 'var(--color-primary-dark)' },
  '& .MuiInputBase-input': { color: 'var(--color-primary-dark)' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D9A441' }
};

const inputProps = {
  input: {
    className: 'font-merriweather',
  },
};

export default function CharacterFormFields({
  register,
  selectedClass,
  isEditing,
  editId,
  selectedClassIndex,
  watchedFields,
  onNatureChange,
  onDrivesChange,
  onBackgroundChange,
  onConnectionsChange,
  onStatsChange,
  onReputationsChange,
  onMovesChange,
  onFeatsChange,
  onSkillsChange,
  validationErrors = {},
}: CharacterFormFieldsProps) {
  const { t } = useTranslation();
  const maxDrives = selectedClass.maxDrives ?? 2;

  return (
    <>
      {/* Nature */}
      <div>
        <Card label={t('characterFormFields.nature')} desc={t('characterFormFields.natureDesc')}>
          <NatureSelector
            nature={selectedClass.nature}
            value={watchedFields.nature}
            onNatureSelect={onNatureChange}
          />
        </Card>
      </div>

      {/* Background - row-span-3 */}
      <div className="row-span-3">
        <Card label={t('characterFormFields.background')}>
          <BackgroundSelector
            key={isEditing ? `background-edit-${editId}` : `background-${selectedClass.className || selectedClassIndex}`}
            background={selectedClass.background}
            onBackgroundSelect={onBackgroundChange}
            initialValues={watchedFields.background}
            disabled={isEditing}
          />
        </Card>
      </div>

      {/* Drives - row-span-2 */}
      <div className="row-span-2">
        <Card
          label={t('characterFormFields.drives')}
          desc={t('characterFormFields.drivesDesc', { count: maxDrives })}
          required={maxDrives > 0}
          error={validationErrors.drives}
        >
          <DriveSelector
            drives={selectedClass.drives}
            value={watchedFields.drives}
            onDrivesSelect={onDrivesChange}
          />
        </Card>
      </div>

      {/* Connections */}
      <div>
        <Card label={t('characterFormFields.connections')}>
          <ConnectionsSelector
            key={isEditing ? `connections-edit-${editId}` : `connections-${selectedClass.className || selectedClassIndex}`}
            connections={selectedClass.connections}
            onConnectionsSelect={onConnectionsChange}
            initialValues={watchedFields.connections}
          />
        </Card>
      </div>

      {/* Stats */}
      <div>
        <Card label={t('characterFormFields.stats')} desc={t('characterFormFields.statsDesc')} required error={validationErrors.stats}>
          <AttributesSelector
            key={isEditing ? `stats-edit-${editId}` : `stats-${selectedClass.className || selectedClassIndex}`}
            stats={selectedClass.stats}
            onAttributesSelect={onStatsChange}
            initialValues={watchedFields.stats}
          />
        </Card>
      </div>

      {/* Reputation - col-span-2 */}
      <div className="col-span-2">
        <Card label={t('characterFormFields.reputation')} desc={t('characterFormFields.reputationDesc')}>
          <ReputationSelector
            key={isEditing ? `reputation-edit-${editId}` : `reputation-${selectedClass.className || selectedClassIndex}`}
            backgroundAnswers={watchedFields.background}
            onChange={onReputationsChange}
            initialValues={watchedFields.reputations}
          />
        </Card>
      </div>

      {/* Moves - col-span-2 */}
      <div className="col-span-2">
        <Card label={t('characterFormFields.moves')} desc={t('characterFormFields.movesDesc')} required error={validationErrors.moves}>
          <MovesSelector
            moves={selectedClass.moves}
            value={watchedFields.moves}
            onMovesSelect={onMovesChange}
          />
        </Card>
      </div>

      {/* Roguish Feats */}
      <div>
        <Card
          label={t('characterFormFields.roguishFeats')}
          desc={t('characterFormFields.roguishFeatsDesc', { count: selectedClass.roguishFeats?.remaining ?? 0 })}
          required={(selectedClass.roguishFeats?.remaining ?? 0) > 0}
          error={validationErrors.roguishFeats}
        >
          <RoguishFeatsSelector
            roguishFeats={selectedClass.roguishFeats}
            value={watchedFields.roguishFeats}
            onFeatsSelect={onFeatsChange}
          />
        </Card>
      </div>

      {/* Weapon Skills */}
      <div>
        <Card
          label={t('characterFormFields.weaponSkills')}
          desc={t('characterFormFields.weaponSkillsDesc', { count: selectedClass.weaponSkills?.remaining ?? 0 })}
          required={(selectedClass.weaponSkills?.remaining ?? 0) > 0}
          error={validationErrors.weaponSkills}
        >
          <WeaponSkillsSelector
            weaponSkills={selectedClass.weaponSkills}
            value={watchedFields.weaponSkills}
            onSkillsSelect={onSkillsChange}
          />
        </Card>
      </div>

      {/* Equipment - col-span-2 */}
      <div className="col-span-2">
        <Card label={t('characterFormFields.equipment')} desc={t('characterFormFields.equipmentDesc')}>
          <TextField
            id="equipment"
            placeholder={t('characterFormFields.equipmentPlaceholder')}
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            {...register('equipment')}
            sx={textFieldStyles}
            slotProps={inputProps}
          />
        </Card>
      </div>
    </>
  );
}
