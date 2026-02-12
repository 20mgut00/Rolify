# Docker Setup Guide

## 🔥 Modo Desarrollo (con Hot Reload)

**Para desarrollo diario usa este comando:**

```bash
# Primera vez o cuando cambias dependencias
docker compose -f docker-compose.dev.yml up --build

# ✅ Resto de veces (NO necesitas --build)
docker compose -f docker-compose.dev.yml up
```

### ¿Qué hace el hot reload?
- **Frontend**: Cambios en `.tsx`, `.ts`, `.css` → recarga automática en el navegador
- **Backend**: Cambios en `.java` → recompilación automática con Spring DevTools
- **Sin rebuild**: Solo necesitas `--build` cuando cambias dependencias

### Acceso en desarrollo:
- 🌐 Frontend: http://localhost:5173
- 🔧 Backend API: http://localhost:8080/api
- 🐛 Debug remoto: puerto 5005

---

## 📦 Modo Producción

Para despliegue (sin hot reload, optimizado):

```bash
docker compose up --build
```

---

## ⚡ Comandos Rápidos

### Iniciar proyecto
```bash
# Desarrollo con hot reload
docker compose -f docker-compose.dev.yml up

# Producción
docker compose up
```

### Ver logs
```bash
# Todos los servicios
docker compose -f docker-compose.dev.yml logs -f

# Solo un servicio
docker compose -f docker-compose.dev.yml logs -f frontend
docker compose -f docker-compose.dev.yml logs -f backend
```

### Reiniciar un servicio
```bash
docker compose -f docker-compose.dev.yml restart frontend
docker compose -f docker-compose.dev.yml restart backend
```

### Detener todo
```bash
docker compose -f docker-compose.dev.yml down

# Detener y borrar volúmenes
docker compose -f docker-compose.dev.yml down -v
```

---

## ❓ Cuándo usar `--build`

### ✅ SÍ necesitas `--build`:
- Primera vez que levantas el proyecto
- Cambias `package.json` o `pom.xml`
- Instalas nuevas dependencias npm o Maven
- Modificas los Dockerfile

### ❌ NO necesitas `--build`:
- Cambias archivos `.tsx`, `.ts`, `.java`, `.css`
- Editas componentes React
- Modificas controladores Spring
- **Cualquier cambio de código fuente** 🎉

---

## 🔧 Troubleshooting

### Los cambios no se reflejan

**Frontend:**
```bash
# Verifica volúmenes
docker compose -f docker-compose.dev.yml exec frontend ls -la /app/src

# Reinicia
docker compose -f docker-compose.dev.yml restart frontend
```

**Backend:**
```bash
# Verifica Spring DevTools
docker compose -f docker-compose.dev.yml logs backend | grep -i devtools

# Reinicia
docker compose -f docker-compose.dev.yml restart backend
```

### Puerto ya en uso
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

### Limpiar todo si algo falla
```bash
# Detener y limpiar
docker compose -f docker-compose.dev.yml down -v

# Limpiar imágenes no usadas
docker image prune -f

# Rebuild completo
docker compose -f docker-compose.dev.yml up --build
```

---

## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=rpg-characters

# JWT
JWT_SECRET=tu-secreto-de-256-bits

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret

# Email Resend
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@tudominio.com

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## 💡 Tips

1. **Usa siempre `docker-compose.dev.yml` en desarrollo** para aprovechar hot reload
2. **NO necesitas reiniciar** cuando cambias código fuente
3. **Solo usa `--build`** cuando cambias dependencias
4. **Revisa los logs** si algo no funciona: `docker compose -f docker-compose.dev.yml logs -f`
