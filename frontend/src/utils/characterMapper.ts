import type {
  Character,
  CharacterDB,
  NatureDB,
  DriveDB,
  MoveDB,
  RoguishFeatDB,
  WeaponSkillDB,
  FactionReputationDB,
  SelectedOption,
  RoguishFeats,
  WeaponSkills,
  Reputation,
  Equipment,
} from '../types';

// Handles both legacy field names and format variations from the backend
interface CharacterAPIResponse {
  id?: string;
  _id?: string;
  userId?: string;
  idUsuario?: string;
  name: string;
  system: string;
  className: string;
  species: string;
  demeanor: string;
  details: string;
  avatarImage?: string;
  stats: { name: string; value: number }[];
  background: { question: string; answer: string }[];
  connections: { type?: string; characterName: string; description: string; story?: string }[];
  // nature can be a single object (backend v1) or an array (backend v2)
  nature?: NatureDB | SelectedOption[] | NatureDB[];
  drives?: (DriveDB | SelectedOption)[];
  moves?: (MoveDB | SelectedOption)[];
  // roguishFeats can be an array (old format) or an object with remaining+feats (new format)
  roguishFeats?: RoguishFeatDB[] | RoguishFeats;
  // weaponSkills can be an array (old format) or an object with remaining+skills (new format)
  weaponSkills?: WeaponSkillDB[] | WeaponSkills;
  reputations?: FactionReputationDB[];
  reputation?: Reputation;
  equipment?: string | Equipment;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function toCharacterDB(
  character: Character,
  userId?: string
): Omit<CharacterDB, '_id' | 'createdAt' | 'updatedAt'> {
  // Convert nature array to single object (take first selected)
  const selectedNature = character.nature.find((n) => n.selected);
  const nature: NatureDB = selectedNature
    ? { name: selectedNature.name, description: selectedNature.description }
    : { name: '', description: '' };

  const drives: DriveDB[] = character.drives
    .filter((d) => d.selected)
    .map((d) => ({ name: d.name, description: d.description }));

  const moves: MoveDB[] = character.moves
    .filter((m) => m.selected)
    .map((m) => ({ name: m.name, description: m.description }));

  const roguishFeats: RoguishFeatDB[] = character.roguishFeats.feats
    .filter((f) => f.selected)
    .map((f) => ({ name: f.name, description: f.description }));

  const weaponSkills: WeaponSkillDB[] = character.weaponSkills.skills
    .filter((s) => s.selected)
    .map((s) => ({ name: s.name, description: s.description }));

  const reputations: FactionReputationDB[] = Object.entries(
    character.reputation.factions
  ).map(([name, rep]) => ({
    name,
    notoriety: rep.notoriety,
    prestige: rep.prestige,
  }));

  // Keep equipment as string (or stringify if it's an object for backward compatibility)
  const equipment = typeof character.equipment === 'string'
    ? character.equipment
    : JSON.stringify(character.equipment);

  return {
    idUsuario: userId || character.userId,
    system: character.system,
    className: character.className,
    name: character.name,
    species: character.species,
    details: character.details,
    demeanor: character.demeanor,
    avatarImage: character.avatarImage,
    nature,
    drives,
    background: character.background,
    connections: character.connections,
    stats: character.stats,
    reputations,
    moves,
    roguishFeats,
    weaponSkills,
    equipment,
    isPublic: character.isPublic,
    _class: 'com.project.rolify.domain.Character',
  };
}

export function fromCharacterDB(characterDB: CharacterAPIResponse): Character {
  // Convert nature - handle both object and array formats
  let nature: SelectedOption[] = [];
  if (characterDB.nature) {
    if (Array.isArray(characterDB.nature)) {
      nature = characterDB.nature.map((n) => ({ ...n, selected: true }));
    } else {
      nature = [{ ...characterDB.nature, selected: true }];
    }
  }

  const drives: SelectedOption[] = (characterDB.drives || []).map((d) => ({ ...d, selected: true }));
  const moves: SelectedOption[] = (characterDB.moves || []).map((m) => ({ ...m, selected: true }));

  // Convert roguish feats to UI format - handle both array and object formats
  const roguishFeats: RoguishFeats = characterDB.roguishFeats
    ? (Array.isArray(characterDB.roguishFeats)
        ? { remaining: 0, feats: characterDB.roguishFeats.map((f) => ({ ...f, selected: true })) }
        : characterDB.roguishFeats)
    : { remaining: 0, feats: [] };

  // Convert weapon skills to UI format - handle both array and object formats
  const weaponSkills: WeaponSkills = characterDB.weaponSkills
    ? (Array.isArray(characterDB.weaponSkills)
        ? { remaining: 0, skills: characterDB.weaponSkills.map((s) => ({ ...s, selected: true })) }
        : characterDB.weaponSkills)
    : { remaining: 0, skills: [] };

  // Convert reputations - handle both array and object formats
  let reputation: Reputation = { factions: {} };
  if (characterDB.reputations && Array.isArray(characterDB.reputations)) {
    reputation = {
      factions: characterDB.reputations.reduce(
        (acc: Record<string, { prestige: number; notoriety: number }>, rep: FactionReputationDB) => {
          acc[rep.name] = {
            prestige: rep.prestige,
            notoriety: rep.notoriety,
          };
          return acc;
        },
        {}
      ),
    };
  } else if (characterDB.reputation) {
    reputation = characterDB.reputation;
  }

  let equipment: string | Equipment = characterDB.equipment || '';

  // JSON strings starting with '{' might be the old Equipment object format
  if (typeof equipment === 'string' && equipment.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(equipment);
      if (parsed && typeof parsed === 'object' && 'carrying' in parsed) {
        equipment = parsed;
      }
    } catch {
      // not valid JSON, keep as-is
    }
  }

  return {
    id: characterDB.id || characterDB._id,
    userId: characterDB.userId || characterDB.idUsuario,
    name: characterDB.name,
    system: characterDB.system,
    className: characterDB.className,
    species: characterDB.species,
    demeanor: characterDB.demeanor,
    details: characterDB.details,
    avatarImage: characterDB.avatarImage,
    stats: characterDB.stats,
    background: characterDB.background,
    drives,
    nature,
    moves,
    connections: characterDB.connections,
    weaponSkills,
    roguishFeats,
    equipment,
    reputation,
    isPublic: characterDB.isPublic,
    createdAt: characterDB.createdAt,
    updatedAt: characterDB.updatedAt,
  };
}

