import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { characterAPI } from '../../services/api';
import { useAuthStore, useCharacterStore } from '../../store';
import CharacterCard from './CharacterCard';
import { exportCharacterToPDF, exportCharacterToJSON, exportCharacterToCSV } from '../../utils/export';
import type { Character } from '../../types';

export default function CharacterLibrary() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { sessionCharacters, removeSessionCharacter } = useCharacterStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch user characters if authenticated
  const { data: userCharacters, isLoading } = useQuery({
    queryKey: ['myCharacters'],
    queryFn: characterAPI.getMyCharacters,
    enabled: isAuthenticated,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: characterAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCharacters'] });
      toast.success('Character deleted successfully');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete character';
      toast.error(errorMessage);
    },
  });

  // Get characters based on auth status
  const characters = isAuthenticated
    ? (userCharacters || [])
    : sessionCharacters.filter((c): c is Character & { id: string; createdAt: string } => !!c.id && !!c.createdAt);

  // Filter characters
  const filteredCharacters = characters.filter((char) =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    char.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    char.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (isAuthenticated) {
      deleteMutation.mutate(id);
    } else {
      removeSessionCharacter(id);
      toast.success('Character removed from session');
    }
  };

  const handleExport = async (id: string, format: 'pdf' | 'json' | 'csv') => {
    try {
      // Fetch full character data
      const character = await characterAPI.getById(id);

      switch (format) {
        case 'pdf':
          await exportCharacterToPDF(character);
          toast.success('PDF exported successfully');
          break;
        case 'json':
          exportCharacterToJSON(character);
          toast.success('JSON exported successfully');
          break;
        case 'csv':
          exportCharacterToCSV(character);
          toast.success('CSV exported successfully');
          break;
      }
    } catch {
      toast.error('Failed to export character');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-primary-dark mb-2">
              My Library
            </h1>
            <p className="text-primary-dark/70">
              {characters.length} character{characters.length !== 1 ? 's' : ''} in your collection
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => navigate('/create')}
            className="bg-accent-gold text-primary-dark px-6 py-3 rounded-lg font-cinzel font-medium hover:bg-opacity-90 transition flex items-center gap-2 shadow-lg"
          >
            <Plus size={20} />
            New Character
          </button>
        </div>

        {/* Auth Warning */}
        {!isAuthenticated && sessionCharacters.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              <strong>Note:</strong> You're not logged in. These characters are stored in your browser only.
              <button
                type="button"
                onClick={() => navigate('/')}
                className="ml-2 text-accent-gold hover:underline font-medium"
              >
                Sign in to save permanently
              </button>
            </p>
          </div>
        )}

        {/* Search */}
        <div className="max-w-md mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark/50" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your characters..."
              className="w-full pl-10 pr-4 py-3 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent bg-white"
            />
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
              No characters yet
            </h3>
            <p className="text-primary-dark/70 mb-6">
              Create your first character to get started on your adventure!
            </p>
            <button
              onClick={() => navigate('/create')}
              className="bg-accent-gold text-primary-dark px-6 py-3 rounded-lg font-cinzel font-medium hover:bg-opacity-90 transition"
            >
              Create Your First Character
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
              No characters found
            </h3>
            <p className="text-primary-dark/70 mb-4">
              Try adjusting your search term
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-accent-gold hover:underline font-medium"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
