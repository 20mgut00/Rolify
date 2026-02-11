# Ejemplos de Componentes Completos

## Hero.tsx - Componente de página principal

```typescript
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Sparkles, Users, BookOpen } from 'lucide-react';
import { characterAPI } from '../services/api';
import type { CharacterCard } from '../types';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: publicCharacters } = useQuery({
    queryKey: ['heroCharacters'],
    queryFn: () => characterAPI.getPublicCharacters(0, 10),
  });

  const characters = publicCharacters?.content || [];

  useEffect(() => {
    if (characters.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % characters.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [characters.length]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="font-cinzel text-5xl md:text-6xl font-bold text-primary-dark mb-4">
          Create Your Legend
        </h1>
        <p className="text-xl text-primary-dark/70 mb-8 max-w-2xl mx-auto">
          Bring your tabletop RPG characters to life with our intuitive character creator.
          Start with Root and expand your adventures.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/create"
            className="bg-accent-gold text-primary-dark px-8 py-3 rounded-lg font-cinzel font-medium text-lg hover:bg-opacity-90 transition inline-flex items-center gap-2"
          >
            <Sparkles size={24} />
            Create Character
          </Link>
          <Link
            to="/gallery"
            className="bg-primary-dark text-primary-light px-8 py-3 rounded-lg font-cinzel font-medium text-lg hover:bg-opacity-90 transition inline-flex items-center gap-2"
          >
            <Users size={24} />
            Browse Gallery
          </Link>
        </div>
      </div>

      {/* Carousel */}
      {characters.length > 0 && (
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="font-cinzel text-3xl font-bold text-center mb-8">
            Featured Characters
          </h2>
          <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="aspect-video relative">
              {characters.map((char, index) => (
                <div
                  key={char.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="flex items-center justify-center h-full p-8">
                    <div className="text-center">
                      {char.avatarImage && (
                        <img
                          src={char.avatarImage}
                          alt={char.name}
                          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                        />
                      )}
                      <h3 className="font-cinzel text-3xl font-bold text-primary-dark mb-2">
                        {char.name}
                      </h3>
                      <p className="text-accent-gold font-medium mb-2">
                        {char.className} • {char.system}
                      </p>
                      <p className="text-primary-dark/70">{char.species}</p>
                      <Link
                        to={`/character/${char.id}`}
                        className="inline-block mt-4 bg-accent-gold text-primary-dark px-6 py-2 rounded-lg hover:bg-opacity-90 transition"
                      >
                        View Character
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + characters.length) % characters.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % characters.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {characters.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition ${
                    index === currentSlide ? 'bg-accent-gold w-8' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} className="text-primary-dark" />
          </div>
          <h3 className="font-cinzel text-xl font-bold mb-2">Easy Creation</h3>
          <p className="text-primary-dark/70">
            Intuitive forms with real-time validation guide you through character creation.
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-primary-dark" />
          </div>
          <h3 className="font-cinzel text-xl font-bold mb-2">Share & Discover</h3>
          <p className="text-primary-dark/70">
            Make your characters public and explore creations from the community.
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-primary-dark" />
          </div>
          <h3 className="font-cinzel text-xl font-bold mb-2">Export Anywhere</h3>
          <p className="text-primary-dark/70">
            Download your characters as beautiful PDFs, JSON, or CSV files.
          </p>
        </div>
      </div>
    </div>
  );
}
```

## PublicGallery.tsx - Galería con infinite scroll

```typescript
import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Filter } from 'lucide-react';
import { characterAPI, classTemplateAPI } from '../services/api';
import CharacterCard from './character/CharacterCard';

export default function PublicGallery() {
  const [classFilter, setClassFilter] = useState<string>('');
  const { ref, inView } = useInView();

  const { data: templates } = useQuery({
    queryKey: ['classTemplates', 'Root'],
    queryFn: () => classTemplateAPI.getBySystem('Root'),
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['publicCharacters', classFilter],
    queryFn: ({ pageParam = 0 }) =>
      characterAPI.getPublicCharacters(pageParam, 12, 'Root', classFilter || undefined),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    initialPageParam: 0,
  });

  // Auto-fetch next page when reaching bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const characters = data?.pages.flatMap((page) => page.content) || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-cinzel text-4xl font-bold text-center mb-8">
        Public Gallery
      </h1>

      {/* Filters */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-dark/50" size={20} />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold"
          >
            <option value="">All Classes</option>
            {templates?.map((template) => (
              <option key={template.id} value={template.className}>
                {template.className}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            onView={(id) => navigate(`/character/${id}`)}
          />
        ))}
      </div>

      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-accent-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Intersection observer trigger */}
      <div ref={ref} className="h-10" />

      {/* No more results */}
      {!hasNextPage && characters.length > 0 && (
        <p className="text-center text-primary-dark/50 py-8">
          No more characters to load
        </p>
      )}

      {/* Empty state */}
      {characters.length === 0 && !isFetchingNextPage && (
        <div className="text-center py-16">
          <p className="text-xl text-primary-dark/50">
            No public characters found. Be the first to share yours!
          </p>
        </div>
      )}
    </div>
  );
}
```

## CharacterCard.tsx - Card de personaje

```typescript
import { Eye, Edit, Trash2, Download } from 'lucide-react';
import type { CharacterCard as CharacterCardType } from '../../types';

interface CharacterCardProps {
  character: CharacterCardType;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onExport?: (id: string, format: 'pdf' | 'json' | 'csv') => void;
}

export default function CharacterCard({
  character,
  onView,
  onEdit,
  onDelete,
  onExport,
}: CharacterCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition group">
      {/* Avatar */}
      <div className="aspect-square bg-primary-dark/5 relative overflow-hidden">
        {character.avatarImage ? (
          <img
            src={character.avatarImage}
            alt={character.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-cinzel text-6xl text-primary-dark/20">
              {character.name[0]}
            </span>
          </div>
        )}
        
        {character.isPublic && (
          <div className="absolute top-2 right-2 bg-accent-gold text-primary-dark text-xs px-2 py-1 rounded font-medium">
            Public
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-1 truncate">
          {character.name}
        </h3>
        <p className="text-accent-gold font-medium text-sm mb-1">
          {character.className}
        </p>
        <p className="text-primary-dark/70 text-sm mb-2">{character.species}</p>
        <p className="text-primary-dark/50 text-xs">
          {new Date(character.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => onView(character.id)}
          className="flex-1 flex items-center justify-center gap-1 bg-accent-gold text-primary-dark py-2 rounded hover:bg-opacity-90 transition text-sm font-medium"
        >
          <Eye size={16} />
          View
        </button>
        
        {onEdit && (
          <button
            onClick={() => onEdit(character.id)}
            className="flex items-center justify-center bg-primary-dark/10 text-primary-dark p-2 rounded hover:bg-primary-dark/20 transition"
          >
            <Edit size={16} />
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={() => onDelete(character.id)}
            className="flex items-center justify-center bg-red-50 text-red-600 p-2 rounded hover:bg-red-100 transition"
          >
            <Trash2 size={16} />
          </button>
        )}
        
        {onExport && (
          <button
            onClick={() => onExport(character.id, 'pdf')}
            className="flex items-center justify-center bg-primary-dark/10 text-primary-dark p-2 rounded hover:bg-primary-dark/20 transition"
          >
            <Download size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
```

Estos componentes están completos y listos para usar. Puedes copiarlos directamente a tu proyecto.
