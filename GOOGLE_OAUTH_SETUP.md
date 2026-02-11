# 🔐 Configuración de Google OAuth

Esta guía te ayudará a configurar el inicio de sesión con Google OAuth2.

---

## ✅ Lo que ya está implementado

- ✅ Backend OAuth2 con Spring Security
- ✅ Manejo de usuarios de Google (creación y actualización automática)
- ✅ Generación de JWT después del login de Google
- ✅ Página de callback en frontend
- ✅ Botón de "Sign in with Google" en el modal de login

**Solo necesitas configurar las credenciales en Google Cloud Console.**

---

## 🚀 Configuración de Google Cloud Console

### Paso 1: Crear un proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz click en el dropdown del proyecto (arriba a la izquierda)
3. Click en "New Project"
4. Nombre del proyecto: `RPG Character Creator` (o el que prefieras)
5. Click en "Create"

### Paso 2: Configurar la pantalla de consentimiento OAuth

1. En el menú lateral, ve a **"APIs & Services" → "OAuth consent screen"**
2. Selecciona **"External"** (para desarrollo) y click en "Create"
3. Completa la información:
   - **App name**: `RPG Character Creator`
   - **User support email**: Tu email
   - **Developer contact information**: Tu email
4. Click en "Save and Continue"
5. En "Scopes", click en "Add or Remove Scopes" y selecciona:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
6. Click en "Update" y luego "Save and Continue"
7. En "Test users", añade tu email de prueba
8. Click en "Save and Continue"

### Paso 3: Crear credenciales OAuth 2.0

1. En el menú lateral, ve a **"APIs & Services" → "Credentials"**
2. Click en **"Create Credentials" → "OAuth client ID"**
3. Selecciona **"Web application"**
4. Configura:
   - **Name**: `RPG Character Creator Web Client`
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5173
     http://localhost:8080
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:8080/login/oauth2/code/google
     ```
5. Click en "Create"
6. **IMPORTANTE**: Copia el **Client ID** y **Client Secret** que aparecen

### Paso 4: Actualizar tu archivo `.env`

Edita tu `.env` y actualiza estas líneas con las credenciales que copiaste:

```env
GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu_client_secret_aqui
```

---

## 🧪 Probar el login con Google

### 1. Reconstruir y reiniciar los contenedores

```bash
docker-compose down
docker-compose up --build
```

### 2. Probar en el navegador

1. Ve a [http://localhost:5173](http://localhost:5173)
2. Click en "Login" (arriba a la derecha)
3. Click en el botón **"Sign in with Google"**
4. Serás redirigido a Google para autenticarte
5. Selecciona tu cuenta de Google
6. Autoriza la aplicación
7. Serás redirigido de vuelta a tu aplicación, ¡ya logueado!

---

## 🔍 Troubleshooting

### ❌ Error 403: access_denied

**Causa**: El redirect URI no está configurado correctamente.

**Solución**:
1. Verifica que en Google Cloud Console, en "Authorized redirect URIs" tengas exactamente:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```
2. Asegúrate de que no haya espacios ni caracteres extra
3. Guarda los cambios y espera 1-2 minutos (puede tardar en propagarse)

### ❌ Error: "redirect_uri_mismatch"

**Causa**: El URI de redirect no coincide con el configurado.

**Solución**:
1. Revisa los logs del backend:
   ```bash
   docker logs rpg-backend -f
   ```
2. Verifica que el redirect URI que se está usando sea exactamente:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```
3. Si es diferente, actualiza Google Cloud Console con el URI correcto

### ❌ "Invalid client" o "unauthorized_client"

**Causa**: Client ID o Client Secret incorrectos.

**Solución**:
1. Ve a Google Cloud Console → Credentials
2. Verifica que copiaste correctamente el Client ID y Secret
3. Actualiza tu `.env` con los valores correctos
4. Reinicia los contenedores:
   ```bash
   docker-compose restart backend
   ```

### ❌ El usuario se crea pero no se redirige al frontend

**Causa**: FRONTEND_URL no está configurado correctamente.

**Solución**:
1. Verifica que en tu `.env` tengas:
   ```env
   FRONTEND_URL=http://localhost:5173
   ```
2. Reinicia los contenedores

### ❌ "This app is blocked"

**Causa**: La app aún no está verificada por Google.

**Solución**:
1. En desarrollo, esto es normal
2. Click en "Advanced" → "Go to RPG Character Creator (unsafe)"
3. Para producción, necesitarás verificar la app en Google Cloud Console

---

## 🌐 Configuración para Producción

Cuando despliegues a producción:

### 1. Actualizar Authorized JavaScript origins

Añade tu dominio de producción:
```
https://tuapp.com
```

### 2. Actualizar Authorized redirect URIs

Añade:
```
https://tuapp.com/login/oauth2/code/google
```

### 3. Actualizar variables de entorno

En tu servidor de producción:
```env
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
FRONTEND_URL=https://tuapp.com
```

### 4. Cambiar a "Publishing status: In production"

1. Ve a "OAuth consent screen"
2. Click en "Publish App"
3. Somete la aplicación para verificación (si es necesario)

---

## 🔐 Seguridad

⚠️ **IMPORTANTE**:

- ✅ Nunca subas tu `.env` a Git (ya está en `.gitignore`)
- ✅ No compartas tu Client Secret
- ✅ En producción, usa HTTPS siempre
- ✅ Mantén tus credenciales seguras
- ✅ Revoca y regenera credenciales si crees que fueron comprometidas

---

## 📝 Cómo funciona el flujo OAuth

1. Usuario click en "Sign in with Google"
2. Frontend redirige a: `http://localhost:8080/oauth2/authorization/google`
3. Backend redirige a Google para autenticación
4. Usuario se autentica en Google
5. Google redirige a: `http://localhost:8080/login/oauth2/code/google`
6. Backend procesa el código de Google:
   - Obtiene info del usuario (email, nombre, foto)
   - Crea o actualiza usuario en MongoDB
   - Genera JWT tokens
7. Backend redirige a: `http://localhost:5173/oauth/callback?token=xxx&refreshToken=yyy`
8. Frontend captura los tokens y guarda en el store
9. Usuario queda logueado ✅

---

## 🆘 ¿Necesitas ayuda?

Si tienes problemas:

1. Revisa los logs del backend: `docker logs rpg-backend -f`
2. Revisa la consola del navegador (F12)
3. Verifica que todos los URIs estén configurados correctamente
4. Asegúrate de que las variables de entorno sean correctas
5. Espera 1-2 minutos después de cambiar configuración en Google Cloud Console

---

## 📚 Referencias

- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Spring Security OAuth2](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/core.html)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**¡Listo! Una vez configurado, podrás iniciar sesión con Google. 🚀**
