# Guía de Componentes Faltantes

Esta guía describe los componentes que necesitas implementar para completar la aplicación.

## Componentes de Autenticación

### 1. LoginModal.tsx
Ubicación: `src/components/auth/LoginModal.tsx`

**Funcionalidad**:
- Tabs para Login/Register
- Formularios con React Hook Form + Zod
- Botón de Google OAuth
- Link para forgot password

**Props**:
```typescript
interface LoginModalProps {
  onClose: () => void;
}
```

### 2. VerifyEmail.tsx
Ubicación: `src/components/auth/VerifyEmail.tsx`

**Funcionalidad**:
- Leer token de query params
- Llamar a `authAPI.verifyEmail(token)`
- Mostrar success/error message
- Redirect a home

### 3. ResetPassword.tsx
Ubicación: `src/components/auth/ResetPassword.tsx`

**Funcionalidad**:
- Leer token de query params
- Formulario para nueva contraseña
- Llamar a `authAPI.resetPassword(token, password)`
- Redirect a login

## Componentes de Personajes

### 4. CharacterForm.tsx
Ubicación: `src/components/character/CharacterForm.tsx`

**Funcionalidad Principal**:
```typescript
- Cargar ClassTemplate del sistema seleccionado
- Formulario multi-paso:
  1. Basic Info (name, species, demeanor, details, avatar)
  2. Stats (sliders de -3 a +3, con validación de bonuses)
  3. Background (respuestas a preguntas)
  4. Drives (checkboxes, max 2)
  5. Nature (checkboxes, max 2)
  6. Moves (checkboxes, max 3)
  7. Weapon Skills (con "remaining" counter)
  8. Roguish Feats (checkboxes con starting selected)
  9. Equipment (calculado automáticamente)
  10. Connections (textarea para stories)
  11. Reputation (opcional)
  12. Public/Private toggle

- Validación en tiempo real
- Preview en sidebar
- Guardar como draft (localStorage si no logged in)
- Submit final
```

**Campos Calculados**:
```typescript
// Equipment
burdened = 4 + mightValue
max = burdened * 2

// Stats bonus validation
if (moveName === "Well-Read") {
  maxCunning = 3
} else {
  maxStat = 2
}
```

### 5. CharacterViewer.tsx
Ubicación: `src/components/character/CharacterViewer.tsx`

**Funcionalidad**:
- Fetch character by ID
- Display completo de la ficha
- Botones: Edit, Delete, Export, Share
- Diseño tipo ficha de personaje original

### 6. CharacterLibrary.tsx
Ubicación: `src/components/character/CharacterLibrary.tsx`

**Funcionalidad**:
- Grid de CharacterCard
- Si logged in: muestra personajes del usuario
- Si not logged in: muestra sessionCharacters de Zustand
- Botones por card: View, Edit, Delete, Export
- Filtros: por clase, búsqueda por nombre

### 7. CharacterCard.tsx
Ubicación: `src/components/character/CharacterCard.tsx`

**Props**:
```typescript
interface CharacterCardProps {
  character: CharacterCard;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onExport?: (id: string, format: 'pdf' | 'json' | 'csv') => void;
}
```

**Diseño**:
- Avatar/placeholder
- Name (título)
- Class + System (subtítulo)
- Species
- Public/Private badge
- Created date
- Action buttons

## Componentes de Galería

### 8. PublicGallery.tsx
Ubicación: `src/components/gallery/PublicGallery.tsx`

**Funcionalidad**:
- Infinite scroll con React Query
- Filtros: Class (dropdown)
- Grid de cards públicos
- Click en card → CharacterViewer (read-only)

**React Query**:
```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['publicCharacters', filters],
  queryFn: ({ pageParam = 0 }) => 
    characterAPI.getPublicCharacters(pageParam, 12, system, className),
  getNextPageParam: (lastPage) => 
    lastPage.last ? undefined : lastPage.number + 1,
});
```

## Componentes de Hero

### 9. Hero.tsx
Ubicación: `src/components/Hero.tsx`

**Funcionalidad**:
- Hero section con título y descripción
- Carousel con personajes públicos destacados
- CTA buttons: Create Character, Browse Gallery
- Features section

**Carousel**:
```typescript
// Fetch últimos 10 personajes públicos
// Auto-rotate cada 5 segundos
// Dots de navegación
// Mostrar: Avatar, Name, Class, excerpt
```

## Componentes de Settings

### 10. Settings.tsx
Ubicación: `src/components/settings/Settings.tsx`

**Funcionalidad**:
- Change Password form
- Update Profile (name, avatar)
- Email verification status
- Delete account (con confirmación)

### 11. Statistics.tsx
Ubicación: `src/components/settings/Statistics.tsx`

**Funcionalidad**:
- Total characters created
- Public characters count
- Characters by class (chart)
- Account creation date
- Last character created

## Utilidades

### 12. pdfExport.ts
Ubicación: `src/utils/pdfExport.ts`

**Funcionalidad**:
```typescript
export async function exportCharacterToPDF(character: Character) {
  // Crear HTML template limpio
  // Usar html2canvas para renderizar
  // Convertir a PDF con jsPDF
  // Download automático
}
```

**Diseño PDF**:
- Header: Nombre, Clase, Sistema
- Stats en tabla
- Background Q&A
- Drives/Nature/Moves en listas
- Skills/Feats en checkboxes
- Equipment table
- Footer con created date

### 13. jsonExport.ts
Ubicación: `src/utils/jsonExport.ts`

```typescript
export function exportCharacterToJSON(character: Character) {
  const blob = new Blob([JSON.stringify(character, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${character.name}.json`;
  a.click();
}
```

### 14. csvExport.ts
Ubicación: `src/utils/csvExport.ts`

```typescript
export function exportCharacterToCSV(character: Character) {
  // Flatten character data
  // Convert to CSV format
  // Download
}
```

## Validación con Zod

### 15. validationSchemas.ts
Ubicación: `src/utils/validationSchemas.ts`

```typescript
import { z } from 'zod';

export const characterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  species: z.string().min(1, 'Species is required'),
  demeanor: z.string().optional(),
  details: z.string().optional(),
  stats: z.array(z.object({
    name: z.string(),
    value: z.number().min(-3).max(3),
  })),
  drives: z.array(z.object({
    name: z.string(),
    selected: z.boolean(),
  })).refine((drives) => 
    drives.filter(d => d.selected).length <= 2, 
    'Maximum 2 drives allowed'
  ),
  // ... more validations
});
```

## Scripts de Inicio Rápido

Crear archivo: `frontend/QUICK_START.md`

```markdown
# Quick Start Development Guide

## 1. Instalar dependencias

\`\`\`bash
cd frontend
npm install
\`\`\`

## 2. Configurar .env

\`\`\`
VITE_API_URL=http://localhost:8080/api
\`\`\`

## 3. Iniciar desarrollo

\`\`\`bash
npm run dev
\`\`\`

## 4. Orden de desarrollo recomendado

1. **Auth Components** (LoginModal, VerifyEmail, ResetPassword)
2. **Hero Component** (home page)
3. **CharacterForm** (el más complejo)
4. **CharacterViewer & Library**
5. **PublicGallery**
6. **Settings & Statistics**
7. **Export utilities**

## 5. Testing checklist

- [ ] Register new user
- [ ] Verify email
- [ ] Login
- [ ] Create character (not logged in) → save to localStorage
- [ ] Login → migrate characters
- [ ] Create character (logged in) → save to DB
- [ ] Edit character
- [ ] Delete character
- [ ] Export to PDF/JSON/CSV
- [ ] View public gallery
- [ ] Filter by class
- [ ] Change password
- [ ] View statistics

\`\`\`
```

## Notas Importantes

1. **Orden de Renders**: Header siempre visible, rutas cambian el contenido

2. **Estado Global** (Zustand):
   - useAuthStore: user, token, isAuthenticated
   - useCharacterStore: sessionCharacters (no logged in)
   - useUIStore: selectedSystem, selectedClass

3. **React Query** para:
   - Characters fetching
   - Class templates loading
   - Public gallery infinite scroll

4. **Tailwind Custom Classes**:
   ```css
   bg-primary-dark    → #0F2B3A
   bg-primary-light   → #F2EDE4
   bg-accent-gold     → #D9A441
   font-cinzel        → 'Cinzel', serif
   font-merriweather  → 'Merriweather', serif
   font-inconsolata   → 'Inconsolata', monospace
   ```

5. **Responsive Breakpoints**:
   - Mobile first design
   - Use Tailwind's sm:, md:, lg:, xl: prefixes

6. **Form Validation**:
   - React Hook Form para manejo
   - Zod para schemas
   - Display errors inline

7. **Loading States**:
   - Skeleton loaders para content
   - Spinners para botones
   - Toast notifications para success/error

¡Esta guía debe ayudarte a completar todos los componentes necesarios!
