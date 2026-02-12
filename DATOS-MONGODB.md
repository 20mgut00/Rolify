# Integración MongoDB - Resumen

## ✅ Cambios Completados

He fusionado tu estructura MongoDB con la estructura TypeScript del frontend. Ahora el proyecto maneja automáticamente la conversión entre ambos formatos.

## 📦 Estructura de Datos

### MongoDB (Backend)
```typescript
interface CharacterDB {
  _id: string;
  idUsuario: string;
  system: string;
  className: string;
  name: string;
  species: string;
  details: string;
  demeanor: string;
  avatarImage?: string;
  nature: { name: string; description: string };  // ⚠️ Objeto único
  drives: Array<{ name: string; description: string }>;  // ⚠️ Sin 'selected'
  moves: Array<{ name: string; description: string }>;
  background: Array<{ question: string; answer: string }>;
  connections: Connection[];
  stats: Array<{ name: string; value: number }>;
  reputations: Array<{ name: string; notoriety: number; prestige: number }>;
  roguishFeats: Array<{ name: string; description: string }>;
  weaponSkills: Array<{ name: string; description: string }>;
  equipment: string;  // ⚠️ String JSON
  isPublic?: boolean;
  _class: string;  // "com.project.rolify.domain.Character"
}
```

### Frontend (UI)
```typescript
interface Character {
  id: string;
  userId: string;
  // ... campos básicos iguales ...
  nature: SelectedOption[];  // ⚠️ Array con 'selected'
  drives: SelectedOption[];  // ⚠️ Con 'selected: boolean'
  moves: SelectedOption[];
  roguishFeats: { remaining: number; feats: Feat[] };  // ⚠️ Objeto complejo
  weaponSkills: { remaining: number; skills: Skill[] };
  equipment: Equipment;  // ⚠️ Objeto complejo con items[], carrying, max, etc.
  reputation: { factions: Record<string, { prestige: number; notoriety: number }> };
}
```

## 🔄 Conversión Automática

**No necesitas hacer nada especial**. La capa API convierte automáticamente:

```typescript
// ✅ Esto funciona automáticamente
const character = await characterAPI.create({
  name: "Bicho",
  species: "Buho",
  nature: [{ name: "Peacemaker", description: "...", selected: true }],
  equipment: { startingValue: 9, items: [], ... },
  // ... formato UI
});

// ✅ El backend recibe formato MongoDB
// ✅ La respuesta vuelve en formato UI
```

## 📁 Archivos Creados/Modificados

### ✨ Nuevos
1. **`frontend/src/utils/characterMapper.ts`** - Funciones de conversión
   - `toCharacterDB()` - UI → MongoDB
   - `fromCharacterDB()` - MongoDB → UI

2. **`STRUCTURE.md`** - Documentación detallada

3. **`DATOS-MONGODB.md`** - Este archivo (resumen)

### 🔧 Modificados
1. **`frontend/src/types/index.ts`** - Tipos actualizados
   - `Character` - Formato UI (existente, compatible)
   - `CharacterDB` - Formato MongoDB (nuevo)
   - Tipos auxiliares con sufijo `DB`

2. **`frontend/src/services/api.ts`** - Conversión automática
   - `create()` - Convierte antes de enviar, después de recibir
   - `update()` - Convierte antes de enviar, después de recibir
   - `getById()` - Convierte al recibir

## 🎯 Cómo Usar

### En tus componentes React - No cambies nada

```typescript
// ✅ Sigue trabajando como siempre con tipo Character
const [formData, setFormData] = useState<Partial<Character>>({
  name: '',
  nature: [],  // Array con 'selected'
  drives: [],  // Array con 'selected'
  equipment: { items: [], carrying: 0, ... },  // Objeto
  // ...
});

// ✅ Guardar (la API convierte automáticamente)
await characterAPI.create(formData);

// ✅ Cargar (ya viene convertido a formato UI)
const char = await characterAPI.getById(id);
console.log(char.nature);  // Array de SelectedOption
console.log(char.equipment);  // Objeto Equipment
```

### Si necesitas conversión manual (raro)

```typescript
import { toCharacterDB, fromCharacterDB } from '@/utils/characterMapper';

// UI → MongoDB
const dbFormat = toCharacterDB(character, userId);

// MongoDB → UI
const uiFormat = fromCharacterDB(characterDB);
```

## 🔑 Diferencias Principales

| Aspecto | MongoDB | Frontend |
|---------|---------|----------|
| Nature | 1 objeto | Array (para selección) |
| Drives/Moves | Array simple | Array con `selected: boolean` |
| Equipment | String JSON | Objeto tipado |
| Reputation | Array `[{name, prestige, notoriety}]` | Object `{factions: {...}}` |
| User ID | `idUsuario` | `userId` |
| Character ID | `_id` | `id` |

## ✅ Ejemplo Completo

```typescript
// 1️⃣ Crear personaje en el formulario (formato UI)
const newCharacter: Partial<Character> = {
  name: "Bicho",
  system: "Root",
  className: "Adventurer",
  species: "Buho",
  demeanor: "Tranquilo",
  details: "Marron",
  nature: [
    { name: "Peacemaker", description: "Clear your exhaustion...", selected: true }
  ],
  drives: [
    { name: "Ambition", description: "Advance when...", selected: true },
    { name: "Clean Paws", description: "Advance when...", selected: true }
  ],
  background: [
    { question: "Where do you call home?", answer: "A clearing." }
  ],
  stats: [
    { name: "Charm", value: 2 },
    { name: "Cunning", value: 1 }
  ],
  equipment: {
    startingValue: 9,
    carrying: 0,
    burdened: 4,
    max: 8,
    items: []
  },
  // ...
};

// 2️⃣ Guardar (conversión automática a MongoDB)
const saved = await characterAPI.create(newCharacter);

// 3️⃣ saved es tipo Character (formato UI) listo para usar
console.log(saved.id);  // Mapeado desde _id
console.log(saved.nature);  // Array con selected
```

## 🎨 Mapeo de Campos

```javascript
// Cuando envías al backend:
{
  nature: [{ name: "X", description: "Y", selected: true }]
}
// ↓ Se convierte a ↓
{
  nature: { name: "X", description: "Y" }
}

// Cuando recibes del backend:
{
  equipment: "{\"startingValue\":9,\"items\":[]}"
}
// ↓ Se convierte a ↓
{
  equipment: { startingValue: 9, items: [], ... }
}
```

## 🚀 Conclusión

**Todo funciona automáticamente**. Trabaja con el tipo `Character` en tus componentes como siempre. La capa API se encarga de convertir hacia/desde MongoDB.

Si tienes dudas, revisa `STRUCTURE.md` para documentación detallada.
