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
  '& .MuiInputBase-root': { color: '#0F2B3A' },
  '& .MuiInputBase-input': { color: '#0F2B3A' },
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
  const maxDrives = selectedClass.maxDrives ?? 2;

  return (
    <>
      {/* Nature */}
      <div>
        <Card label="Nature" desc="Select the nature that best describes your character">
          <NatureSelector
            nature={selectedClass.nature}
            value={watchedFields.nature}
            onNatureSelect={onNatureChange}
          />
        </Card>
      </div>

      {/* Background - row-span-3 */}
      <div className="row-span-3">
        <Card label="Background">
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
          label="Drives"
          desc={`Select ${maxDrives} drives for your character`}
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
        <Card label="Connections">
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
        <Card label="Stats" desc="Add +1 to a stat of your choice, Max +2" required error={validationErrors.stats}>
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
        <Card label="Reputation" desc="Set your notoriety and prestige with each faction">
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
        <Card label="Moves" desc="Choose three moves for your character" required error={validationErrors.moves}>
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
          label="Roguish Feats"
          desc={`Choose your roguish feats (add ${selectedClass.roguishFeats?.remaining ?? 0} more)`}
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
          label="Weapon Skills"
          desc={`Choose your weapon skills (add ${selectedClass.weaponSkills?.remaining ?? 0} more)`}
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
        <Card label="Equipment & Notes" desc="Add your character's equipment and any additional notes">
          <TextField
            id="equipment"
            placeholder="Enter equipment and notes..."
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
