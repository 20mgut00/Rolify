# Estructura de Datos de Personajes

Este documento describe la estructura de datos fusionada entre el frontend TypeScript y el backend MongoDB.

## Estructura MongoDB (Backend)

La estructura MongoDB sigue exactamente este formato:

```json
{
  "_id": "ObjectId",
  "idUsuario": "string",
  "system": "Root",
  "className": "Adventurer",
  "name": "Bicho",
  "species": "Buho",
  "details": "Marron",
  "demeanor": "Tranquilo",
  "avatarImage": "data:image/png;base64,...",
  "nature": {
    "name": "Peacemaker",
    "description": "Clear your exhaustion track when you resolve a dangerous conflict nonviolently."
  },
  "drives": [
    {
      "name": "Ambition",
      "description": "Advance when you increase your Reputation with any faction."
    }
  ],
  "background": [
    {
      "question": "Where do you call home?",
      "answer": "A clearing."
    }
  ],
  "connections": [],
  "stats": [
    {
      "name": "Charm",
      "value": 2
    }
  ],
  "reputations": [
    {
      "name": "Lobos",
      "notoriety": 0,
      "prestige": 6
    }
  ],
  "moves": [
    {
      "name": "Subduing Strikes",
      "description": "When you aim to subdue an enemy..."
    }
  ],
  "roguishFeats": [
    {
      "name": "Counterfeit",
      "description": "Copying, forgery, fakery."
    }
  ],
  "weaponSkills": [
    {
      "name": "Improvise a Weapon",
      "description": "When you make a weapon out of improvised materials..."
    }
  ],
  "equipment": "Cosas",
  "_class": "com.project.rolify.domain.Character"
}
```

## Estructura TypeScript (Frontend)

### Character (Principal)

Esta interfaz representa un personaje tal como se almacena en MongoDB:

```typescript
interface Character {
  _id?: string;           // MongoDB ID
  id?: string;            // Frontend ID mapping
  idUsuario?: string;     // MongoDB user ID
  userId?: string;        // Frontend user ID mapping
  system: string;
  className: string;
  name: string;
  species: string;
  details: string;
  demeanor: string;
  avatarImage?: string;
  nature: Nature;         // Un solo objeto
  drives: Drive[];        // Array simple
  background: BackgroundAnswer[];
  connections: Connection[];
  stats: Stat[];
  reputations: FactionReputation[];  // Array simple
  moves: Move[];          // Array simple
  roguishFeats: RoguishFeat[];       // Array simple
  weaponSkills: WeaponSkill[];       // Array simple
  equipment: string;      // String simple (puede ser JSON)
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
  _class?: string;        // Metadato de Java
}
```

### CharacterFormData (UI)

Esta interfaz se usa en formularios y componentes de UI antes de enviar al backend:

```typescript
interface CharacterFormData {
  name: string;
  system: string;
  className: string;
  species: string;
  demeanor: string;
  details: string;
  avatarImage?: string;
  stats: Stat[];
  background: BackgroundAnswer[];
  drives: SelectedOption[];        // Con campo 'selected'
  nature: SelectedOption[];        // Con campo 'selected'
  moves: SelectedOption[];         // Con campo 'selected'
  connections: Connection[];
  weaponSkills: WeaponSkillsUI;    // Con 'remaining' y 'selected'
  roguishFeats: RoguishFeatsUI;    // Con 'remaining' y 'selected'
  equipment: EquipmentUI;          // Estructura compleja
  reputation: ReputationUI;        // Record de facciones
  isPublic?: boolean;
}
```

## Funciones de Conversión (Mappers)

### toCharacterDB

Convierte un Character de UI al formato MongoDB CharacterDB:

```typescript
import { toCharacterDB } from '@/utils/characterMapper';

const character: Character = {
  // ... datos del personaje en formato UI
};

const characterDB = toCharacterDB(character, userId);
// characterDB ahora está en formato MongoDB
```

**Lo que hace:**
- Convierte `nature` array → objeto (toma el primero seleccionado)
- Convierte `drives`, `moves` → elimina campo `selected`
- Convierte `roguishFeats` y `weaponSkills` → arrays simples
- Convierte `reputation` objeto → array de `FactionReputationDB`
- Convierte `equipment` objeto → string JSON
- Agrega campo `_class` para Java
- Mapea `userId` → `idUsuario`

### fromCharacterDB

Convierte un CharacterDB de MongoDB al formato UI Character:

```typescript
import { fromCharacterDB } from '@/utils/characterMapper';

const characterDB: CharacterDB = {
  // ... datos de MongoDB
};

const character = fromCharacterDB(characterDB);
// character ahora tiene estructura UI con campos 'selected'
```

**Lo que hace:**
- Convierte `nature` objeto → array con `selected: true`
- Convierte `drives`, `moves` → agrega campo `selected: true`
- Convierte arrays simples → estructuras UI con `remaining` y `selected`
- Convierte array de reputaciones → objeto Record
- Convierte string `equipment` → objeto Equipment
- Mapea `_id` → `id`
- Mapea `idUsuario` → `userId`

## Uso en la Práctica

### Crear un Personaje

```typescript
import { characterAPI } from '@/services/api';

// 1. Crear personaje con formato UI (el que usas en los componentes)
const character: Partial<Character> = {
  name: "Bicho",
  system: "Root",
  className: "Adventurer",
  species: "Buho",
  demeanor: "Tranquilo",
  details: "Marron",
  nature: [{ name: "Peacemaker", description: "...", selected: true }],
  drives: [{ name: "Ambition", description: "...", selected: true }],
  stats: [{ name: "Charm", value: 2 }],
  // ... resto de datos en formato UI
};

// 2. Enviar al backend (la API convierte automáticamente)
const savedCharacter = await characterAPI.create(character);
// savedCharacter es tipo Character (formato UI)
```

### Editar un Personaje

```typescript
import { characterAPI } from '@/services/api';

// 1. Obtener personaje del backend (ya viene en formato UI)
const character = await characterAPI.getById(id);
// character es tipo Character con arrays de SelectedOption, etc.

// 2. Editar directamente
character.name = "Nuevo nombre";
character.nature[0].name = "Nuevo nature";

// 3. Actualizar en el backend (la API convierte automáticamente)
const updated = await characterAPI.update(id, character);
```

### Mostrar Personaje

```typescript
import { characterAPI } from '@/services/api';

// El personaje ya viene en formato UI desde la API
const character = await characterAPI.getById(id);

console.log(character.id);      // Disponible (mapeado desde _id)
console.log(character.userId);  // Disponible (mapeado desde idUsuario)
console.log(character.nature);  // Array de SelectedOption
console.log(character.drives);  // Array de SelectedOption (con 'selected')
console.log(character.equipment); // Objeto Equipment (parseado desde JSON)
```

## Diferencias Clave

| Campo | MongoDB (CharacterDB) | UI (Character) |
|-------|---------|---------------|
| `nature` | Objeto único (`NatureDB`) | Array con `selected` (`SelectedOption[]`) |
| `drives` | Array simple (`DriveDB[]`) | Array con `selected` (`SelectedOption[]`) |
| `moves` | Array simple (`MoveDB[]`) | Array con `selected` (`SelectedOption[]`) |
| `roguishFeats` | Array simple (`RoguishFeatDB[]`) | Objeto con `remaining` y array (`RoguishFeats`) |
| `weaponSkills` | Array simple (`WeaponSkillDB[]`) | Objeto con `remaining` y array (`WeaponSkills`) |
| `reputations` | Array de objetos (`FactionReputationDB[]`) | Record de facciones (`Reputation`) |
| `equipment` | String (JSON) | Objeto complejo (`Equipment`) |
| ID de usuario | `idUsuario` | `userId` |
| ID de personaje | `_id` | `id` |

## Notas Importantes

1. **Los servicios API ya manejan la conversión automáticamente** - usa `characterAPI.create()` y `characterAPI.update()` directamente con objetos tipo `Character` (formato UI).

2. **No necesitas llamar a `toCharacterDB` o `fromCharacterDB` manualmente** - la capa API lo hace automáticamente.

3. **En tus componentes, trabaja siempre con el tipo `Character`** (formato UI) que tiene arrays con `selected`, objetos `Equipment` completos, etc.

4. **El tipo `CharacterDB` es solo para la comunicación con el backend** - no lo uses en componentes React.

5. **El campo `_class`** se agrega automáticamente al guardar para compatibilidad con Java/Spring.

6. **El `equipment` se convierte automáticamente**:
   - En UI: objeto `Equipment` con `items[]`, `carrying`, `max`, etc.
   - En MongoDB: string JSON

7. **Las conversiones son bidireccionales y seguras** - si falla el parseo de JSON, se usan valores por defecto.
