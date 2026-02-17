import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Filter, Search } from 'lucide-react';
import { characterAPI, classTemplateAPI } from '../../services/api';
import CharacterCard from '../character/CharacterCard';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useUIStore } from '../../store';

export default function PublicGallery() {
  const { t } = useTranslation();
  // React 19 feature: Dynamic document title
  useDocumentTitle(`${t('gallery.title')} - RPG Character Creator`);

  const navigate = useNavigate();
  const { selectedSystem } = useUIStore();
  const [classFilter, setClassFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { ref, inView } = useInView();

  const { data: templates } = useQuery({
    queryKey: ['classTemplates', selectedSystem],
    queryFn: () => classTemplateAPI.getBySystem(selectedSystem),
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['publicCharacters', selectedSystem, classFilter],
    queryFn: ({ pageParam = 0 }) =>
      characterAPI.getPublicCharacters(pageParam, 12, selectedSystem, classFilter || undefined),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    initialPageParam: 0,
  });

  // Reset class filter when system changes
  useEffect(() => {
    setClassFilter('');
  }, [selectedSystem]);

  // Auto-fetch next page when reaching bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allCharacters = data?.pages.flatMap((page) => page.content) || [];
  
  // Filter by search term (client-side)
  const characters = allCharacters.filter((char) =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    char.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-primary-light">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
        <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-center mb-4 text-primary-dark">
          {t('gallery.title')}
        </h1>
        <p className="text-center text-primary-dark/70 mb-8 text-lg">
          {t('gallery.subtitle')}
        </p>

        {/* Filters */}
        <div className="max-w-2xl mx-auto mb-12 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark/50" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('gallery.searchPlaceholder')}
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

        {/* Results Count */}
        {!isLoading && (
          <div className="text-center mb-6 text-primary-dark/70">
            {characters.length} {characters.length !== 1 ? t('common.characters') : t('common.character')} {t('common.found')}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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

        {/* Grid */}
        {!isLoading && characters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onView={(id) => navigate(`/character/${id}`)}
                showCreatorName
              />
            ))}
          </div>
        )}

        {/* Loading More Indicator */}
        {isFetchingNextPage && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-accent-gold border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-primary-dark/70">{t('gallery.loadingMore')}</p>
          </div>
        )}

        {/* Intersection Observer Trigger */}
        <div ref={ref} className="h-10" />

        {/* No More Results */}
        {!hasNextPage && characters.length > 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-primary-dark/50 text-lg">
              {t('gallery.endOfGallery')}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && characters.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={48} className="text-accent-gold" />
            </div>
            <h3 className="font-cinzel text-2xl font-bold text-primary-dark mb-2">
              {t('gallery.noCharactersFound')}
            </h3>
            <p className="text-primary-dark/70 mb-6">
              {searchTerm || classFilter
                ? t('gallery.adjustFilters')
                : t('gallery.beTheFirst')}
            </p>
            {!searchTerm && !classFilter && (
              <button
                onClick={() => navigate('/create')}
                className="bg-accent-gold text-primary-dark px-6 py-3 rounded-lg font-cinzel font-medium hover:bg-opacity-90 transition"
              >
                {t('gallery.createFirstCharacter')}
              </button>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
