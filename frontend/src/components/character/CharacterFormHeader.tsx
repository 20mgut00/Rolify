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
        className="flex items-center gap-2 text-primary-dark hover:text-accent-gold transition"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">{t('characterForm.backToLibrary')}</span>
      </button>
      <h1 className="text-3xl font-bold text-primary-dark">
        {isEditing ? t('characterForm.editCharacter') : t('characterForm.characterSheet')}
      </h1>
      <div className="w-32" />
    </div>
  );
}
