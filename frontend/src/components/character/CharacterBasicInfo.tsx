import { UseFormRegister } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Card from '../common/Card';
import ImageSelector from '../common/ImageSelector';
import type { CharacterFormData } from '../../hooks/useCharacterForm';

interface CharacterBasicInfoProps {
  register: UseFormRegister<CharacterFormData>;
  avatarImage: string;
  defaultImage?: string;
  onImageChange: (image: string) => void;
  validationErrors?: Record<string, string>;
  isEditing?: boolean;
}

const textFieldStyles = {
  '& .MuiInputBase-root': {
    color: 'var(--color-primary-dark)',
    backgroundColor: 'var(--color-primary-light)',
  },
  '& .MuiInputBase-input': {
    color: 'var(--color-primary-dark)',
  },
  '& .MuiInputBase-input::placeholder': {
    color: 'var(--color-primary-dark)',
    opacity: 0.7,
  },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D9A441' },
  '& .MuiInputBase-root.Mui-disabled': {
    color: 'var(--color-primary-dark)',
    opacity: 0.6,
    WebkitTextFillColor: 'var(--color-primary-dark)',
  },
  '& .MuiInputBase-input.Mui-disabled': {
    color: 'var(--color-primary-dark)',
    WebkitTextFillColor: 'var(--color-primary-dark)',
  },
  '& .MuiOutlinedInput-notchedOutline.Mui-disabled': {
    borderColor: '#D9A441',
    opacity: 0.6,
  }
};

const inputProps = {
  input: {
    className: 'font-merriweather',
  },
};

export default function CharacterBasicInfo({
  register,
  avatarImage,
  defaultImage,
  onImageChange,
  validationErrors = {},
  isEditing = false,
}: CharacterBasicInfoProps) {
  return (
    <>
      {/* Avatar Image - row-span-4 */}
      <div className="row-span-4">
        <Card label="Avatar Image">
          <ImageSelector
            value={avatarImage}
            defaultImage={defaultImage}
            onChange={onImageChange}
          />
        </Card>
      </div>

      {/* Name */}
      <div>
        <Card label="Name" required error={validationErrors.name}>
          <TextField
            id="name"
            placeholder="Enter your character's name"
            variant="outlined"
            size="small"
            fullWidth
            disabled={isEditing}
            {...register('name')}
            sx={textFieldStyles}
            slotProps={inputProps}
          />
        </Card>
      </div>

      {/* Species */}
      <div>
        <Card label="Species">
          <TextField
            id="species"
            placeholder="Enter your character's species"
            variant="outlined"
            size="small"
            fullWidth
            disabled={isEditing}
            {...register('species')}
            sx={textFieldStyles}
            slotProps={inputProps}
          />
        </Card>
      </div>

      {/* Details */}
      <div>
        <Card label="Details">
          <TextField
            id="details"
            placeholder="Enter your character's details"
            variant="outlined"
            size="small"
            fullWidth
            disabled={isEditing}
            {...register('details')}
            sx={textFieldStyles}
            slotProps={inputProps}
          />
        </Card>
      </div>

      {/* Demeanor */}
      <div>
        <Card label="Demeanor">
          <TextField
            id="demeanor"
            placeholder="Enter your character's demeanor"
            variant="outlined"
            size="small"
            fullWidth
            disabled={isEditing}
            {...register('demeanor')}
            sx={textFieldStyles}
            slotProps={inputProps}
          />
        </Card>
      </div>
    </>
  );
}
