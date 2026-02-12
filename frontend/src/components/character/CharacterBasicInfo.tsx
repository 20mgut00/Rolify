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

export default function CharacterBasicInfo({
  register,
  avatarImage,
  defaultImage,
  onImageChange,
  validationErrors = {},
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
            {...register('demeanor')}
            sx={textFieldStyles}
            slotProps={inputProps}
          />
        </Card>
      </div>
    </>
  );
}
