import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import CircularProgress from '@mui/material/CircularProgress';
import { useCharacterForm } from '../../hooks/useCharacterForm';
import { getClassDefaultAvatar, getAvatarUrl } from '../../utils/avatarUrl';
import { characterAPI } from '../../services/api';
import Card from '../common/Card';
import ClassSelector from '../root/ClassSelector';
import CharacterFormHeader from './CharacterFormHeader';
import CharacterBasicInfo from './CharacterBasicInfo';
import CharacterFormFields from './CharacterFormFields';

export default function CharacterForm() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    watchedFields,
    setField,
    templates,
    selectedClass,
    selectedClassIndex,
    setSelectedClassIndex,
    isPublic,
    setIsPublic,
    isEditing,
    editId,
    isAuthenticated,
    isSaving,
    validationErrors,
    onSubmit,
  } = useCharacterForm((characterId) => navigate(`/character/${characterId}`));

  const handleGenerateCharacter = async () => {
    if (!selectedClass) {
      toast.error('Please select a class first');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedData = await characterAPI.generateCharacter(
        selectedClass.system,
        selectedClass.className
      );

      // Update form fields with generated data
      if (generatedData.name) setField('name')(generatedData.name);
      if (generatedData.species) setField('species')(generatedData.species);
      if (generatedData.demeanor) setField('demeanor')(generatedData.demeanor);
      if (generatedData.details) setField('details')(generatedData.details);
      if (generatedData.equipment) setField('equipment')(generatedData.equipment);
      if (generatedData.nature) setField('nature')(generatedData.nature);
      if (generatedData.drives) setField('drives')(generatedData.drives);
      if (generatedData.moves) setField('moves')(generatedData.moves);
      if (generatedData.stats) setField('stats')(generatedData.stats);
      if (generatedData.background) setField('background')(generatedData.background);
      if (generatedData.connections) setField('connections')(generatedData.connections);
      if (generatedData.roguishFeats) setField('roguishFeats')(generatedData.roguishFeats);
      if (generatedData.weaponSkills) setField('weaponSkills')(generatedData.weaponSkills);

      toast.success('Character generated successfully!');
    } catch (error) {
      console.error('Error generating character:', error);
      toast.error('Failed to generate character. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!templates?.length) {
    return (
      <div className="min-h-screen bg-linear-to-b from-primary-light to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary-dark text-lg">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (!selectedClass) {
    return (
      <div className="min-h-screen bg-linear-to-b from-primary-light to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary-dark text-lg">No class template available</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 bg-primary-light min-h-screen">
      <div className="bg-white rounded-xl shadow-xl p-8 border border-accent-gold/20">
        <CharacterFormHeader isEditing={isEditing} />

        <ClassSelector
          roles={
            templates?.map((classData) => ({
              name: classData.className,
              image: getAvatarUrl(getClassDefaultAvatar(classData.className)),
            })) ?? []
          }
          onRoleSelect={(roleIndex: number) => {
            const validIndex = templates?.length
              ? Math.min(Math.max(0, roleIndex), templates.length - 1)
              : 0;
            setSelectedClassIndex(validIndex);
          }}
        />

        <div className="flex items-center justify-between mt-6 mb-4">
          <h3 className="text-xl font-semibold text-primary-dark">
            Character Details
          </h3>
          {!isEditing && (
            <button
              type="button"
              onClick={handleGenerateCharacter}
              disabled={isGenerating || !selectedClass}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              {isGenerating ? (
                <>
                  <CircularProgress size={18} sx={{ color: 'white' }} />
                  <span className="animate-pulse">Generating with AI...</span>
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  Auto-fill with AI
                </>
              )}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <CharacterBasicInfo
              register={register}
              avatarImage={watchedFields.avatarImage}
              onImageChange={setField('avatarImage')}
              validationErrors={validationErrors}
              isEditing={isEditing}
            />

            <CharacterFormFields
              register={register}
              selectedClass={selectedClass}
              isEditing={isEditing}
              editId={editId}
              selectedClassIndex={selectedClassIndex}
              watchedFields={watchedFields}
              onNatureChange={setField('nature')}
              onDrivesChange={setField('drives')}
              onBackgroundChange={setField('background')}
              onConnectionsChange={setField('connections')}
              onStatsChange={setField('stats')}
              onReputationsChange={setField('reputations')}
              onMovesChange={setField('moves')}
              onFeatsChange={setField('roguishFeats')}
              onSkillsChange={setField('weaponSkills')}
              validationErrors={validationErrors}
            />

            {/* Public Toggle - col-span-2 (only if authenticated) */}
            {isAuthenticated && (
              <div className="col-span-2">
                <Card label="Visibility">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-5 h-5 rounded border-primary-dark/30 text-accent-gold focus:ring-accent-gold"
                    />
                    <span className="text-primary-dark font-medium">
                      Make this character public (visible in gallery)
                    </span>
                  </label>
                </Card>
              </div>
            )}

            {/* Submit Button */}
            <div className="col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full mt-6 px-8 py-3 bg-accent-gold text-primary-dark font-bold rounded-lg hover:bg-accent-gold/90 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving
                  ? isEditing
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditing
                  ? 'Update Character'
                  : 'Create Character'}
              </button>
            </div>
          </div>
        </form>

        {/* AI Generation Loading Overlay */}
        {isGenerating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl">
              <CircularProgress size={60} sx={{ color: '#9333EA', mb: 3 }} />
              <h3 className="text-2xl font-bold text-primary-dark mb-2">
                Generating Character...
              </h3>
              <p className="text-primary-dark/70 mb-4">
                AI is creating a unique character for you. This may take a few seconds.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-purple-600">
                <Loader2 className="animate-spin" size={16} />
                <span className="animate-pulse">Please wait...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
