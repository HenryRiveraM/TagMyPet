# TagMyPet

TagMyPet es una plataforma para seguimiento veterinario, historial clínico digital, adopciones responsables, mascotas perdidas e identificación por collar NFC.

## Arquitectura

Frontend Angular 19 SPA con standalone components, Angular Router, Reactive Forms, guards de autenticación/roles e interceptor JWT.

Backend Node.js + Express con MongoDB Atlas mediante Mongoose, JWT, bcrypt, express-validator, sanitización, CORS, Helmet, rate limiting, manejo global de errores y Cloudinary para imágenes.

Flujo:

```text
Angular SPA -> Express REST API -> MongoDB Atlas
                         |
                    Cloudinary
```

## Estructura

```text
backend/
  src/config
  src/controllers
  src/middleware
  src/models
  src/routes
  src/seed
  src/validators
frontend/
  src/app/core
  src/app/pages
  src/environments
```

## Instalación

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm start
```

URLs locales:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:4000/api`
- Health check: `http://localhost:4000/api/health`

## Variables Backend

```bash
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/tagmypet
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:4200
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

## Roles

- `ADMIN`: gestiona usuarios, suspensión, métricas y moderación.
- `OWNER`: registra mascotas, historial, recordatorios, perdidos y adopciones.
- `VETERINARIO`: consulta mascotas autorizadas y actualiza historial médico.
- `ADOPTANTE`: solicita adopciones con cuestionario y firma digital.

## Seed

El seed crea:

- `admin@tagmypet.com`
- `owner@tagmypet.com`
- `vet@tagmypet.com`
- `adoptante@tagmypet.com`

Password para todos:

```text
Password123
```

También crea mascotas, perfil NFC, historial médico, recordatorios, reporte perdido, publicación de adopción, clínica veterinaria, autorización médica aprobada y tags NFC de inventario.

Perfil NFC de prueba:

```text
http://localhost:4200/pet/public/NFC-LUNA-001
```

## Endpoints Principales

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`
- `GET /api/auth/verify-email/:token`
- `POST /api/auth/resend-verification`

Mascotas:

- `GET /api/pets`
- `POST /api/pets`
- `GET /api/pets/:id`
- `PUT /api/pets/:id`
- `DELETE /api/pets/:id`
- `GET /api/pets/public/:nfcCode`

Historial:

- `GET /api/medical-records/pet/:petId`
- `POST /api/medical-records`
- `DELETE /api/medical-records/:id`

Recordatorios:

- `GET /api/reminders`
- `POST /api/reminders`
- `PATCH /api/reminders/:id/toggle`
- `POST /api/reminders/send-notifications`

Perdidos:

- `GET /api/lost?ciudad=La%20Paz`
- `POST /api/lost`
- `PATCH /api/lost/:id/found`

Adopciones:

- `GET /api/adoptions`
- `POST /api/adoptions`
- `POST /api/adoptions/:id/apply`
- `GET /api/adoptions/applications`

Admin:

- `GET /api/admin/stats`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/status`

Clínicas veterinarias:

- `GET /api/clinics`
- `POST /api/clinics`
- `PATCH /api/clinics/:id/status`
- `POST /api/clinics/:id/veterinarians`
- `GET /api/clinics/access/requests`
- `POST /api/clinics/access/requests`
- `PATCH /api/clinics/access/requests/:id`

Inventario NFC:

- `GET /api/tags`
- `GET /api/tags/export.csv`
- `POST /api/tags`
- `POST /api/tags/batch`
- `PATCH /api/tags/:code/assign`
- `PATCH /api/tags/:id/status`

## Seguridad Implementada

- JWT con expiración.
- Password hashing con bcrypt.
- Middleware `protect`.
- Middleware `allowRoles`.
- Validaciones con express-validator.
- Sanitización contra operadores MongoDB.
- Helmet.
- CORS configurable.
- Rate limiting básico.
- Manejo global de errores.
- Perfil NFC público sin email ni password ni datos privados.
- Límite freemium de 2 mascotas para `OWNER` con plan `FREE`.
- Autorizaciones médicas por mascota antes de que un veterinario escriba historial.
- Inventario NFC con estados: disponible, asignado, vendido, defectuoso y desactivado.

## Cloudinary

El backend permite crear mascotas sin foto aunque Cloudinary no esté configurado. Para subir imágenes reales necesitas una cuenta gratuita de Cloudinary y reemplazar:

```env
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=demo
CLOUDINARY_API_SECRET=demo
```

por tus credenciales reales. El health check muestra:

```json
{ "cloudinaryConfigured": true }
```

cuando la integración está activa.

Dónde encontrar tus datos en Cloudinary:

1. Entra a Cloudinary.
2. Abre el Dashboard.
3. Copia `Cloud name`, `API Key` y `API Secret`.
4. Pégalos en `backend/.env`.

Ejemplo:

```env
CLOUDINARY_CLOUD_NAME=mi-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=mi_api_secret
```

## Email, Verificación y Recordatorios

Para recuperación de password, verificación de email y recordatorios reales por correo configura SMTP:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
EMAIL_FROM=TagMyPet <tu-email@gmail.com>
```

Con Gmail necesitas una contraseña de aplicación, no tu contraseña normal. Si SMTP no está configurado, el backend no falla en desarrollo; solo registra que el email fue omitido.

Los recordatorios se envían automáticamente una vez al día al iniciar el backend y también pueden enviarse manualmente desde el dashboard admin.

## Deploy

Backend en Render:

1. Crear servicio web desde `backend/`.
2. Usar `npm install` como build command.
3. Usar `npm start` como start command.
4. Configurar variables del archivo `.env.example`.
5. Definir `FRONTEND_URL` con la URL real de Vercel o Netlify.
6. En MongoDB Atlas, mantener `Network Access` permitido para Render o usar `0.0.0.0/0` durante pruebas.
7. Verificar `https://tu-api.onrender.com/api/health`.

Frontend en Vercel:

1. Importar `frontend/`.
2. Build command: `npm run build`.
3. Output directory: `dist/tagmypet-frontend/browser`.
4. Actualizar `src/environments/environment.prod.ts` con la URL real de Render.
5. Después del deploy, actualizar `FRONTEND_URL` en Render con la URL real de Vercel.

Checklist de variables en Render:

```env
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://...
JWT_SECRET=un-secreto-largo
JWT_EXPIRES_IN=1d
FRONTEND_URL=https://tu-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Frontend en Netlify:

1. Importar `frontend/`.
2. El archivo `netlify.toml` ya define build y redirects SPA.

## Pruebas Manuales

1. Ejecutar seed.
2. Iniciar backend y frontend.
3. Login con `admin@tagmypet.com`.
4. Ver dashboard y panel admin.
5. Login con `owner@tagmypet.com`.
6. Crear mascota y abrir su perfil NFC.
7. Crear historial y recordatorios.
8. Publicar reporte perdido.
9. Login con `adoptante@tagmypet.com`.
10. Solicitar adopción con cuestionario y firma digital.
11. Login con `vet@tagmypet.com`.
12. Solicitar acceso médico con `NFC-LUNA-001` o revisar el acceso aprobado del seed.
13. Login con `admin@tagmypet.com` y abrir `Tags NFC` para crear lote y asignar tags.

## Guion de Demo Recomendado

1. Entrar como `owner@tagmypet.com`.
2. Crear una mascota con foto real desde `Mascotas`.
3. Entrar como `admin@tagmypet.com`.
4. Ir a `Tags NFC` y crear un tag manual, por ejemplo `TMP-LUCAS-001`.
5. Asignar `TMP-LUCAS-001` a la mascota creada.
6. Abrir el perfil público `/pet/public/TMP-LUCAS-001` desde el celular.
7. Mostrar que el perfil público no expone email ni datos sensibles.
8. Entrar como `vet@tagmypet.com`.
9. Ir a `Clínicas` y solicitar acceso usando el código NFC.
10. Volver como dueño y aprobar la solicitud.
11. Entrar como veterinario y registrar una vacuna o control.
12. Mostrar panel admin con usuarios, mascotas, clínicas y tags.

## Flujo NFC Físico

Para fabricar o probar un collar real:

1. Genera un código en `Tags NFC`, por ejemplo `TMP-LUCAS-001`.
2. Copia la URL pública: `https://tu-frontend.vercel.app/pet/public/TMP-LUCAS-001`.
3. Graba esa URL en el chip NFC con una app móvil como NFC Tools.
4. Escanea el chip con un teléfono.
5. El teléfono abrirá el perfil público de la mascota.
