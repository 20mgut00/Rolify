# RPG Character Creator

Una aplicación web moderna para la creación y gestión de personajes de juegos de rol de mesa, comenzando con el sistema Root RPG.

## 🎯 Características

- ✨ Creación de personajes con validación en tiempo real
- 🔐 Autenticación completa (Email/Password + Google OAuth)
- 📧 Verificación de email y recuperación de contraseña
- 💾 Almacenamiento persistente con MongoDB Atlas
- 🎨 Interfaz moderna con Tailwind CSS v4
- 📱 Diseño responsive
- 📄 Exportación de personajes (PDF, JSON, CSV)
- 🌐 Galería pública de personajes
- 👤 Biblioteca personal de personajes
- 📊 Estadísticas del usuario

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: Spring Boot 4.0.0
- **Lenguaje**: Java 21
- **Base de datos**: MongoDB Atlas
- **Seguridad**: Spring Security 6 + JWT
- **OAuth**: Google OAuth2
- **Email**: Spring Mail + Resend
- **Build**: Maven

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 6
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS v4
- **Routing**: React Router v7
- **Estado**: Zustand + React Query
- **Formularios**: React Hook Form + Zod
- **Animaciones**: Framer Motion
- **PDF**: jsPDF + html2canvas

## 📋 Prerrequisitos

- Java 21+
- Node.js 20+
- MongoDB Atlas account
- Maven 3.9+
- npm o yarn

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd rpg-character-creator
```

### 2. Configurar Backend

```bash
cd backend
```

Editar `src/main/resources/application.yml`:

```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://<user>:<password>@<cluster>.mongodb.net/rpg-characters
      database: rpg-characters
  
  mail:
    host: smtp.resend.com
    port: 587
    username: resend
    password: <your-resend-api-key>
  
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: <your-google-client-id>
            client-secret: <your-google-client-secret>

app:
  jwt:
    secret: <your-256-bit-secret>
  cors:
    allowed-origins: http://localhost:5173
  frontend:
    url: http://localhost:5173
  email:
    from: noreply@yourapp.com
```

Instalar dependencias y ejecutar:

```bash
mvn clean install
mvn spring-boot:run
```

El backend estará disponible en `http://localhost:8080`

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

Crear archivo `.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

Ejecutar en desarrollo:

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
rpg-character-creator/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/rpgcharacter/
│   │   │   │   ├── config/          # Configuraciones
│   │   │   │   ├── controller/      # REST Controllers
│   │   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── exception/       # Manejo de excepciones
│   │   │   │   ├── model/           # Entidades MongoDB
│   │   │   │   ├── repository/      # Repositorios
│   │   │   │   └── service/         # Lógica de negocio
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   └── pom.xml
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/              # Login, Register, etc.
    │   │   ├── character/         # Character form, viewer
    │   │   ├── gallery/           # Public gallery
    │   │   └── settings/          # User settings
    │   ├── services/              # API calls
    │   ├── store/                 # Zustand stores
    │   ├── types/                 # TypeScript types
    │   ├── utils/                 # Utilities
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

## 🎮 Uso

### Crear un Personaje

1. Selecciona el sistema de juego en el header (actualmente solo Root)
2. Haz clic en "New Character"
3. Completa el formulario con la información del personaje:
   - Información básica (nombre, especie, etc.)
   - Stats (Charm, Cunning, Finesse, Luck, Might)
   - Background
   - Drives (máximo 2)
   - Nature (máximo 2)
   - Moves (máximo 3)
   - Weapon Skills
   - Roguish Feats
   - Equipment
4. Marca como público si deseas compartirlo
5. Guarda el personaje

### Gestionar Personajes

- **Biblioteca**: Ve tus personajes creados
- **Editar**: Modifica los detalles de un personaje existente
- **Eliminar**: Borra personajes no deseados
- **Exportar**: Descarga en PDF, JSON o CSV

### Galería Pública

- Explora personajes públicos de otros usuarios
- Filtra por clase
- Scroll infinito

## 🔒 Autenticación

### Registro con Email

1. Haz clic en "Login" en el header
2. Selecciona "Register"
3. Completa nombre, email y contraseña
4. Verifica tu email (link enviado)

### Login con Google

1. Haz clic en "Login with Google"
2. Autoriza la aplicación
3. Automáticamente iniciado sesión

### Recuperar Contraseña

1. Haz clic en "Forgot Password"
2. Ingresa tu email
3. Sigue el link recibido por correo
4. Establece nueva contraseña

## 🗄️ Base de Datos

### Colecciones MongoDB

#### users
```json
{
  "_id": "ObjectId",
  "email": "string",
  "password": "string (hashed)",
  "name": "string",
  "avatarUrl": "string",
  "provider": "LOCAL | GOOGLE",
  "providerId": "string",
  "emailVerified": "boolean",
  "enabled": "boolean",
  "totalCharacters": "number",
  "publicCharacters": "number",
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

#### characters
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "name": "string",
  "system": "string",
  "className": "string",
  "species": "string",
  "demeanor": "string",
  "details": "string",
  "avatarImage": "string (base64)",
  "stats": [...],
  "background": [...],
  "drives": [...],
  "nature": [...],
  "moves": [...],
  "connections": [...],
  "weaponSkills": {...},
  "roguishFeats": {...},
  "equipment": {...},
  "reputation": {...},
  "isPublic": "boolean",
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

#### class_templates
```json
{
  "_id": "ObjectId",
  "system": "Root",
  "className": "Adventurer",
  "description": "string",
  "background": [...],
  "nature": [...],
  "drives": [...],
  "moves": [...],
  "weaponSkills": {...},
  "roguishFeats": {...},
  "stats": [...],
  "maxDrives": 2,
  "maxMoves": 3,
  "maxNature": 2
}
```

## 🔧 Configuración de Servicios

### MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Crea un usuario de base de datos
4. Añade tu IP a la whitelist
5. Obtén la connection string
6. Actualiza `application.yml`

### Resend (Email)

1. Regístrate en [Resend](https://resend.com)
2. Obtén tu API key
3. Verifica tu dominio (opcional para producción)
4. Actualiza `application.yml`

### Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Configura URLs de redirect: `http://localhost:8080/api/auth/oauth2/callback/google`
6. Actualiza `application.yml`

## 📦 Build para Producción

### Backend

```bash
cd backend
mvn clean package
java -jar target/rpg-character-creator-1.0.0.jar
```

### Frontend

```bash
cd frontend
npm run build
```

Los archivos estáticos estarán en `dist/`

## 🚢 Deployment

### Backend Options
- Railway
- Render
- Heroku
- AWS Elastic Beanstalk

### Frontend Options
- Vercel (recomendado)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 🧪 Testing

### Backend
```bash
cd backend
mvn test
```

### Frontend
```bash
cd frontend
npm test
```

## 📝 Variables de Entorno

### Backend (application.yml)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret para JWT tokens
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth secret
- `MAIL_PASSWORD`: Resend API key

### Frontend (.env)
- `VITE_API_URL`: URL del backend API

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 👥 Autores

- Tu Nombre - Desarrollo inicial

## 🙏 Agradecimientos

- Root RPG por Leder Games
- Comunidad de desarrolladores

## 📞 Soporte

Para soporte, abre un issue en GitHub o contacta via email.
