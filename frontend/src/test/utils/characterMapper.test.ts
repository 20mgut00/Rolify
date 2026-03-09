import { describe, it, expect } from 'vitest';
import { toCharacterDB, fromCharacterDB } from '../../utils/characterMapper';
import type { Character, Equipment } from '../../types';

// ---- Fixtures ----

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    name: 'Gideon',
    system: 'Root',
    className: 'Arbiter',
    species: 'Conejo',
    demeanor: 'Tranquilo',
    details: 'Un árbitro silencioso',
    stats: [{ name: 'Encanto', value: 1 }],
    background: [{ question: '¿De dónde vienes?', answer: 'Del bosque' }],
    drives: [
      { name: 'Justicia', description: 'Busca justicia', selected: true },
      { name: 'Poder', description: 'Busca poder', selected: false },
    ],
    nature: [
      { name: 'Defensor', description: 'Protege a otros', selected: true },
    ],
    moves: [
      { name: 'Corte', description: 'Ataque rápido', selected: true },
      { name: 'Bloqueo', description: 'Defiende', selected: false },
    ],
    connections: [{ characterName: 'Aria', description: 'Una amiga' }],
    weaponSkills: {
      remaining: 0,
      skills: [
        { name: 'Espada', description: 'Usar espada', selected: true },
        { name: 'Arco', description: 'Usar arco', selected: false },
      ],
    },
    roguishFeats: {
      remaining: 0,
      feats: [
        { name: 'Sigilo', description: 'Moverse en silencio', selected: true },
        { name: 'Escalar', description: 'Escalar muros', selected: false },
      ],
    },
    equipment: 'Una espada y un escudo',
    reputation: {
      factions: {
        Woodland: { prestige: 3, notoriety: 1 },
      },
    },
    ...overrides,
  };
}

// ---- toCharacterDB ----

describe('toCharacterDB', () => {
  it('convierte la nature seleccionada a un objeto NatureDB', () => {
    const result = toCharacterDB(makeCharacter());

    expect(result.nature).toEqual({ name: 'Defensor', description: 'Protege a otros' });
  });

  it('devuelve nature vacía cuando ninguna opción está seleccionada', () => {
    const character = makeCharacter({
      nature: [{ name: 'Defensor', description: 'Protege a otros', selected: false }],
    });
    const result = toCharacterDB(character);

    expect(result.nature).toEqual({ name: '', description: '' });
  });

  it('filtra solo los drives seleccionados y elimina el campo selected', () => {
    const result = toCharacterDB(makeCharacter());

    expect(result.drives).toHaveLength(1);
    expect(result.drives[0]).toEqual({ name: 'Justicia', description: 'Busca justicia' });
    expect(result.drives[0]).not.toHaveProperty('selected');
  });

  it('filtra solo los moves seleccionados', () => {
    const result = toCharacterDB(makeCharacter());

    expect(result.moves).toHaveLength(1);
    expect(result.moves[0].name).toBe('Corte');
  });

  it('filtra solo los roguishFeats seleccionados', () => {
    const result = toCharacterDB(makeCharacter());

    expect(result.roguishFeats).toHaveLength(1);
    expect(result.roguishFeats[0]).toEqual({ name: 'Sigilo', description: 'Moverse en silencio' });
  });

  it('mantiene el equipment como string cuando ya es un string', () => {
    const result = toCharacterDB(makeCharacter({ equipment: 'Una espada' }));

    expect(result.equipment).toBe('Una espada');
  });

  it('serializa el equipment a JSON cuando es un objeto Equipment', () => {
    const equipObj: Equipment = { startingValue: 10, carrying: 2, burdened: 5, max: 10, items: [] };
    const result = toCharacterDB(makeCharacter({ equipment: equipObj }));

    expect(result.equipment).toBe(JSON.stringify(equipObj));
  });

  it('usa el userId del parámetro cuando se proporciona', () => {
    const result = toCharacterDB(makeCharacter({ userId: 'original' }), 'sobreescrito');

    expect(result.idUsuario).toBe('sobreescrito');
  });
});

// ---- fromCharacterDB ----

describe('fromCharacterDB', () => {
  // Objeto base mínimo válido para fromCharacterDB
  const base = {
    id: 'abc123',
    name: 'Gideon',
    system: 'Root',
    className: 'Arbiter',
    species: 'Conejo',
    demeanor: 'Tranquilo',
    details: 'Un árbitro silencioso',
    stats: [{ name: 'Encanto', value: 1 }],
    background: [{ question: '¿De dónde vienes?', answer: 'Del bosque' }],
    connections: [{ characterName: 'Aria', description: 'Una amiga' }],
  };

  it('convierte el objeto nature a SelectedOption[] con selected=true', () => {
    const result = fromCharacterDB({
      ...base,
      nature: { name: 'Defensor', description: 'Protege a otros' },
    });

    expect(result.nature).toHaveLength(1);
    expect(result.nature[0]).toEqual({
      name: 'Defensor',
      description: 'Protege a otros',
      selected: true,
    });
  });

  it('convierte el array de drives añadiendo selected=true', () => {
    const result = fromCharacterDB({
      ...base,
      drives: [{ name: 'Justicia', description: 'Busca justicia' }],
    });

    expect(result.drives[0].selected).toBe(true);
    expect(result.drives[0].name).toBe('Justicia');
  });

  it('resuelve el id desde _id como fallback', () => {
    const result = fromCharacterDB({ ...base, id: undefined, _id: 'fallback-id' });

    expect(result.id).toBe('fallback-id');
  });

  it('resuelve el userId desde idUsuario como fallback', () => {
    const result = fromCharacterDB({ ...base, userId: undefined, idUsuario: 'user-legacy' });

    expect(result.userId).toBe('user-legacy');
  });

  it('mantiene el equipment como string cuando no es un objeto Equipment', () => {
    const result = fromCharacterDB({ ...base, equipment: 'Una espada y escudo' });

    expect(result.equipment).toBe('Una espada y escudo');
  });

  it('convierte el array de reputaciones a un mapa de facciones', () => {
    const result = fromCharacterDB({
      ...base,
      reputations: [{ name: 'Woodland', prestige: 3, notoriety: 1 }],
    });

    expect(result.reputation.factions['Woodland']).toEqual({ prestige: 3, notoriety: 1 });
  });

  it('convierte roguishFeats en formato array (antiguo) a objeto con selected=true', () => {
    const result = fromCharacterDB({
      ...base,
      roguishFeats: [{ name: 'Sigilo', description: 'Moverse en silencio' }],
    });

    expect(result.roguishFeats.remaining).toBe(0);
    expect(result.roguishFeats.feats[0].selected).toBe(true);
    expect(result.roguishFeats.feats[0].name).toBe('Sigilo');
  });
});
