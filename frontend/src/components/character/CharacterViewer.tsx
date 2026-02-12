import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Edit, Download, Share2, Globe, Lock,
  Heart, Zap, Target, Sparkles, Shield, Sword, Users, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { characterAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import { exportCharacterToPDF, exportCharacterToJSON, exportCharacterToCSV } from '../../utils/export';
import { getAvatarUrl } from '../../utils/avatarUrl';

export default function CharacterViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { data: character, isLoading } = useQuery({
    queryKey: ['character', id],
    queryFn: () => characterAPI.getById(id!),
    enabled: !!id,
  });

  const isOwner = user && character && user.id === character.userId;

  const handleExport = async (format: 'pdf' | 'json' | 'csv') => {
    if (!character) return;

    try {
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
      setShowExportMenu(false);
    } catch {
      toast.error('Failed to export character');
    }
  };

  const handleShare = () => {
    if (character) {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-primary-dark/70">Loading character...</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4">
            Character Not Found
          </h2>
          <p className="text-primary-dark/70 mb-6">
            This character doesn't exist or you don't have permission to view it.
          </p>
          <button
            type="button"
            onClick={() => navigate('/library')}
            className="bg-accent-gold text-primary-dark px-6 py-3 rounded-lg font-cinzel font-medium hover:bg-opacity-90 transition"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-primary-light to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-primary-dark hover:text-accent-gold transition"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back</span>
            </button>

            <div className="flex gap-2">
              {isOwner && (
                <button
                  type="button"
                  onClick={() => navigate(`/create?edit=${id}`)}
                  className="flex items-center gap-2 bg-primary-dark text-primary-light px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
                >
                  <Edit size={18} />
                  Edit
                </button>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 bg-accent-gold text-primary-dark px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
                >
                  <Download size={18} />
                  Export
                </button>

                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                    <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl py-2 z-20 min-w-30">
                      <button
                        type="button"
                        onClick={() => handleExport('pdf')}
                        className="w-full px-4 py-2 text-left hover:bg-primary-dark/5 transition"
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExport('json')}
                        className="w-full px-4 py-2 text-left hover:bg-primary-dark/5 transition"
                      >
                        JSON
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExport('csv')}
                        className="w-full px-4 py-2 text-left hover:bg-primary-dark/5 transition"
                      >
                        CSV
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-2 bg-primary-dark/10 text-primary-dark px-4 py-2 rounded-lg hover:bg-primary-dark/20 transition"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>

          {/* Character Sheet */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Hero Section */}
            <div className="bg-linear-to-r from-primary-light via-white to-accent-gold/10 p-8 border-b-4 border-accent-gold relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                {character.avatarImage ? (
                  <img
                    src={getAvatarUrl(character.avatarImage)}
                    alt={character.name}
                    className="w-32 h-32 rounded-full border-4 border-accent-gold shadow-xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-accent-gold shadow-xl bg-primary-light flex items-center justify-center">
                    <span className="font-cinzel text-6xl text-primary-dark/40">
                      {character.name[0]}
                    </span>
                  </div>
                )}

                <div className="text-center md:text-left flex-1">
                  <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-2 text-primary-dark">
                    {character.name}
                  </h1>
                  <p className="text-xl text-accent-gold font-semibold mb-1">
                    {character.className} • {character.system}
                  </p>
                  <p className="text-primary-dark/80 mb-2">
                    {character.species} • {character.demeanor}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    {character.isPublic ? (
                      <span className="flex items-center gap-1 bg-accent-gold/20 border border-accent-gold/40 px-3 py-1 rounded-full text-sm text-primary-dark font-medium">
                        <Globe size={14} />
                        Public
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-primary-dark/10 border border-primary-dark/20 px-3 py-1 rounded-full text-sm text-primary-dark font-medium">
                        <Lock size={14} />
                        Private
                      </span>
                    )}
                    <span className="text-primary-dark/60 text-sm">
                      Created {new Date(character.createdAt || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Stats */}
              <section className="mb-8">
                <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                  <Zap className="text-accent-gold" size={24} />
                  Stats
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {character.stats.map((stat) => (
                    <div key={stat.name} className="text-center p-4 bg-primary-dark/5 rounded-lg">
                      <div className="font-cinzel font-bold text-sm text-primary-dark/70 uppercase mb-1">
                        {stat.name}
                      </div>
                      <div className={`text-3xl font-bold ${stat.value >= 0 ? 'text-accent-gold' : 'text-primary-dark/50'}`}>
                        {stat.value >= 0 ? '+' : ''}{stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Background */}
              <section className="mb-8">
                <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                  <Heart className="text-accent-gold" size={24} />
                  Background
                </h2>
                <div className="space-y-3">
                  {character.background.map((bg, idx) => (
                    <div key={idx} className="p-4 bg-primary-dark/5 rounded-lg">
                      <div className="font-semibold text-primary-dark mb-1">{bg.question}</div>
                      <div className="text-primary-dark/70">{bg.answer}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Connections */}
              {character.connections && character.connections.length > 0 && (
                <section className="mb-8">
                  <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                    <Users className="text-accent-gold" size={24} />
                    Connections
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {character.connections.map((connection, idx) => (
                      <div key={idx} className="p-4 bg-primary-dark/5 rounded-lg border-l-4 border-accent-gold">
                        <div className="font-bold text-primary-dark mb-1">{connection.characterName}</div>
                        <div className="text-sm text-primary-dark/70">{connection.description}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Reputation */}
              {character.reputation && character.reputation.factions && Object.keys(character.reputation.factions).length > 0 && (
                <section className="mb-8">
                  <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                    <TrendingUp className="text-accent-gold" size={24} />
                    Reputation
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(character.reputation.factions).map(([factionName, rep]) => (
                      <div key={factionName} className="p-4 bg-white border-2 border-primary-dark/10 rounded-lg">
                        <div className="font-bold text-primary-dark mb-3 text-center">{factionName}</div>
                        <div className="flex justify-around">
                          <div className="text-center">
                            <div className="text-xs text-primary-dark/60 mb-1">Prestige</div>
                            <div className={`text-2xl font-bold ${rep.prestige >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {rep.prestige >= 0 ? '+' : ''}{rep.prestige}
                            </div>
                          </div>
                          <div className="w-px bg-primary-dark/10" />
                          <div className="text-center">
                            <div className="text-xs text-primary-dark/60 mb-1">Notoriety</div>
                            <div className={`text-2xl font-bold ${rep.notoriety >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {rep.notoriety >= 0 ? '+' : ''}{rep.notoriety}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Nature & Drives */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <section>
                  <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                    <Target className="text-accent-gold" size={24} />
                    Nature
                  </h2>
                  <div className="space-y-3">
                    {character.nature.filter(n => n.selected).map((nature, idx) => (
                      <div key={idx} className="p-4 bg-linear-to-r from-accent-gold/10 to-transparent rounded-lg border-l-4 border-accent-gold">
                        <div className="font-bold text-primary-dark mb-1">{nature.name}</div>
                        <div className="text-sm text-primary-dark/70">{nature.description}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                    <Sparkles className="text-accent-gold" size={24} />
                    Drives
                  </h2>
                  <div className="space-y-3">
                    {character.drives.filter(d => d.selected).map((drive, idx) => (
                      <div key={idx} className="p-4 bg-linear-to-r from-accent-gold/10 to-transparent rounded-lg border-l-4 border-accent-gold">
                        <div className="font-bold text-primary-dark mb-1">{drive.name}</div>
                        <div className="text-sm text-primary-dark/70">{drive.description}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Moves */}
              <section className="mb-8">
                <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                  <Shield className="text-accent-gold" size={24} />
                  Moves
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {character.moves.filter(m => m.selected).map((move, idx) => (
                    <div key={idx} className="p-4 bg-white border-2 border-primary-dark/10 rounded-lg hover:border-accent-gold/50 transition">
                      <div className="font-bold text-primary-dark mb-2">{move.name}</div>
                      <div className="text-sm text-primary-dark/70">{move.description}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Weapon Skills & Roguish Feats */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <section>
                  <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4 flex items-center gap-2">
                    <Sword className="text-accent-gold" size={24} />
                    Weapon Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {character.weaponSkills.skills.filter(s => s.selected).map((skill, idx) => (
                      <div key={idx} className="px-3 py-2 bg-accent-gold/20 text-primary-dark rounded-lg font-medium text-sm">
                        {skill.name}
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4">
                    Roguish Feats
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {character.roguishFeats.feats.filter(f => f.selected).map((feat, idx) => (
                      <div key={idx} className="px-3 py-2 bg-primary-dark/10 text-primary-dark rounded-lg font-medium text-sm">
                        {feat.name}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Equipment & Notes */}
              {character.equipment && (
                <section>
                  <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4">
                    Equipment & Notes
                  </h2>
                  <div className="p-4 bg-primary-dark/5 rounded-lg whitespace-pre-wrap text-primary-dark">
                    {typeof character.equipment === 'string'
                      ? character.equipment
                      : JSON.stringify(character.equipment, null, 2)}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
