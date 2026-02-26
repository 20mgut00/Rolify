import { UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
}: CharacterBasicInfoProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Avatar Image - row-span-4 */}
      <div className="row-span-4">
        <Card label={t('characterBasicInfo.avatarImage')}>
          <ImageSelector
            value={avatarImage}
            defaultImage={defaultImage}
            onChange={onImageChange}
          />
        </Card>
      </div>

      {/* Name */}
      <div>
        <Card label={t('characterBasicInfo.name')} required error={validationErrors.name}>
          <TextField
            id="name"
            placeholder={t('characterBasicInfo.namePlaceholder')}
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
        <Card label={t('characterBasicInfo.species')}>
          <TextField
            id="species"
            placeholder={t('characterBasicInfo.speciesPlaceholder')}
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
        <Card label={t('characterBasicInfo.details')}>
          <TextField
            id="details"
            placeholder={t('characterBasicInfo.detailsPlaceholder')}
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
        <Card label={t('characterBasicInfo.demeanor')}>
          <TextField
            id="demeanor"
            placeholder={t('characterBasicInfo.demeanorPlaceholder')}
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
