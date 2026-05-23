# TagMyPet

TagMyPet es una plataforma para seguimiento veterinario, historial clínico digital, adopciones responsables, mascotas perdidas e identificación por collar NFC.

## Arquitectura

Frontend Angular 19 SPA con standalone components, Angular Router, Reactive Forms, guards de autenticación/roles e interceptor JWT.

Backend Node.js + Express con MongoDB Atlas mediante Mongoose, JWT, bcrypt, express-validator, sanitización, CORS, Helmet, rate limiting, manejo global de errores y Cloudinary para imágenes.

Flujo:

```text
Angular SPA -> Express REST API -> MongoDB Atlas
                         |
                    Cloudinary + SMTP
```

## Producción

- Frontend: `https://tagmypet.vercel.app`
- Backend: `https://tagmypet-api.onrender.com`
- Health check: `https://tagmypet-api.onrender.com/api/health`

El frontend usa hash routing para compatibilidad SPA y auditoría de links:

```text
https://tagmypet.vercel.app/#/login
https://tagmypet.vercel.app/#/pet/public/NFC-LUNA-001
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
MONGO_URI=mongodb+srv://<DB_USER>:<DB_PASSWORD>@<CLUSTER_HOST>/tagmypet
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:4200
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM=TagMyPet <no-reply@tagmypet.com>
```

## Roles

- `ADMIN`: gestiona usuarios, suspensión, métricas y moderación.
- `OWNER`: registra mascotas, historial, recordatorios, perdidos, adopciones y aprueba accesos médicos.
- `VETERINARIO`: registra/solicita clínica oficial, pide acceso médico con código NFC y actualiza historial autorizado.

El registro público solo permite cuentas `OWNER` o `VETERINARIO`. Las cuentas `ADMIN` se crean de forma controlada mediante seed o administración de la plataforma.

## Seed

El seed crea:

- `admin@tagmypet.com`
- `owner@tagmypet.com`
- `vet@tagmypet.com`

Password para todos:

```text
Password123
```

También crea mascotas, perfil NFC, historial médico, recordatorios, reporte perdido, publicación de adopción, clínica veterinaria oficial, autorización médica aprobada y tags NFC de inventario.

Perfil NFC de prueba:

```text
http://localhost:4200/#/pet/public/NFC-LUNA-001
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
- `PATCH /api/adoptions/applications/:id/status`
- `PATCH /api/adoptions/:id/close`

Premium anual por QR:

- `GET /api/premium/me`
- `POST /api/premium` (`multipart/form-data`: `paymentReference`, `notes`, `receipt` PDF)
- `GET /api/premium` (`ADMIN`)
- `GET /api/premium/:id/receipt` (`ADMIN`, enlace firmado temporal)
- `PATCH /api/premium/:id/status` (`ADMIN`)

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
- Consentimiento explícito del dueño para publicar foto, datos críticos y teléfono en el perfil NFC.
- Límite freemium de 2 mascotas para `OWNER` con plan `FREE`.
- Autorizaciones médicas por mascota antes de que un veterinario escriba historial.
- Un veterinario no puede consultar el detalle de una mascota sin autorización médica aprobada.
- El registro público no permite autoseleccionar el rol administrador.
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
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=tu-user-mailtrap
SMTP_PASS=tu-pass-mailtrap
EMAIL_FROM=TagMyPet <hello@tagmypet.test>
```

En desarrollo el proyecto está preparado para Mailtrap Sandbox. Mailtrap captura los emails dentro de su bandeja de pruebas; no los entrega a Gmail/Outlook reales salvo que configures envío transaccional con dominio verificado.

Si usas Gmail necesitas una contraseña de aplicación, no tu contraseña normal. Si SMTP no está configurado, el backend no falla en desarrollo; solo registra que el email fue omitido.

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
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=TagMyPet <hello@tagmypet.test>
```

Frontend en Netlify:

1. Importar `frontend/`.
2. El archivo `netlify.toml` ya define build y redirects SPA.

## Plan Premium

- Precio: `840 Bs/año`, equivalente a `70 Bs/mes`.
- El dueño abre `Premium`, paga mediante el QR BCP y sube su comprobante obligatorio en PDF.
- El comprobante se carga como archivo privado en Cloudinary; el administrador lo abre mediante enlace firmado temporal de 5 minutos y aprueba o rechaza la solicitud.
- Al aprobar, el usuario pasa a plan `PREMIUM` por 12 meses desde la fecha de aprobación.
- Si vence la vigencia, el backend devuelve automáticamente la cuenta al plan `FREE` en su siguiente sesión o uso autenticado.
- El QR actual es de monto abierto: el usuario debe introducir `840 Bs` y reemplazarse antes de su vencimiento visible, `23/05/2027`.
- TagMyPet no procesa tarjetas ni débitos automáticos; el pago y su verificación son manuales.

Contacto oficial para activación y soporte:

- Teléfono: `76916697`
- Email: `henryriveramendez@gmail.com`

## Privacidad Y Consentimiento

- Al crear una mascota, el dueño debe autorizar que su foto principal, datos críticos y teléfono sean visibles en el perfil público NFC.
- Al aprobar una adopción, la mascota se transfiere al solicitante aprobado y este debe haber autorizado previamente que su teléfono sea el nuevo contacto público NFC.
- El historial clínico completo permanece privado; el veterinario necesita autorización aprobada para acceder.
- Los comprobantes bancarios Premium se conservan de forma privada y solo administración obtiene acceso temporal para verificación.
- La portada de la mascota permite elegir cualquiera de sus hasta 5 fotos y cambiarla más adelante, además de ajustar el encuadre horizontal y vertical para mostrar correctamente su cara; la galería siempre conserva las fotos completas.
- Para solicitar corrección o eliminación de cuenta, mascota o fotos, el usuario puede contactar al desarrollador oficial mediante el teléfono o email indicados.

## Pruebas Manuales

1. Ejecutar seed.
2. Iniciar backend y frontend.
3. Login con `admin@tagmypet.com`.
4. Ver dashboard y panel admin.
5. Login con `owner@tagmypet.com`.
6. Crear mascota con hasta 5 fotos, aceptar consentimiento NFC, ajustar su foto de portada, copiar el código/link y abrir su perfil público.
7. Crear historial y recordatorios.
8. Publicar reporte perdido.
9. Desde otra cuenta OWNER, solicitar adopción con cuestionario y firma digital; desde el dueño original aprobar o rechazar y comprobar el estado.
10. Login con `vet@tagmypet.com`.
11. Crear una clínica desde veterinario y aprobarla desde admin, o revisar la clínica oficial del seed.
12. Solicitar acceso médico con el código NFC de una mascota y aprobarlo desde dueño/admin.
13. Login con `admin@tagmypet.com` y abrir `Tags NFC` para crear lote y asignar tags.
14. Desde una cuenta FREE abrir `Premium`, escanear el QR, adjuntar un PDF de comprobante y enviar la solicitud.
15. Desde admin abrir el PDF protegido, aprobarla y verificar que el usuario muestre vigencia Premium por 12 meses.

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

TagMyPet soporta tres pasos desde la web:

1. **Asignar:** vincula un tag físico con una mascota desde `Tags NFC`.
2. **Grabar:** copia o escribe en el chip la URL pública.
3. **Verificar:** lee el chip o abre el perfil para confirmar que apunta a la mascota correcta.

URL que debe grabarse en el chip:

```text
https://tagmypet.vercel.app/#/pet/public/TMP-LUCAS-001
```

Opción de grabación recomendada:

- Usar `Copiar link` en TagMyPet.
- Pegar la URL en NFC Tools.
- NFC Tools está disponible para Apple y Android.

Checklist físico:

1. Ir a `Tags NFC`.
2. Seleccionar la mascota.
3. Copiar la URL generada.
4. Pegar la URL en NFC Tools y grabarla en el collar.
5. Escanear el collar.
6. Confirmar que abre `https://tagmypet.vercel.app/#/pet/public/<codigo>`.
7. Confirmar que el perfil público no muestra email, password ni historial privado.

## Rotación de Secretos

Si una credencial apareció en capturas, logs o commits, se debe rotar. Orden recomendado:

1. MongoDB Atlas:
   - Database Access -> elegir usuario -> Edit Password.
   - Copiar la nueva URI.
   - Actualizar `MONGO_URI` en Render.
   - Redeploy backend.
   - Probar `/api/health`.
2. Cloudinary:
   - Settings -> API Keys -> generar/rotar `API Secret`.
   - Actualizar `CLOUDINARY_API_SECRET` en Render y en `backend/.env` local.
   - Redeploy backend.
   - Crear mascota con foto para validar subida.
3. Mailtrap:
   - Reset credentials del sandbox o crear inbox nuevo.
   - Actualizar `SMTP_USER` y `SMTP_PASS` en Render y en `backend/.env` local.
   - Ejecutar `npm run test:email -- tu@email.com`.
4. JWT:
   - Cambiar `JWT_SECRET` por un valor largo.
   - Redeploy backend.
   - Cerrar sesión en el frontend y volver a iniciar sesión.

Nunca subir `backend/.env` al repo. Solo `backend/.env.example` con placeholders.

## QA Mobile

Checklist de QA en celular real:

1. Abrir `https://tagmypet.vercel.app`.
2. Confirmar que no hay scroll horizontal; solo scroll vertical.
3. Registro: crear cuenta, ver password, enviar formulario.
4. Login: iniciar sesión y cerrar sesión.
5. Dashboard: verificar rol y plan en texto legible.
6. Mascotas: crear mascota con foto y confirmar que la imagen no sale cortada.
7. Perdidos: revisar tarjetas, foto completa y botón compartir.
8. Adopciones: revisar publicaciones y formulario.
9. Tags NFC: asignar, copiar URL, abrir perfil y verificar flujo NFC.
10. Perfil NFC público: abrir desde celular sin login y confirmar que la foto se ve completa.

Resultado esperado:

- Sin scroll horizontal global.
- Botones tocables sin solaparse.
- Fotos completas de mascota.
- Links NFC usando `/#/pet/public/<codigo>`.
