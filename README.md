# Rolify — RPG Character Creator

A fullstack web application for creating and managing tabletop RPG character sheets. Currently supports the **Root RPG** system by Magpie Games with 8 playable classes: Arbiter, Harrier, Ranger, Ronin, Scoundrel, Thief, Tinker, and Vagrant.

## Features

- **Guided character creation** — step-by-step form with real-time checklist and welcome guide
- **AI generation** — generate full character sheets with Google Gemini (gemini-2.5-flash), with per-user and global rate limiting
- **Guest mode** — create characters without an account; they migrate to your profile on sign-up
- **Authentication** — email/password (JWT + refresh tokens) and Google OAuth2, with email verification and password recovery
- **Character library** — edit, duplicate, delete, toggle public/private visibility, sort and filter
- **Public gallery** — browse community characters with pagination, class/system filters, and a like system
- **Export/Import** — export character sheets to PDF, JSON, or CSV; import from JSON or CSV
- **Custom avatars** — upload your own or use class-specific defaults
- **Internationalization** — full English and Spanish support, auto-detected from browser language
- **Accessibility** — persistent dark mode, large text option, reduced motion
- **User statistics** — character counts, public characters, and more

## Tech Stack

### Backend

| Technology | Version |
|---|---|
| Java | 21 |
| Spring Boot | 4.0.0 |
| Spring Security + OAuth2 | 6 |
| Spring Data MongoDB | — |
| JJWT | 0.12.5 |
| Lombok | 1.18.38 |
| ModelMapper | 3.2.0 |

### Frontend

| Technology | Version |
|---|---|
| React | 19 |
| TypeScript | 5.7 |
| Vite | 6 |
| Tailwind CSS | 4 |
| Material UI (MUI) | 7 |
| Zustand | 5 |
| TanStack React Query | 5 |
| React Router | 7 |
| React Hook Form + Zod | 7 + 3 |
| Framer Motion | 11 |
| i18next | 25 |
| Vitest | 4 |

### External Services

- **MongoDB Atlas** — cloud database
- **Google Gemini API** — AI character generation
- **Google Cloud** — OAuth2 authentication
- **Resend / Gmail / SendGrid** — transactional email (configurable)

## Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 20+ and npm 10+
- MongoDB Atlas account (or local MongoDB 7.0+)
- Google Gemini API key
- Google OAuth2 credentials (Cloud Console)
- SMTP provider for emails (Resend, Gmail, or SendGrid)
- Docker and Docker Compose (optional, for containerized deployment)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/rpg-character-creator.git
cd rpg-character-creator
```

### 2. Configure environment variables

Copy `.env.example` to `.env` at the project root and fill in your values:

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

# Email (example with Resend)
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USERNAME=resend
MAIL_PASSWORD=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com

# URLs
FRONTEND_URL=http://localhost:5173
```

### 3a. Local development

**Backend:**
```bash
cd backend
mvn spring-boot:run
```
Runs on `http://localhost:8080`

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`

The frontend needs a single env var in `frontend/.env`:
```env
VITE_API_URL=http://localhost:8080/api
```

### 3b. Docker

```bash
# Production
docker-compose up

# Development (with hot reload + remote debug on port 8000)
docker-compose -f docker-compose.dev.yml up
```

The Root RPG class templates are automatically seeded from `class-templates.json` on first startup if the database is empty.

## Project Structure

```
rpg-character-creator/
├── backend/
│   └── src/main/java/com/rpgcharacter/
│       ├── config/          # Security, JWT, MongoDB, OAuth2, CORS, ObjectMapper
│       ├── controller/      # Auth, Character, Avatar, ClassTemplate
│       ├── dto/             # Auth, Character, GenerateCharacter DTOs
│       ├── exception/       # Global handler, Business, ResourceNotFound,
│       │                    # RateLimitExceeded, Unauthorized, Validation
│       ├── mapper/          # CharacterMapper
│       ├── model/           # Character, User, ClassTemplate, VerificationToken
│       ├── repository/      # MongoDB repositories
│       ├── service/         # Auth, Character, Gemini, Email, RateLimit,
│       │                    # CustomOAuth2User, CustomUserDetails
│       └── validator/       # CharacterValidator
├── frontend/src/
│   ├── components/
│   │   ├── auth/            # LoginModal, OAuthCallback, ResetPassword, VerifyEmail
│   │   ├── character/       # Form, Card, Library, Viewer, BasicInfo,
│   │   │                    # FormFields, FormHeader, Checklist, WelcomeGuide
│   │   ├── common/          # Button, Card, ConfirmModal, ErrorBoundary,
│   │   │                    # FilterSelect, ImageSelector, RangeSlider
│   │   ├── gallery/         # PublicGallery (infinite scroll)
│   │   ├── root/            # Root RPG selectors: Class, Nature, Drive,
│   │   │                    # Moves, Attributes, Background, Connections,
│   │   │                    # Reputation, RoguishFeats, WeaponSkills
│   │   └── settings/        # Settings, Statistics
│   ├── hooks/               # useCharacterForm, useChecklistSteps, useDebounce,
│   │                        # useDocumentTitle, useDragAndDrop
│   ├── locales/             # en.ts, es.ts
│   ├── services/api.ts      # Axios with JWT auto-refresh interceptor
│   ├── store/index.ts       # Zustand: Auth, Character, UI, Accessibility
│   ├── types/index.ts       # TypeScript interfaces
│   └── utils/               # avatarUrl, characterMapper, export
├── docker-compose.yml       # Production
├── docker-compose.dev.yml   # Development (hot reload + debug)
└── .env.example
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with email |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh JWT |
| POST | `/api/auth/verify-email` | Verify email address |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/change-password` | Change password (authenticated) |
| DELETE | `/api/auth/delete-account` | Delete account |

### Characters

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/characters` | Create character |
| PUT | `/api/characters/{id}` | Update character |
| DELETE | `/api/characters/{id}` | Delete character |
| GET | `/api/characters/{id}` | Get character by ID |
| GET | `/api/characters/my` | Get current user's characters |
| GET | `/api/characters/public` | Public gallery (paginated, filterable by `system` and `className`) |
| POST | `/api/characters/{id}/like` | Toggle like |
| POST | `/api/characters/generate` | Generate character with AI |

### Other

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/avatars/upload` | Upload avatar image |
| GET | `/api/class-templates` | Get all class templates |
| GET | `/api/class-templates/systems/{system}` | Get templates by system |

## Frontend Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/create` | Character creation form |
| `/library` | Personal character library |
| `/character/:id` | Character sheet viewer |
| `/gallery` | Public gallery |
| `/settings` | User settings |
| `/statistics` | User statistics |
| `/verify-email` | Email verification |
| `/reset-password` | Password reset |
| `/oauth/callback` | Google OAuth2 callback |

## AI Rate Limiting

Character generation via Gemini is rate-limited to prevent abuse:

- **Per user:** 3 generations/day (configurable via `app.rate-limit.user-daily-limit`)
- **Global:** 18 generations/day (configurable via `app.rate-limit.global-daily-limit`)
- Counters reset automatically at midnight via `@Scheduled` cron
- Exceeding the limit returns HTTP 429

## External Service Setup

<details>
<summary><strong>MongoDB Atlas</strong></summary>

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user and add your IP to the access list
3. Copy the connection string as `MONGODB_URI`
</details>

<details>
<summary><strong>Google Gemini</strong></summary>

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Generate an API key and set it as `GEMINI_API_KEY`
</details>

<details>
<summary><strong>Google OAuth2</strong></summary>

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable the Google+ API
3. Create OAuth 2.0 credentials (web application)
4. Add `http://localhost:8080/api/auth/oauth2/callback/google` as an authorized redirect URI
5. Copy `client-id` and `client-secret`
</details>

<details>
<summary><strong>Email (SMTP)</strong></summary>

The project supports Resend, Gmail, and SendGrid. Configure the `MAIL_*` variables in `.env` according to your provider. See `.env.example` for all three options.
</details>

## Building for Production

```bash
# Backend
cd backend
mvn clean package
java -jar target/rpg-character-creator-*.jar

# Frontend
cd frontend
npm run build
# Static files output to dist/
```

## Testing

```bash
# Frontend unit tests
cd frontend
npm test

# Frontend tests with coverage
npm run test:coverage

# Backend tests with coverage
cd backend
mvn test
```

## Author

Miguel Gutierrez Vazquez

## License

MIT
