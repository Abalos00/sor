# SOR - SystemOnReady

MVP en Next.js 14 (App Router) + Prisma + MySQL para gestionar perfiles de instalación y jobs que consumirá un agente Windows.

## Requisitos

- Node.js 20+
- pnpm (o npm)
- MySQL 8 (usa `docker-compose.yml`)
- Opcional: Redis (incluido en `docker-compose.yml`)

## Puesta en marcha

```bash
pnpm install
docker compose up -d mysql redis
npx prisma migrate dev --name init
npx prisma generate
SEED_PROFILE=true npm run seed   # opcional
npm run dev
```

Variables importantes (`.env`):

```
DATABASE_URL=mysql://root:secret@localhost:3307/sor
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=cambia-esto
```

## Flujo funcional

1. `/register`: crea Org + usuario (ADMIN) y redirige al login.
2. `/login`: NextAuth Credentials; si no hay perfiles se fuerza `/onboarding/profile`.
3. `/onboarding/profile`: wizard de 3 pasos para crear el primer perfil.
4. `/dashboard`: selector de acciones + métricas (perfiles / jobs 7 días).
5. `/dashboard/profiles`: listar/editar perfiles.
6. `/dashboard/jobs`: historial de jobs.
7. `/dashboard/jobs/new`: crea jobs (puedes registrar dispositivos al vuelo).
8. `/dashboard/jobs/:id`: detalle con progreso en vivo + descargas (manifest/script/ZIP).
9. `/dashboard/devices`: registrar agentes, copiar tokens y bajar scripts personalizados.
10. `/dashboard/users` (admins): invitar miembros y cambiar roles (ADMIN/TECH).
11. `/dashboard/reports` (admins): exportar CSV y configurar webhooks externos.
12. `/support`: tutoriales y FAQ en lenguaje no técnico.

## APIs principales

- `POST /api/auth/register` – alta de usuarios sin login automático.
- `GET /api/me/summary` – `{ profiles, jobs7d }` para guards/UI.
- `GET /api/tools?os=windows&industry=Escolar` – catálogo de herramientas sugeridas.
- `POST /api/profiles` / `PATCH /api/profiles/:id` – CRUD de perfiles.
- `POST /api/jobs` – crea jobs (si `deviceName` no existe, registra un Device con token propio).
- `GET /api/jobs/:id` – detalle (usado por el panel de progreso).
- `GET /api/jobs/:id/manifest|script|package?key=...` – endpoints para agentes (exigen AccessKey).
- `POST /api/jobs/:id/report?key=...` – recibe resultados del agente (actualiza JobTask y dispara webhooks).
- `GET /api/devices` / `POST /api/devices` – gestión de dispositivos.
- `GET /api/devices/:id/agent` – script preconfigurado para ese dispositivo.
- `GET /api/users` / `POST /api/users` – listar e invitar usuarios dentro de la organización.
- `PATCH /api/users/:id` – cambiar el rol.
- `GET/POST /api/org/settings` – guardar la URL del webhook externo.
- `GET /api/reports/jobs?days=X` – exporta CSV de jobs.

## Smoke tests sugeridos

1. Ejecutar las migraciones/seeds y abrir `npm run dev`.
2. Registrar usuario nuevo, completar onboarding y crear un segundo perfil.
3. Crear un job y visualizar `/dashboard/jobs/:id` (ver progreso + downloads).
4. Ejecutar el agente online:
   ```
   powershell -File agent.ps1 -JobId <id> -AccessKey <key> -ServerUrl http://localhost:3000
   ```
5. Descargar el paquete ZIP o el script del dispositivo y correrlo en una máquina sin conexión (debe omitir apps existentes).
6. Registrar un dispositivo manual, copiar el token y bajar su script.
7. En `/dashboard/users` invitar a un compañero y cambiar su rol.
8. En `/dashboard/reports` descargar un CSV (7/30/90 días) y configurar un webhook de prueba (por ejemplo con https://webhook.site). Actualiza un job y verifica que llegue el POST.

## Notas

- Middleware protege `/dashboard/**` y `/onboarding/**`; el layout del dashboard fuerza onboarding si `profiles.count === 0`.
- `agent.ps1` requiere `-AccessKey` (por job) y omite instalaciones winget ya presentes.
- Los webhooks se disparan en cada actualización de estado del job.
- `prisma/seed.ts` crea herramientas base y el usuario `admin@sor.local / admin`; define `SEED_PROFILE=true` para incorporar un perfil demo.
