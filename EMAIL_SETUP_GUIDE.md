# 📧 Guía de Configuración de Email

Esta guía te ayudará a configurar el envío de correos electrónicos para la verificación de cuentas y recuperación de contraseñas.

---

## ✅ Lo que ya está implementado

- ✅ Servicio de email con plantillas HTML profesionales
- ✅ Envío automático de correo de verificación al registrarse
- ✅ Envío de correo para recuperación de contraseña
- ✅ Manejo de errores y reintentos
- ✅ Envíos asíncronos (no bloquean la respuesta)

**Solo necesitas configurar las credenciales del servicio SMTP.**

---

## 🚀 Configuración Rápida

### Paso 1: Crea el archivo `.env`

En la raíz del proyecto, copia el archivo de ejemplo:

```bash
cp .env.example .env
```

### Paso 2: Elige tu servicio de email

Edita el archivo `.env` con tus credenciales.

---

## 📮 Opción 1: Resend (Recomendado)

**Ventajas:**
- ✅ Fácil de configurar
- ✅ 100 emails gratis al día
- ✅ Excelente deliverability
- ✅ API moderna y simple

### Configuración:

1. **Regístrate en Resend:**
   - Ve a [resend.com/signup](https://resend.com/signup)
   - Crea una cuenta gratuita

2. **Obtén tu API Key:**
   - En el dashboard, ve a "API Keys"
   - Click en "Create API Key"
   - Copia la API key (empieza con `re_...`)

3. **Verifica tu dominio (Opcional):**
   - Para producción: Agrega tu dominio y verifica los registros DNS
   - Para desarrollo: Usa el dominio de prueba `onboarding@resend.dev`

4. **Edita tu archivo `.env`:**

```env
MAIL_HOST=smtp.resend.com
MAIL_PORT=587
MAIL_USERNAME=resend
MAIL_PASSWORD=re_tu_api_key_aqui
EMAIL_FROM=noreply@tudominio.com  # O usa onboarding@resend.dev para pruebas
FRONTEND_URL=http://localhost:5173
```

---

## 📮 Opción 2: Gmail

**Ventajas:**
- ✅ Gratis
- ✅ Ya tienes una cuenta
- ✅ Familiar

**Desventajas:**
- ⚠️ Límite de 500 emails por día
- ⚠️ Puede ser marcado como spam si envías muchos

### Configuración:

1. **Habilita verificación en 2 pasos:**
   - Ve a [myaccount.google.com/security](https://myaccount.google.com/security)
   - Activa "Verificación en 2 pasos"

2. **Crea una contraseña de aplicación:**
   - Ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Selecciona "Correo" y tu dispositivo
   - Copia la contraseña de 16 caracteres generada

3. **Edita tu archivo `.env`:**

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_contraseña_de_aplicacion_aqui
EMAIL_FROM=tu_email@gmail.com
FRONTEND_URL=http://localhost:5173
```

---

## 📮 Opción 3: SendGrid

**Ventajas:**
- ✅ 100 emails gratis al día
- ✅ Muy confiable
- ✅ Analytics incluidos

### Configuración:

1. **Regístrate en SendGrid:**
   - Ve a [signup.sendgrid.com](https://signup.sendgrid.com/)
   - Crea una cuenta gratuita

2. **Crea una API Key:**
   - Ve a "Settings" → "API Keys"
   - Click en "Create API Key"
   - Dale permisos de "Full Access" o "Mail Send"
   - Copia la API key

3. **Verifica tu dominio o email:**
   - Ve a "Settings" → "Sender Authentication"
   - Verifica tu dominio o un email individual

4. **Edita tu archivo `.env`:**

```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=tu_sendgrid_api_key_aqui
EMAIL_FROM=noreply@tudominio.com  # Debe estar verificado
FRONTEND_URL=http://localhost:5173
```

---

## 📮 Opción 4: Mailgun

**Ventajas:**
- ✅ 5,000 emails gratis al mes (primeros 3 meses)
- ✅ Muy potente
- ✅ Buena documentación

### Configuración:

1. **Regístrate en Mailgun:**
   - Ve a [signup.mailgun.com](https://signup.mailgun.com/)

2. **Obtén tus credenciales SMTP:**
   - Ve a "Sending" → "Domain Settings" → "SMTP credentials"
   - Copia el username y password

3. **Edita tu archivo `.env`:**

```env
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=tu_username@tudominio.com
MAIL_PASSWORD=tu_password_aqui
EMAIL_FROM=noreply@tudominio.com
FRONTEND_URL=http://localhost:5173
```

---

## 🐳 Ejecutar con Docker

Una vez configurado tu `.env`, ejecuta:

```bash
docker-compose up --build
```

Las variables de entorno se cargarán automáticamente desde el archivo `.env`.

---

## 🧪 Probar el envío de emails

### 1. Registra un nuevo usuario

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "tu_email@gmail.com",
    "password": "password123"
  }'
```

### 2. Revisa el log del backend

```bash
docker logs rpg-backend -f
```

Deberías ver:
```
Verification email sent successfully to: tu_email@gmail.com
```

### 3. Revisa tu bandeja de entrada

Busca el correo de verificación. Si no lo ves:
- ✅ Revisa la carpeta de spam
- ✅ Verifica que el EMAIL_FROM esté correcto
- ✅ Revisa los logs del backend para errores

---

## 🔍 Troubleshooting

### ❌ "Failed to send verification email"

**Posibles causas:**

1. **Credenciales incorrectas:**
   - Verifica que MAIL_PASSWORD sea correcto
   - Para Gmail, asegúrate de usar la contraseña de aplicación, no tu contraseña normal

2. **Puerto bloqueado:**
   - Algunos ISPs bloquean el puerto 587
   - Intenta con el puerto 465 (SSL):
     ```env
     MAIL_PORT=465
     ```
   - Y actualiza application.yml para usar SSL en lugar de STARTTLS

3. **EMAIL_FROM no verificado:**
   - En Resend/SendGrid/Mailgun, el dominio del EMAIL_FROM debe estar verificado
   - Para pruebas, usa el email de prueba que te proporcionan

4. **Límite de rate:**
   - Gmail: máximo 500 emails/día
   - Resend gratis: 100 emails/día
   - SendGrid gratis: 100 emails/día

### ❌ "Authentication failed"

- Verifica que MAIL_USERNAME y MAIL_PASSWORD sean correctos
- Para Gmail, activa "Acceso de aplicaciones menos seguras" (no recomendado) O usa contraseña de aplicación
- Para Resend/SendGrid, el username suele ser "apikey" o "resend"

### ❌ Los emails van a spam

- Verifica tu dominio con SPF, DKIM y DMARC
- Usa un servicio profesional (Resend, SendGrid) en lugar de Gmail
- No uses palabras como "test", "gratis", "oferta" en el asunto

---

## 📝 Verificar configuración actual

Para ver qué configuración está usando tu backend:

```bash
docker logs rpg-backend | grep -i mail
```

O revisa directamente el archivo:

```bash
cat backend/src/main/resources/application.yml | grep -A 10 "mail:"
```

---

## 🎯 Resultado esperado

Una vez configurado correctamente:

1. ✅ Al registrarse, el usuario recibe un email de verificación
2. ✅ El email contiene un link para verificar la cuenta
3. ✅ Al hacer click, la cuenta se verifica correctamente
4. ✅ Al solicitar reset de password, recibe un email con el link
5. ✅ Los logs del backend muestran "Email sent successfully"

---

## 🔐 Seguridad

⚠️ **IMPORTANTE:**

- ✅ Nunca subas el archivo `.env` a Git (ya está en .gitignore)
- ✅ Usa contraseñas de aplicación, no tu contraseña personal
- ✅ Rota tus API keys periódicamente
- ✅ En producción, usa variables de entorno del servidor (Railway, Render, Heroku, etc.)
- ✅ Limita los permisos de tus API keys al mínimo necesario (solo "Mail Send")

---

## 🆘 ¿Necesitas ayuda?

Si tienes problemas:

1. Revisa los logs del backend: `docker logs rpg-backend -f`
2. Verifica que todas las variables de entorno estén configuradas
3. Prueba con un servicio diferente (Resend es el más fácil)
4. Asegúrate de que tu firewall no bloquee el puerto 587

---

## 📚 Referencias

- [Resend Docs](https://resend.com/docs)
- [SendGrid SMTP](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Spring Boot Mail](https://docs.spring.io/spring-boot/docs/current/reference/html/io.html#io.email)

---

**¡Listo! Una vez configurado, los correos se enviarán automáticamente. 🚀**
