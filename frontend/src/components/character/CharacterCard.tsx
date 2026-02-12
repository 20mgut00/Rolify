import { useState } from 'react';
import { Eye, Edit, Trash2, Download, Globe, Lock } from 'lucide-react';
import type { CharacterCard as CharacterCardType } from '../../types';
import { getAvatarUrl } from '../../utils/avatarUrl';

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
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
      {/* Avatar */}
      <div className="aspect-square bg-primary-dark/5 relative overflow-hidden">
        {character.avatarImage ? (
          <img
            src={getAvatarUrl(character.avatarImage)}
            alt={character.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-dark/10 to-accent-gold/10">
            <span className="font-cinzel text-7xl text-primary-dark/20 group-hover:text-primary-dark/30 transition">
              {character.name[0]}
            </span>
          </div>
        )}
        
        {/* Public/Private Badge */}
        <div className="absolute top-3 right-3">
          {character.isPublic ? (
            <div className="bg-accent-gold text-primary-dark text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 shadow-lg">
              <Globe size={12} />
              Public
            </div>
          ) : (
            <div className="bg-primary-dark text-primary-light text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 shadow-lg">
              <Lock size={12} />
              Private
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-cinzel text-xl font-bold text-primary-dark mb-1 truncate" title={character.name}>
          {character.name}
        </h3>
        <p className="text-accent-gold font-semibold text-sm mb-1">
          {character.className}
        </p>
        <p className="text-primary-dark/70 text-sm mb-2">{character.species}</p>
        <div className="flex items-center gap-2 text-primary-dark/50 text-xs mt-auto">
          <span className="bg-primary-dark/5 px-2 py-1 rounded">
            {character.system}
          </span>
          <span>•</span>
          <span>{new Date(character.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => onView(character.id)}
          className="flex-1 flex items-center justify-center gap-1 bg-accent-gold text-primary-dark py-2.5 rounded-lg hover:bg-opacity-90 transition text-sm font-medium shadow-md hover:shadow-lg"
        >
          <Eye size={16} />
          View
        </button>
        
        {onEdit && (
          <button
            onClick={() => onEdit(character.id)}
            className="flex items-center justify-center bg-primary-dark/10 text-primary-dark p-2.5 rounded-lg hover:bg-primary-dark/20 transition shadow-md hover:shadow-lg"
            title="Edit character"
          >
            <Edit size={16} />
          </button>
        )}
        
        {onExport && (
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center justify-center bg-primary-dark/10 text-primary-dark p-2.5 rounded-lg hover:bg-primary-dark/20 transition shadow-md hover:shadow-lg"
              title="Export character"
            >
              <Download size={16} />
            </button>
            
            {showExportMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl py-2 z-20 min-w-30">
                  <button
                    onClick={() => {
                      onExport(character.id, 'pdf');
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-primary-dark/5 transition"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => {
                      onExport(character.id, 'json');
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-primary-dark/5 transition"
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => {
                      onExport(character.id, 'csv');
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-primary-dark/5 transition"
                  >
                    CSV
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        
        {onDelete && (
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${character.name}"?`)) {
                onDelete(character.id);
              }
            }}
            className="flex items-center justify-center bg-red-50 text-red-600 p-2.5 rounded-lg hover:bg-red-100 transition shadow-md hover:shadow-lg"
            title="Delete character"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
