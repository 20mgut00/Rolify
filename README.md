# ROLIFY — RPG Character Creator

Aplicación web fullstack para crear y gestionar fichas de personajes de juegos de rol de mesa (TTRPG). Actualmente soporta el sistema **Root RPG** de Magpie Games.

## Características

- Formulario interactivo guiado paso a paso para crear personajes de Root RPG
- Generación automática de fichas con IA (Google Gemini gemini-2.5-flash)
- Modo invitado: crea personajes sin registro, con migración a la nube al autenticarse
- Autenticación con email/contraseña (JWT + refresh tokens) y Google OAuth2
- Verificación de email y recuperación de contraseña por enlace
- Biblioteca personal con opciones de editar, eliminar y cambiar visibilidad (público/privado)
- Galería pública con filtros por clase e infinite scroll
- Exportación de fichas en PDF, JSON y CSV
- Subida de imagen de avatar personalizada
- Internacionalización completa: español e inglés (i18next)
- Modo oscuro persistente y opciones de accesibilidad (texto grande, reduced motion)
- Estadísticas de usuario
- Despliegue con Docker y docker-compose

## Stack tecnológico

### Backend
| Tecnología | Versión |
|---|---|
| Java | 21 |
| Spring Boot | 4.0.0 |
| Spring Security | 6 |
| Spring Data MongoDB | — |
| JJWT | 0.12.5 |
| Lombok | 1.18.38 |
| Maven | 3.9+ |

### Frontend
| Tecnología | Versión |
|---|---|
| React | 19 |
| TypeScript | 5.7.3 |
| Vite | 6 |
| Tailwind CSS | 4 |
| Material UI | 7 |
| Zustand | 5 |
| TanStack Query | 5 |
| React Router | 7 |
| React Hook Form + Zod | 7 + 3 |
| Framer Motion | 11 |
| i18next | 25 |
| Axios | 1.7 |
| jsPDF + html2canvas | — |
| Lucide React | — |

### Servicios externos
- **MongoDB Atlas** — base de datos en la nube
- **Google Gemini API** (gemini-2.5-flash) — generación de personajes con IA
- **Google Cloud** — OAuth2
- **Resend / Gmail / SendGrid** — envío de emails (configurable)

## Prerrequisitos

- Java 21+
- Maven 3.9+
- Node.js 20+ y npm 10+
- Docker y docker-compose (opcional, recomendado para producción)
- Cuenta en MongoDB Atlas
- API key de Google Gemini
- Credenciales de Google OAuth2 (Cloud Console)
- Cuenta en Resend, Gmail o SendGrid (para emails)

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd rpg-character-creator
```

### 2. Variables de entorno

Copia `.env.example` como `.env` en la raíz del proyecto y rellena los valores:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/
MONGODB_DATABASE=rpg-characters

# JWT
JWT_SECRET=your-256-bit-secret-key

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Gemini
GEMINI_API_KEY=your-gemini-api-key

# Email (ejemplo con Resend)
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USERNAME=resend
MAIL_PASSWORD=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com

# URLs
FRONTEND_URL=http://localhost:5173
```

### 3a. Desarrollo local

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
```
Disponible en `http://localhost:8080`

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Disponible en `http://localhost:5173`

El archivo `frontend/.env` solo necesita:
```env
VITE_API_URL=http://localhost:8080/api
```

### 3b. Docker (recomendado para producción)

```bash
# Producción
docker-compose up

# Desarrollo (con hot reload)
docker-compose -f docker-compose.dev.yml up
```

Los ClassTemplates de Root RPG se cargan automáticamente al arrancar si la base de datos está vacía.

## Configuración de servicios externos

### MongoDB Atlas
1. Crea un cluster gratuito en [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un usuario de base de datos y añade tu IP a la whitelist
3. Copia la connection string como `MONGODB_URI`

### Google Gemini
1. Accede a [Google AI Studio](https://aistudio.google.com)
2. Genera una API key y cópiala como `GEMINI_API_KEY`

### Google OAuth2
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto y habilita la API de Google+
3. Crea credenciales OAuth 2.0 (aplicación web)
4. Añade como URI de redirección autorizado: `http://localhost:8080/api/auth/oauth2/callback/google`
5. Copia `client-id` y `client-secret`

### Email
El proyecto soporta Resend, Gmail y SendGrid. Configura las variables `MAIL_*` según el proveedor. Ver `.env.example` para las tres opciones.

## Estructura del proyecto

```
rpg-character-creator/
├── backend/
│   └── src/main/java/com/rpgcharacter/
│       ├── config/          # Security, JWT, MongoDB, OAuth2, CORS
│       ├── controller/      # AuthController, CharacterController, AvatarController, ClassTemplateController
│       ├── dto/             # AuthDTO, CharacterDTO, GenerateCharacterDTO
│       ├── exception/       # GlobalExceptionHandler, BusinessException, ResourceNotFoundException
│       ├── mapper/          # CharacterMapper (CharacterDB ↔ Character)
│       ├── model/           # Character, User, ClassTemplate, VerificationToken
│       ├── repository/      # MongoDB repositories
│       ├── service/         # AuthService, CharacterService, GeminiService, EmailService
│       └── validator/       # CharacterValidator
├── frontend/src/
│   ├── components/
│   │   ├── auth/            # LoginModal, OAuthCallback, ResetPassword, VerifyEmail
│   │   ├── character/       # CharacterForm, CharacterCard, CharacterLibrary, CharacterViewer
│   │   ├── common/          # Button, Card, ConfirmModal, ErrorBoundary, ImageSelector
│   │   ├── gallery/         # PublicGallery
│   │   ├── root/            # Selectores Root RPG: clase, naturaleza, drives, moves, stats...
│   │   ├── settings/        # Settings, Statistics
│   │   ├── Header.tsx
│   │   └── Hero.tsx
│   ├── hooks/               # useCharacterForm, useDocumentTitle, useDragAndDrop...
│   ├── i18n/                # en.json, es.json
│   ├── locales/             # en.ts, es.ts
│   ├── services/api.ts      # Axios con interceptor de JWT refresh automático
│   ├── store/index.ts       # Zustand: useAuthStore, useCharacterStore, useUIStore, useAccessibilityStore
│   ├── types/index.ts       # Interfaces TypeScript
│   ├── utils/               # avatarUrl, characterMapper, export
│   └── theme.ts             # Tema MUI
├── docker-compose.yml
├── docker-compose.dev.yml
└── .env.example
```

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Landing page |
| `/create` | Formulario de creación de personaje |
| `/library` | Biblioteca personal de personajes |
| `/character/:id` | Visor de ficha de personaje |
| `/gallery` | Galería pública |
| `/settings` | Configuración y estadísticas |
| `/verify-email` | Verificación de email |
| `/reset-password` | Reseteo de contraseña |
| `/oauth/callback` | Callback de Google OAuth2 |

## API

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro con email |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Renovar JWT |
| POST | `/api/auth/verify-email` | Verificar email |
| POST | `/api/auth/forgot-password` | Solicitar reset |
| POST | `/api/auth/reset-password` | Cambiar contraseña con token |
| POST | `/api/auth/change-password` | Cambiar contraseña autenticado |
| DELETE | `/api/auth/delete-account` | Eliminar cuenta |
| GET | `/api/characters/my` | Personajes del usuario |
| GET | `/api/characters/public` | Galería pública (paginada) |
| POST | `/api/characters` | Crear personaje |
| PUT | `/api/characters/:id` | Actualizar personaje |
| DELETE | `/api/characters/:id` | Eliminar personaje |
| POST | `/api/characters/generate` | Generar personaje con IA |
| POST | `/api/avatars/upload` | Subir imagen de avatar |
| GET | `/api/class-templates` | Plantillas de clase de Root RPG |

## Modelo de datos principal

### Character
`id, userId, name, system, className, species, demeanor, details, avatarImage, stats (List<Stat>), background (List<BackgroundAnswer>), nature, drives, moves (List<SelectedOption>), connections (List<Connection>), weaponSkills, roguishFeats, equipment, reputation (Map<String, FactionReputation>), isPublic, createdAt, updatedAt`

### User
`id, email, password (BCrypt), name, avatarUrl, provider (LOCAL/GOOGLE), providerId, emailVerified, totalCharacters, publicCharacters, createdAt, updatedAt`

### ClassTemplate
`id, system, className, description, background (List<BackgroundQuestion>), nature, drives, moves, connections, weaponSkills, roguishFeats, stats, maxDrives, maxMoves, maxNature`

## Build para producción

```bash
# Backend
cd backend
./mvnw clean package
java -jar target/rpg-character-creator-*.jar

# Frontend
cd frontend
npm run build
# Archivos estáticos en dist/
```

## Notas de desarrollo

- El frontend maneja dos formatos de Character: `Character` (UI, con `SelectedOption[]`) y `CharacterDB` (MongoDB). La conversión se hace en `characterMapper.ts` con `fromCharacterDB` / `toCharacterDB`.
- El token JWT se renueva automáticamente mediante un interceptor de Axios en `services/api.ts`.
- El modo invitado guarda personajes en localStorage. Al autenticarse, se ofrece migración a la cuenta.
- Los estilos mezclan Tailwind CSS 4 (layout, componentes custom) con Material UI 7 (selectores, modales, grids).
- El estado global usa cuatro stores de Zustand con `persist` middleware selectivo.

## Autor

Miguel Gutiérrez Vázquez

## Licencia

MIT
