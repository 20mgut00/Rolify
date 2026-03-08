import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Edit, Trash2, Download, Globe, Lock, Star, Heart, Copy, Link2 } from 'lucide-react';
import type { CharacterCard as CharacterCardType } from '../../types';
import { getAvatarUrl } from '../../utils/avatarUrl';
import ConfirmModal from '../common/ConfirmModal';

interface CharacterCardProps {
  character: CharacterCardType;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onExport?: (id: string, format: 'pdf' | 'json' | 'csv') => void;
  onFavorite?: (id: string) => void;
  onLike?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onTogglePublic?: (id: string, isPublic: boolean) => void;
  onShare?: (id: string) => void;
  isFavorite?: boolean;
  showCreatorName?: boolean;
}

export default function CharacterCard({
  character,
  onView,
  onEdit,
  onDelete,
  onExport,
  onFavorite,
  onLike,
  onDuplicate,
  onTogglePublic,
  onShare,
  isFavorite = false,
  showCreatorName = false,
}: CharacterCardProps) {
  const { t, i18n } = useTranslation();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col dark-shared-panel">
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
        
        {/* Favorite Star */}
        {onFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite(character.id); }}
            className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition"
            title={isFavorite ? t('characterLibrary.unfavorite') : t('characterLibrary.favorite')}
          >
            <Star
              size={16}
              className={isFavorite ? 'text-accent-gold fill-accent-gold' : 'text-white'}
            />
          </button>
        )}

        {/* Public/Private Badge */}
        <div className="absolute top-3 right-3">
          {onTogglePublic ? (
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePublic(character.id, !character.isPublic); }}
              className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 shadow-lg transition hover:opacity-75 ${
                character.isPublic ? 'bg-accent-gold text-primary-dark' : 'bg-primary-dark text-primary-light'
              }`}
              title={character.isPublic ? t('characterCard.makePrivate') : t('characterCard.makePublic')}
            >
              {character.isPublic ? <Globe size={12} /> : <Lock size={12} />}
              {character.isPublic ? t('common.public') : t('common.private')}
            </button>
          ) : character.isPublic ? (
            <div className="bg-accent-gold text-primary-dark text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 shadow-lg">
              <Globe size={12} />
              {t('common.public')}
            </div>
          ) : (
            <div className="bg-primary-dark text-primary-light text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 shadow-lg">
              <Lock size={12} />
              {t('common.private')}
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
        {showCreatorName && character.creatorName && (
          <p className="text-primary-dark/60 text-xs mb-2 truncate" title={character.creatorName}>
            {t('common.by')} {character.creatorName}
          </p>
        )}
        <div className="flex items-center gap-2 text-primary-dark/50 text-xs mt-auto">
          <span className="bg-primary-dark/5 px-2 py-1 rounded">
            {character.system}
          </span>
          <span>•</span>
          <span>{new Date(character.createdAt).toLocaleDateString(i18n.language)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => onView(character.id)}
          className="w-10 h-10 flex items-center justify-center bg-accent-gold text-primary-dark rounded-lg cursor-pointer transition-all duration-200 transform-gpu hover:bg-opacity-90 hover:scale-[1.02] hover:-translate-y-px hover:brightness-105 shadow-md hover:shadow-lg"
          title={t('characterCard.viewCharacter')}
        >
          <Eye size={18} />
        </button>

        {onLike && (
          <button
            onClick={() => onLike(character.id)}
            className={`w-auto px-2.5 h-10 flex items-center gap-1.5 rounded-lg cursor-pointer transition shadow-md hover:shadow-lg text-sm font-medium ${
              character.likedByCurrentUser
                ? 'bg-red-100 text-red-600 dark:bg-red-950/35 dark:text-red-300 hover:bg-red-200'
                : 'bg-primary-dark/10 text-primary-dark hover:bg-primary-dark/20'
            }`}
            title={character.likedByCurrentUser ? t('gallery.liked') : t('gallery.like')}
          >
            <Heart
              size={16}
              className={character.likedByCurrentUser ? 'fill-current' : ''}
            />
            {(character.likeCount ?? 0) > 0 && (
              <span>{character.likeCount}</span>
            )}
          </button>
        )}
        
        {onShare && character.isPublic && (
          <button
            onClick={() => onShare(character.id)}
            className="w-10 h-10 flex items-center justify-center bg-primary-dark/10 text-primary-dark rounded-lg cursor-pointer hover:bg-primary-dark/20 transition shadow-md hover:shadow-lg"
            title={t('characterCard.shareCharacter')}
          >
            <Link2 size={16} />
          </button>
        )}

        {onDuplicate && (
          <button
            onClick={() => onDuplicate(character.id)}
            className="w-10 h-10 flex items-center justify-center bg-primary-dark/10 text-primary-dark rounded-lg cursor-pointer hover:bg-primary-dark/20 transition shadow-md hover:shadow-lg"
            title={t('characterCard.duplicateCharacter')}
          >
            <Copy size={16} />
          </button>
        )}

        {onEdit && (
          <button
            onClick={() => onEdit(character.id)}
            className="w-10 h-10 flex items-center justify-center bg-primary-dark/10 text-primary-dark rounded-lg cursor-pointer hover:bg-primary-dark/20 transition shadow-md hover:shadow-lg"
            title={t('characterCard.editCharacter')}
          >
            <Edit size={16} />
          </button>
        )}
        
        {onExport && (
          <div className="relative w-10 h-10">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="w-full h-full flex items-center justify-center bg-primary-dark/10 text-primary-dark rounded-lg cursor-pointer hover:bg-primary-dark/20 transition shadow-md hover:shadow-lg"
              title={t('characterCard.exportCharacter')}
            >
              <Download size={16} />
            </button>
            
            {showExportMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute bottom-full right-0 mb-2 bg-primary-light dark:bg-gray-900 rounded-lg shadow-xl py-2 z-20 min-w-30">
                  <button
                    onClick={() => {
                      onExport(character.id, 'pdf');
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-primary-dark dark:text-white cursor-pointer hover:bg-accent-gold/20 dark:hover:bg-gray-800 transition font-medium"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => {
                      onExport(character.id, 'json');
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-primary-dark dark:text-white cursor-pointer hover:bg-accent-gold/20 dark:hover:bg-gray-800 transition font-medium"
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => {
                      onExport(character.id, 'csv');
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-primary-dark dark:text-white cursor-pointer hover:bg-accent-gold/20 dark:hover:bg-gray-800 transition font-medium"
                  >
                    CSV
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        
        {onDelete && (
          <>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 dark:bg-red-950/35 dark:text-red-300 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/45 transition shadow-md hover:shadow-lg"
              title={t('characterCard.deleteCharacter')}
            >
              <Trash2 size={16} />
            </button>
            <ConfirmModal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={() => onDelete(character.id)}
              title={t('characterCard.deleteCharacter')}
              message={t('characterCard.deleteConfirm', { name: character.name })}
              confirmText={t('common.delete')}
              variant="danger"
            />
          </>
        )}
      </div>
    </div>
  );
}
