import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Eye, Upload, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { characterAPI, classTemplateAPI } from '../../services/api';
import { useAuthStore, useCharacterStore, useUIStore } from '../../store';
import type { Character, ClassTemplate } from '../../types';

export default function CharacterForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { addSessionCharacter } = useCharacterStore();
  const { selectedSystem } = useUIStore();

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [template, setTemplate] = useState<ClassTemplate | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Character>>({
    name: '',
    species: '',
    demeanor: '',
    details: '',
    avatarImage: '',
    stats: [
      { name: 'charm', value: 0 },
      { name: 'cunning', value: 0 },
      { name: 'finesse', value: 0 },
      { name: 'luck', value: 0 },
      { name: 'might', value: 0 },
    ],
    background: [],
    drives: [],
    nature: [],
    moves: [],
    weaponSkills: { remaining: 1, skills: [] },
    roguishFeats: { remaining: 0, feats: [] },
    equipment: { startingValue: 9, carrying: 0, burdened: 4, max: 8, items: [] },
    connections: [],
    isPublic: false,
  });

  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  // Load templates
  const { data: templates } = useQuery({
    queryKey: ['classTemplates', selectedSystem],
    queryFn: () => classTemplateAPI.getBySystem(selectedSystem),
  });

  // Load character if editing
  const { data: existingCharacter } = useQuery({
    queryKey: ['character', editId],
    queryFn: () => characterAPI.getById(editId!),
    enabled: isEditing,
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: isEditing
      ? (data: Partial<Character>) => characterAPI.update(editId!, data)
      : characterAPI.create,
    onSuccess: (data) => {
      if (!isAuthenticated && !isEditing) {
        addSessionCharacter(data);
      }
      queryClient.invalidateQueries({ queryKey: ['myCharacters'] });
      toast.success(isEditing ? 'Character updated!' : 'Character created!');
      navigate(`/character/${data.id}`);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save character';
      toast.error(errorMessage);
    },
  });

  // Load template when class selected (only for new characters, not editing)
  useEffect(() => {
    if (selectedClass && templates && !isEditing) {
      const selectedTemplate = templates.find((t: ClassTemplate) => t.className === selectedClass);
      if (selectedTemplate) {
        setTemplate(selectedTemplate);
        setFormData((prev) => ({
          ...prev,
          background: selectedTemplate.background.map((q) => ({ question: q.name, answer: '' })),
          drives: selectedTemplate.drives.map((d) => ({ ...d, selected: false })),
          nature: selectedTemplate.nature.map((n) => ({ ...n, selected: false })),
          moves: selectedTemplate.moves.map((m) => ({ ...m, selected: false })),
          weaponSkills: selectedTemplate.weaponSkills,
          roguishFeats: selectedTemplate.roguishFeats,
          stats: selectedTemplate.stats,
        }));
      }
    }
  }, [selectedClass, templates, isEditing]);

  // Load existing character data
  useEffect(() => {
    if (existingCharacter && templates) {
      setFormData(existingCharacter);
      setSelectedClass(existingCharacter.className);
      if (existingCharacter.avatarImage) {
        setImagePreview(existingCharacter.avatarImage);
      }
      // Load template for editing mode
      const selectedTemplate = templates.find((t: ClassTemplate) => t.className === existingCharacter.className);
      if (selectedTemplate) {
        setTemplate(selectedTemplate);
      }
    }
  }, [existingCharacter, templates]);

  // Calculate equipment values
  useEffect(() => {
    if (!formData.stats) return;
    const mightStat = formData.stats.find((s) => s.name === 'might');
    if (mightStat && formData.equipment) {
      const burdened = 4 + mightStat.value;
      const max = burdened * 2;

      // Only update if values actually changed to avoid infinite loop
      if (formData.equipment.burdened !== burdened || formData.equipment.max !== max) {
        setFormData((prev) => ({
          ...prev,
          equipment: { ...prev.equipment!, burdened, max },
        }));
      }
    }
  }, [formData.stats, formData.equipment]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData((prev) => ({ ...prev, avatarImage: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }
    if (!formData.name) {
      toast.error('Please enter a name');
      return;
    }
    if (!formData.species) {
      toast.error('Please enter a species');
      return;
    }

    const selectedDrives = formData.drives?.filter((d) => d.selected).length || 0;
    if (selectedDrives > 2) {
      toast.error('Maximum 2 drives allowed');
      return;
    }

    const selectedNature = formData.nature?.filter((n) => n.selected).length || 0;
    if (selectedNature > 2) {
      toast.error('Maximum 2 nature options allowed');
      return;
    }

    const selectedMoves = formData.moves?.filter((m) => m.selected).length || 0;
    if (selectedMoves > 3) {
      toast.error('Maximum 3 moves allowed');
      return;
    }

    saveMutation.mutate({
      ...formData,
      system: selectedSystem,
      className: selectedClass,
    });
  };

  const toggleSelection = (section: keyof Character, index: number) => {
    setFormData((prev) => {
      const sectionData = prev[section];
      if (Array.isArray(sectionData)) {
        return {
          ...prev,
          [section]: sectionData.map((item, i: number) =>
            i === index && typeof item === 'object' && item !== null && 'selected' in item
              ? { ...item, selected: !(item as { selected: boolean }).selected }
              : item
          ),
        };
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-primary-light to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              type="button"
              onClick={() => navigate('/library')}
              className="flex items-center gap-2 text-primary-dark hover:text-accent-gold transition"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Library</span>
            </button>
            <h1 className="font-cinzel text-4xl font-bold text-primary-dark">
              {isEditing ? 'Edit Character' : 'Create Character'}
            </h1>
            <div className="w-32" /> {/* Spacer */}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Class Selection */}
            {!isEditing && (
              <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
                <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4">
                  Choose Your Class
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates?.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedClass(t.className)}
                      className={`p-6 rounded-lg border-2 transition ${
                        selectedClass === t.className
                          ? 'border-accent-gold bg-accent-gold/10'
                          : 'border-primary-dark/20 hover:border-accent-gold/50'
                      }`}
                    >
                      <h3 className="font-cinzel text-xl font-bold mb-2">{t.className}</h3>
                      <p className="text-sm text-primary-dark/70">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedClass && template && (
              <>
                {/* Basic Info */}
                <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
                  <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-6">
                    Basic Information
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 flex justify-center">
                      <div className="relative">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 rounded-full object-cover border-4 border-accent-gold"
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-primary-dark/10 flex items-center justify-center border-4 border-primary-dark/20">
                            <Upload size={32} className="text-primary-dark/30" />
                          </div>
                        )}
                        <label className="absolute bottom-0 right-0 bg-accent-gold p-2 rounded-full cursor-pointer hover:bg-opacity-90 transition">
                          <Upload size={16} className="text-primary-dark" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Species *</label>
                      <input
                        type="text"
                        value={formData.species}
                        onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                        className="w-full px-4 py-2 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold"
                        placeholder="fox, mouse, rabbit, bird, owl..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Demeanor</label>
                      <input
                        type="text"
                        value={formData.demeanor}
                        onChange={(e) => setFormData({ ...formData, demeanor: e.target.value })}
                        className="w-full px-4 py-2 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold"
                        placeholder="charming, diplomatic, stern..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Details</label>
                      <input
                        type="text"
                        value={formData.details}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        className="w-full px-4 py-2 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold"
                        placeholder="formal, colorful, simple..."
                      />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
                  <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-6">Stats</h2>
                  <div className="grid md:grid-cols-5 gap-6">
                    {formData.stats?.map((stat, idx: number) => (
                      <div key={stat.name} className="text-center">
                        <label className="block font-cinzel font-bold text-sm mb-2 uppercase">
                          {stat.name}
                        </label>
                        <input
                          type="range"
                          min="-3"
                          max="3"
                          value={stat.value}
                          onChange={(e) => {
                            if (!formData.stats) return;
                            const newStats = [...formData.stats];
                            newStats[idx].value = parseInt(e.target.value);
                            setFormData({ ...formData, stats: newStats });
                          }}
                          className="w-full"
                        />
                        <div className={`text-3xl font-bold mt-2 ${stat.value >= 0 ? 'text-accent-gold' : 'text-primary-dark/50'}`}>
                          {stat.value >= 0 ? '+' : ''}{stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Background */}
                <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
                  <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-6">Background</h2>
                  <div className="space-y-4">
                    {formData.background?.map((bg, idx: number) => (
                      <div key={idx}>
                        <label className="block font-medium mb-2">{bg.question}</label>
                        {template?.background[idx]?.answers && template.background[idx].answers.length > 0 ? (
                          <select
                            value={bg.answer}
                            onChange={(e) => {
                              if (!formData.background) return;
                              const newBg = [...formData.background];
                              newBg[idx].answer = e.target.value;
                              setFormData({ ...formData, background: newBg });
                            }}
                            className="w-full px-4 py-2 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold"
                          >
                            <option value="">Select an option...</option>
                            {template.background[idx].answers.map((answer, i) => (
                              <option key={i} value={answer}>{answer}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={bg.answer}
                            onChange={(e) => {
                              if (!formData.background) return;
                              const newBg = [...formData.background];
                              newBg[idx].answer = e.target.value;
                              setFormData({ ...formData, background: newBg });
                            }}
                            className="w-full px-4 py-2 border border-primary-dark/20 rounded-lg focus:ring-2 focus:ring-accent-gold"
                            placeholder="Enter your answer..."
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nature & Drives */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Nature */}
                  <div className="bg-white rounded-lg shadow-xl p-8">
                    <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-2">
                      Nature (Choose 2)
                    </h2>
                    <p className="text-sm text-primary-dark/70 mb-4">
                      Selected: {formData.nature?.filter((n) => n.selected).length || 0}/2
                    </p>
                    <div className="space-y-3">
                      {formData.nature?.map((nature, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleSelection('nature', idx)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition ${
                            nature.selected
                              ? 'border-accent-gold bg-accent-gold/10'
                              : 'border-primary-dark/20 hover:border-accent-gold/50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                              nature.selected ? 'bg-accent-gold border-accent-gold' : 'border-primary-dark/30'
                            }`}>
                              {nature.selected && <Check size={14} className="text-white" />}
                            </div>
                            <div>
                              <div className="font-bold text-primary-dark">{nature.name}</div>
                              <div className="text-sm text-primary-dark/70 mt-1">{nature.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Drives */}
                  <div className="bg-white rounded-lg shadow-xl p-8">
                    <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-2">
                      Drives (Choose 2)
                    </h2>
                    <p className="text-sm text-primary-dark/70 mb-4">
                      Selected: {formData.drives?.filter((d) => d.selected).length || 0}/2
                    </p>
                    <div className="space-y-3">
                      {formData.drives?.map((drive, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleSelection('drives', idx)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition ${
                            drive.selected
                              ? 'border-accent-gold bg-accent-gold/10'
                              : 'border-primary-dark/20 hover:border-accent-gold/50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                              drive.selected ? 'bg-accent-gold border-accent-gold' : 'border-primary-dark/30'
                            }`}>
                              {drive.selected && <Check size={14} className="text-white" />}
                            </div>
                            <div>
                              <div className="font-bold text-primary-dark">{drive.name}</div>
                              <div className="text-sm text-primary-dark/70 mt-1">{drive.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Moves */}
                <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
                  <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-2">
                    Moves (Choose 3)
                  </h2>
                  <p className="text-sm text-primary-dark/70 mb-4">
                    Selected: {formData.moves?.filter((m) => m.selected).length || 0}/3
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {formData.moves?.map((move, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleSelection('moves', idx)}
                        className={`p-4 rounded-lg border-2 text-left transition ${
                          move.selected
                            ? 'border-accent-gold bg-accent-gold/10'
                            : 'border-primary-dark/20 hover:border-accent-gold/50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                            move.selected ? 'bg-accent-gold border-accent-gold' : 'border-primary-dark/30'
                          }`}>
                            {move.selected && <Check size={14} className="text-white" />}
                          </div>
                          <div>
                            <div className="font-bold text-primary-dark">{move.name}</div>
                            <div className="text-sm text-primary-dark/70 mt-1">{move.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weapon Skills & Roguish Feats */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Weapon Skills */}
                  <div className="bg-white rounded-lg shadow-xl p-8">
                    <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4">
                      Weapon Skills
                    </h2>
                    <div className="space-y-2">
                      {formData.weaponSkills?.skills.map((skill, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (!formData.weaponSkills) return;
                            const newSkills = [...formData.weaponSkills.skills];
                            newSkills[idx].selected = !newSkills[idx].selected;
                            setFormData({
                              ...formData,
                              weaponSkills: { ...formData.weaponSkills, skills: newSkills },
                            });
                          }}
                          className={`w-full p-3 rounded-lg border text-left transition ${
                            skill.selected ? 'border-accent-gold bg-accent-gold/10' : 'border-primary-dark/20 hover:border-accent-gold/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border ${
                              skill.selected ? 'bg-accent-gold border-accent-gold' : 'border-primary-dark/30'
                            }`}>
                              {skill.selected && <Check size={12} className="text-white" />}
                            </div>
                            <span className="text-sm font-medium">{skill.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Roguish Feats */}
                  <div className="bg-white rounded-lg shadow-xl p-8">
                    <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4">
                      Roguish Feats
                    </h2>
                    <div className="space-y-2">
                      {formData.roguishFeats?.feats.map((feat, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (!formData.roguishFeats) return;
                            const newFeats = [...formData.roguishFeats.feats];
                            newFeats[idx].selected = !newFeats[idx].selected;
                            setFormData({
                              ...formData,
                              roguishFeats: { ...formData.roguishFeats, feats: newFeats },
                            });
                          }}
                          className={`w-full p-3 rounded-lg border text-left transition ${
                            feat.selected ? 'border-accent-gold bg-accent-gold/10' : 'border-primary-dark/20 hover:border-accent-gold/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border ${
                              feat.selected ? 'bg-accent-gold border-accent-gold' : 'border-primary-dark/30'
                            }`}>
                              {feat.selected && <Check size={12} className="text-white" />}
                            </div>
                            <span className="text-sm font-medium">{feat.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Equipment */}
                <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
                  <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4">Equipment</h2>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-primary-dark/5 rounded-lg">
                      <div className="text-sm text-primary-dark/70">Carrying</div>
                      <div className="text-2xl font-bold text-accent-gold">{formData.equipment?.carrying || 0}</div>
                    </div>
                    <div className="text-center p-4 bg-primary-dark/5 rounded-lg">
                      <div className="text-sm text-primary-dark/70">Burdened</div>
                      <div className="text-2xl font-bold text-accent-gold">{formData.equipment?.burdened || 0}</div>
                    </div>
                    <div className="text-center p-4 bg-primary-dark/5 rounded-lg">
                      <div className="text-sm text-primary-dark/70">Max</div>
                      <div className="text-2xl font-bold text-accent-gold">{formData.equipment?.max || 0}</div>
                    </div>
                  </div>
                  <p className="text-sm text-primary-dark/70">
                    Equipment values are auto-calculated based on your Might stat.
                  </p>
                </div>

                {/* Public/Private Toggle */}
                <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
                  <h2 className="font-cinzel text-2xl font-bold text-primary-dark mb-4">Visibility</h2>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="w-5 h-5 rounded border-primary-dark/30 text-accent-gold focus:ring-accent-gold"
                    />
                    <div>
                      <div className="font-medium">Make this character public</div>
                      <div className="text-sm text-primary-dark/70">
                        Public characters appear in the gallery and can be viewed by anyone
                      </div>
                    </div>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="flex-1 bg-accent-gold text-primary-dark py-4 rounded-lg font-cinzel font-bold text-lg hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update Character' : 'Create Character'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate(`/character/${editId || 'preview'}`)}
                    className="px-6 py-4 bg-primary-dark text-primary-light rounded-lg font-cinzel font-medium hover:bg-opacity-90 transition flex items-center gap-2"
                  >
                    <Eye size={20} />
                    Preview
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
