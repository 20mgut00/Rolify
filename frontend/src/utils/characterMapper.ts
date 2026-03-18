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

// Acepta multiples formatos de respuesta del backend (legacy v1 y v2) para retrocompatibilidad
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
  nature?: NatureDB | SelectedOption[] | NatureDB[];
  drives?: (DriveDB | SelectedOption)[];
  moves?: (MoveDB | SelectedOption)[];
  roguishFeats?: RoguishFeatDB[] | RoguishFeats;
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
    // _class es requerido por Spring Data MongoDB para deserializar el documento correctamente
    _class: 'com.project.rolify.domain.Character',
  };
}

export function fromCharacterDB(characterDB: CharacterAPIResponse): Character {
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

  const roguishFeats: RoguishFeats = characterDB.roguishFeats
    ? (Array.isArray(characterDB.roguishFeats)
        ? { remaining: 0, feats: characterDB.roguishFeats.map((f) => ({ ...f, selected: true })) }
        : characterDB.roguishFeats)
    : { remaining: 0, feats: [] };

  const weaponSkills: WeaponSkills = characterDB.weaponSkills
    ? (Array.isArray(characterDB.weaponSkills)
        ? { remaining: 0, skills: characterDB.weaponSkills.map((s) => ({ ...s, selected: true })) }
        : characterDB.weaponSkills)
    : { remaining: 0, skills: [] };

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

  // Intenta parsear equipment como JSON por si es el formato antiguo (objeto Equipment serializado)
  if (typeof equipment === 'string' && equipment.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(equipment);
      if (parsed && typeof parsed === 'object' && 'carrying' in parsed) {
        equipment = parsed;
      }
    } catch {
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

