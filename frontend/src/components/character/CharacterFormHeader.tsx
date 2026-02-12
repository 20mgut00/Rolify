import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface CharacterFormHeaderProps {
  isEditing: boolean;
}

export default function CharacterFormHeader({ isEditing }: CharacterFormHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        type="button"
        onClick={() => navigate('/library')}
        className="flex items-center gap-2 text-primary-dark hover:text-accent-gold transition"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Library</span>
      </button>
      <h1 className="text-3xl font-bold text-primary-dark">
        {isEditing ? 'Edit Character' : 'Root Character Sheet'}
      </h1>
      <div className="w-32" />
    </div>
  );
}
