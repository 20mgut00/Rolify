// Base Character Types
export interface Stat {
  name: string;
  value: number;
}

export interface BackgroundAnswer {
  question: string;
  answer: string;
}

export interface Connection {
  type?: string;
  characterName: string;
  description: string;
  story?: string;
}

// MongoDB-specific types (backend format)
export interface NatureDB {
  name: string;
  description: string;
}

export interface DriveDB {
  name: string;
  description: string;
}

export interface MoveDB {
  name: string;
  description: string;
}

export interface RoguishFeatDB {
  name: string;
  description: string;
}

export interface WeaponSkillDB {
  name: string;
  description: string;
}

export interface FactionReputationDB {
  name: string;
  notoriety: number;
  prestige: number;
}

// Gemini AI Generated Character Response
export interface GeneratedCharacter {
  name: string;
  species: string;
  demeanor: string;
  details: string;
  equipment: string;
  nature?: { name: string; description: string };
  drives?: Array<{ name: string; description: string }>;
  moves?: Array<{ name: string; description: string }>;
  background?: Array<{ question: string; answer: string }>;
  connections?: Array<{ name: string; answer: string }>;
  stats?: Array<{ name: string; value: number }>;
  roguishFeats?: Array<{ name: string; description: string }>;
  weaponSkills?: Array<{ name: string; description: string }>;
}

// MongoDB Character Schema (backend storage format)
export interface CharacterDB {
  _id?: string;
  idUsuario?: string;
  system: string;
  className: string;
  name: string;
  species: string;
  details: string;
  demeanor: string;
  avatarImage?: string;
  nature: NatureDB;
  drives: DriveDB[];
  background: BackgroundAnswer[];
  connections: Connection[];
  stats: Stat[];
  reputations: FactionReputationDB[];
  moves: MoveDB[];
  roguishFeats: RoguishFeatDB[];
  weaponSkills: WeaponSkillDB[];
  equipment: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
  _class?: string;
}

// UI Helper Types (for forms and selection)
export interface SelectedOption {
  name: string;
  description: string;
  selected: boolean;
}

export interface Skill {
  name: string;
  description: string;
  selected: boolean;
}

export interface WeaponSkills {
  remaining: number;
  skills: Skill[];
}

export interface Feat {
  name: string;
  description: string;
  selected: boolean;
}

export interface RoguishFeats {
  remaining: number;
  feats: Feat[];
}

export interface Item {
  name: string;
  value: number;
  wear: number;
}

export interface Equipment {
  startingValue: number;
  carrying: number;
  burdened: number;
  max: number;
  items: Item[];
}

export interface FactionReputation {
  prestige: number;
  notoriety: number;
}

export interface Reputation {
  factions: Record<string, FactionReputation>;
}

// Character for UI (frontend format - maintains backward compatibility)
export interface Character {
  id?: string;
  userId?: string;
  name: string;
  system: string;
  className: string;
  species: string;
  demeanor: string;
  details: string;
  avatarImage?: string;
  stats: Stat[];
  background: BackgroundAnswer[];
  drives: SelectedOption[];
  nature: SelectedOption[];
  moves: SelectedOption[];
  connections: Connection[];
  weaponSkills: WeaponSkills;
  roguishFeats: RoguishFeats;
  equipment: Equipment | string; // Can be either string or Equipment object for backward compatibility
  reputation: Reputation;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CharacterCard {
  id: string;
  name: string;
  creatorName?: string;
  system: string;
  className: string;
  species: string;
  avatarImage?: string;
  isPublic: boolean;
  createdAt: string;
}

// Class Template Types
export interface BackgroundQuestion {
  name: string;
  answers: string[];
}

export interface Option {
  name: string;
  description: string;
}

export interface ClassTemplate {
  id: string;
  system: string;
  className: string;
  description: string;
  avatarImage?: string;
  background: BackgroundQuestion[];
  nature: Option[];
  drives: Option[];
  connections: Option[];
  roguishFeats: RoguishFeats;
  weaponSkills: WeaponSkills;
  stats: Stat[];
  moves: Option[];
  maxDrives?: number;
  maxMoves?: number;
  maxNature?: number;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
  totalCharacters: number;
  publicCharacters: number;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
