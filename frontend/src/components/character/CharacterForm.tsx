import { useNavigate } from 'react-router-dom';
import { useCharacterForm } from '../../hooks/useCharacterForm';
import { getClassDefaultAvatar, getAvatarUrl } from '../../utils/avatarUrl';
import Card from '../common/Card';
import ClassSelector from '../root/ClassSelector';
import CharacterFormHeader from './CharacterFormHeader';
import CharacterBasicInfo from './CharacterBasicInfo';
import CharacterFormFields from './CharacterFormFields';

export default function CharacterForm() {
  const navigate = useNavigate();

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

        <h3 className="text-xl font-semibold text-primary-dark text-start mt-6">
          Character Details
        </h3>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <CharacterBasicInfo
              register={register}
              avatarImage={watchedFields.avatarImage}
              onImageChange={setField('avatarImage')}
              validationErrors={validationErrors}
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
      </div>
    </main>
  );
}
