import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

interface CharacterFormHeaderProps {
  isEditing: boolean;
}

export default function CharacterFormHeader({ isEditing }: CharacterFormHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        type="button"
        onClick={() => navigate('/library')}
        className="flex items-center gap-2 text-primary-dark hover:text-accent-gold transition shrink-0"
      >
        <ArrowLeft size={20} />
        <span className="font-medium hidden sm:inline">{t('characterForm.backToLibrary')}</span>
      </button>
      <h1 className="text-lg sm:text-3xl font-bold text-primary-dark text-center px-2">
        {isEditing ? t('characterForm.editCharacter') : t('characterForm.characterSheet')}
      </h1>
      <div className="w-8 sm:w-32 shrink-0" />
    </div>
  );
}
