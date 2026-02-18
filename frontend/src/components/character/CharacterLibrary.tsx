import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Filter, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { characterAPI, classTemplateAPI } from '../../services/api';
import { useAuthStore, useCharacterStore, useUIStore } from '../../store';
import CharacterCard from './CharacterCard';
import { exportCharacterToPDF, exportCharacterToJSON, exportCharacterToCSV, importCharacterFromJSON, importCharacterFromCSV } from '../../utils/export';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Character, CharacterCard as CharacterCardType } from '../../types';

export default function CharacterLibrary() {
  const { t } = useTranslation();

  // React 19 feature: Dynamic document title
  useDocumentTitle(`${t('characterLibrary.title')} - RPG Character Creator`);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { sessionCharacters, removeSessionCharacter } = useCharacterStore();
  const { selectedSystem } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user characters if authenticated
  const { data: userCharacters, isLoading } = useQuery({
    queryKey: ['myCharacters'],
    queryFn: characterAPI.getMyCharacters,
    enabled: isAuthenticated,
  });

  // Fetch class templates for the selected system
  const { data: templates } = useQuery({
    queryKey: ['classTemplates', selectedSystem],
    queryFn: () => classTemplateAPI.getBySystem(selectedSystem),
  });

  // Reset class filter when system changes
  useEffect(() => {
    setClassFilter('');
  }, [selectedSystem]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: characterAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCharacters'] });
      toast.success(t('characterLibrary.characterDeleted'));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : t('errors.deleteCharacterFailed');
      toast.error(errorMessage);
    },
  });

  // Get characters based on auth status
  const characters: CharacterCardType[] = isAuthenticated
    ? (userCharacters || [])
    : sessionCharacters
        .filter((c): c is Character & { id: string; createdAt: string } => !!c.id && !!c.createdAt)
        .map((c) => ({
          id: c.id,
          name: c.name,
          system: c.system,
          className: c.className,
          species: c.species,
          avatarImage: c.avatarImage,
          isPublic: c.isPublic || false,
          createdAt: c.createdAt,
        }));

  // Filter characters by system, class, and search term
  const filteredCharacters = characters.filter((char) => {
    // Filter by selected system
    if (char.system !== selectedSystem) return false;

    // Filter by class if selected
    if (classFilter && char.className !== classFilter) return false;

    // Filter by search term
    if (searchTerm && !(
      char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      char.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      char.species.toLowerCase().includes(searchTerm.toLowerCase())
    )) return false;

    return true;
  });

  const handleDelete = (id: string) => {
    if (isAuthenticated) {
      deleteMutation.mutate(id);
    } else {
      removeSessionCharacter(id);
      toast.success(t('characterLibrary.characterRemoved'));
    }
  };

  // Import mutation
  const importMutation = useMutation({
    mutationFn: (data: Partial<Character>) => characterAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCharacters'] });
      toast.success(t('characterLibrary.importSuccess'));
    },
    onError: () => {
      toast.error(t('characterLibrary.importFailed'));
    },
  });

  const handleExport = async (id: string, format: 'pdf' | 'json' | 'csv') => {
    try {
      // Fetch full character data
      const character = await characterAPI.getById(id);

      switch (format) {
        case 'pdf':
          await exportCharacterToPDF(character);
          toast.success(t('characterLibrary.pdfExported'));
          break;
        case 'json':
          exportCharacterToJSON(character);
          toast.success(t('characterLibrary.jsonExported'));
          break;
        case 'csv':
          exportCharacterToCSV(character);
          toast.success(t('characterLibrary.csvExported'));
          break;
      }
    } catch {
      toast.error(t('characterLibrary.exportFailed'));
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let characterData: Partial<Character>;

      if (file.name.endsWith('.json')) {
        characterData = await importCharacterFromJSON(file);
      } else if (file.name.endsWith('.csv')) {
        characterData = await importCharacterFromCSV(file);
      } else {
        toast.error(t('characterLibrary.unsupportedFormat'));
        return;
      }

      if (!characterData.name || !characterData.system || !characterData.className) {
        toast.error(t('characterLibrary.invalidFile'));
        return;
      }

      importMutation.mutate(characterData);
    } catch {
      toast.error(t('characterLibrary.parseFailed'));
    } finally {
      // Reset file input so the same file can be imported again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-primary-light">
      <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-primary-dark mb-2">
              {t('characterLibrary.title')}
            </h1>
            <p className="text-primary-dark/70">
              {filteredCharacters.length} {filteredCharacters.length !== 1 ? t('common.characters') : t('common.character')} {(classFilter || searchTerm) ? t('common.found') : t('common.inYourCollection')}
            </p>
          </div>
          
          <div className="flex gap-3">
            {isAuthenticated && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importMutation.isPending}
                  className="bg-primary-dark/10 text-primary-dark px-5 py-3 rounded-lg font-cinzel font-medium hover:bg-primary-dark/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Upload size={20} />
                  {importMutation.isPending ? t('common.importing') : t('common.import')}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => navigate('/create')}
              className="bg-accent-gold text-primary-dark px-6 py-3 rounded-lg font-cinzel font-medium hover:bg-opacity-90 transition flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              {t('characterLibrary.newCharacter')}
            </button>
          </div>
        </div>

        {/* Auth Warning */}
        {!isAuthenticated && sessionCharacters.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              <strong>{t('common.note')}:</strong> {t('characterLibrary.authWarning')}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="ml-2 text-accent-gold hover:underline font-medium"
              >
                {t('characterLibrary.signInToSave')}
              </button>
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="max-w-2xl mx-auto mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark/50" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('characterLibrary.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-3 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent text-primary-dark bg-white dark-field"
            />
          </div>

          {/* Class Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark/50" size={20} />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent text-primary-dark bg-white appearance-none cursor-pointer dark-field"
            >
              <option value="">{t('common.allClasses')}</option>
              {templates?.map((template) => (
                <option key={template.id} value={template.className}>
                  {template.className}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Characters Grid */}
        {!isLoading && filteredCharacters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onView={(id) => navigate(`/character/${id}`)}
                onEdit={(id) => navigate(`/create?edit=${id}`)}
                onDelete={handleDelete}
                onExport={handleExport}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && characters.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus size={48} className="text-accent-gold" />
            </div>
            <h3 className="font-cinzel text-2xl font-bold text-primary-dark mb-2">
              {t('characterLibrary.noCharactersYet')}
            </h3>
            <p className="text-primary-dark/70 mb-6">
              {t('characterLibrary.noCharactersDesc')}
            </p>
            <button
              onClick={() => navigate('/create')}
              className="bg-accent-gold text-primary-dark px-6 py-3 rounded-lg font-cinzel font-medium hover:bg-opacity-90 transition"
            >
              {t('characterLibrary.createFirstCharacter')}
            </button>
          </div>
        )}

        {/* No Search Results */}
        {!isLoading && characters.length > 0 && filteredCharacters.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-primary-dark/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={48} className="text-primary-dark/50" />
            </div>
            <h3 className="font-cinzel text-2xl font-bold text-primary-dark mb-2">
              {t('characterLibrary.noCharactersFound')}
            </h3>
            <p className="text-primary-dark/70 mb-4">
              {searchTerm || classFilter
                ? t('characterLibrary.adjustFilters')
                : t('characterLibrary.noCharactersForSystem', { system: selectedSystem })}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setClassFilter('');
              }}
              className="text-accent-gold hover:underline font-medium"
            >
              {t('characterLibrary.clearFilters')}
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
