import type {
  Character,
  CharacterDB,
  NatureDB,
  DriveDB,
  MoveDB,
  RoguishFeatDB,
  WeaponSkillDB,
  FactionReputationDB,
} from '../types';

/**
 * Converts UI Character to MongoDB CharacterDB format
 */
export function toCharacterDB(
  character: Character,
  userId?: string
): Omit<CharacterDB, '_id' | 'createdAt' | 'updatedAt'> {
  // Convert nature array to single object (take first selected)
  const selectedNature = character.nature.find((n) => n.selected);
  const nature: NatureDB = selectedNature
    ? { name: selectedNature.name, description: selectedNature.description }
    : { name: '', description: '' };

  // Convert drives (remove selected field)
  const drives: DriveDB[] = character.drives
    .filter((d) => d.selected)
    .map((d) => ({ name: d.name, description: d.description }));

  // Convert moves (remove selected field)
  const moves: MoveDB[] = character.moves
    .filter((m) => m.selected)
    .map((m) => ({ name: m.name, description: m.description }));

  // Convert roguish feats
  const roguishFeats: RoguishFeatDB[] = character.roguishFeats.feats
    .filter((f) => f.selected)
    .map((f) => ({ name: f.name, description: f.description }));

  // Convert weapon skills
  const weaponSkills: WeaponSkillDB[] = character.weaponSkills.skills
    .filter((s) => s.selected)
    .map((s) => ({ name: s.name, description: s.description }));

  // Convert reputation to array
  const reputations: FactionReputationDB[] = Object.entries(
    character.reputation.factions
  ).map(([name, rep]) => ({
    name,
    notoriety: rep.notoriety,
    prestige: rep.prestige,
  }));

  // Convert equipment to string
  const equipment = JSON.stringify(character.equipment);

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

/**
 * Converts MongoDB CharacterDB to UI Character format
 */
export function fromCharacterDB(characterDB: any): Character {
  // Convert nature - handle both object and array formats
  let nature = [];
  if (characterDB.nature) {
    if (Array.isArray(characterDB.nature)) {
      // If it's already an array, use it
      nature = characterDB.nature.map((n: any) => ({ ...n, selected: true }));
    } else {
      // If it's an object, convert to array
      nature = [{ ...characterDB.nature, selected: true }];
    }
  }

  // Convert drives (add selected field)
  const drives = (characterDB.drives || []).map((d: any) => ({ ...d, selected: true }));

  // Convert moves (add selected field)
  const moves = (characterDB.moves || []).map((m: any) => ({ ...m, selected: true }));

  // Convert roguish feats to UI format - handle both array and object formats
  const roguishFeats = characterDB.roguishFeats
    ? (Array.isArray(characterDB.roguishFeats)
        ? { remaining: 0, feats: characterDB.roguishFeats.map((f: any) => ({ ...f, selected: true })) }
        : characterDB.roguishFeats)
    : { remaining: 0, feats: [] };

  // Convert weapon skills to UI format - handle both array and object formats
  const weaponSkills = characterDB.weaponSkills
    ? (Array.isArray(characterDB.weaponSkills)
        ? { remaining: 0, skills: characterDB.weaponSkills.map((s: any) => ({ ...s, selected: true })) }
        : characterDB.weaponSkills)
    : { remaining: 0, skills: [] };

  // Convert reputations - handle both array and object formats
  let reputation = { factions: {} };
  if (characterDB.reputations && Array.isArray(characterDB.reputations)) {
    reputation = {
      factions: characterDB.reputations.reduce(
        (acc: any, rep: any) => {
          acc[rep.name] = {
            prestige: rep.prestige,
            notoriety: rep.notoriety,
          };
          return acc;
        },
        {} as Record<string, { prestige: number; notoriety: number }>
      ),
    };
  } else if (characterDB.reputation) {
    reputation = characterDB.reputation;
  }

  // Parse equipment string to object
  let equipment;
  try {
    equipment =
      typeof characterDB.equipment === 'string'
        ? JSON.parse(characterDB.equipment)
        : {
            startingValue: 0,
            carrying: 0,
            burdened: 0,
            max: 0,
            items: [],
          };
  } catch {
    equipment = {
      startingValue: 0,
      carrying: 0,
      burdened: 0,
      max: 0,
      items: [],
    };
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

/**
 * @deprecated Use toCharacterDB instead
 */
export function prepareForMongoDB(character: Character, userId?: string) {
  return toCharacterDB(character, userId);
}

/**
 * @deprecated Use fromCharacterDB instead
 */
export function normalizeCharacter(characterDB: CharacterDB): Character {
  return fromCharacterDB(characterDB);
}
