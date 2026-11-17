# Plataforma de Tickets DMC (`sys-tickets-dmc`)

Portal web para que los clientes de DMC (retail: Falabella, Líder, Paris, Sodimac, Preunic, etc.) reporten y den seguimiento a fallas de sus equipos de protección electrónica de artículos (pórticos antihurto SD‑8088, SD‑601, SD‑602, RF4210 TX/RX), con control de SLA, historial por ticket, reportes y generación de actas en PDF.

> **Estado actual:** prototipo funcional que replica el diseño "Plataforma Tickets DMC". Los datos son **estáticos y en memoria** (`lib/data.ts`); la conexión a SQL Server está preparada pero aún no implementada. Ver [Roadmap](#roadmap--pendientes).

---

## Tabla de contenidos

- [Stack](#stack)
- [Requisitos](#requisitos)
- [Puesta en marcha](#puesta-en-marcha)
- [Variables de entorno](#variables-de-entorno)
- [Scripts](#scripts)
- [Funcionalidades](#funcionalidades)
- [Rutas](#rutas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Arquitectura](#arquitectura)
- [Seguridad](#seguridad)
- [Modelo de datos](#modelo-de-datos)
- [Despliegue](#despliegue)
- [Convenciones de Git](#convenciones-de-git)
- [Roadmap / pendientes](#roadmap--pendientes)

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router, Server Actions, `proxy.ts`) |
| UI | React 19, Tailwind CSS 4 (`@tailwindcss/postcss`) |
| Lenguaje | TypeScript 5.9 (modo `strict`) |
| Validación | Zod 4 |
| PDF | `pdf-lib` |
| Base de datos (previsto) | SQL Server vía `mssql` / `tedious` |
| Guard de servidor | `server-only` |

> ⚠️ Este proyecto usa una versión de Next.js con **cambios incompatibles** respecto a versiones anteriores (por ejemplo `proxy.ts` en lugar de `middleware.ts`). Antes de modificar convenciones de Next, consulta la documentación incluida en `node_modules/next/dist/docs/` (ver `AGENTS.md`).

## Requisitos

- Node.js 20.9 o superior (recomendado LTS actual)
- npm (el repo incluye `package-lock.json`)
- *(Futuro)* Acceso a una instancia de SQL Server

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de entorno local
cp .env.example .env.local        # en PowerShell: Copy-Item .env.example .env.local

# 3. Levantar el servidor de desarrollo
npm run dev
```

Abre <http://localhost:3000>. Sin sesión serás redirigido a `/login`.

### Credenciales de demostración

Mientras no exista la base de datos, el login valida contra una credencial fija definida en `lib/actions.ts` y `lib/data.ts` (usuario *Marcela Ortiz*, Jefa de prevención de pérdidas, Falabella). Consulta esos archivos para los valores. **Deben eliminarse antes de pasar a producción real.**

## Variables de entorno

Se definen en `.env.local` (ignorado por Git). La plantilla versionada es `.env.example`.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `SESSION_SECRET` | **Sí, en producción** | Clave para firmar la cookie de sesión (HMAC‑SHA256). Mínimo 32 caracteres. En desarrollo se usa un valor por defecto inseguro; en producción la app lanza error si falta. |
| `DB_SERVER` | No (reservada) | Host de SQL Server. |
| `DB_NAME` | No (reservada) | Nombre de la base de datos. |
| `DB_USER` | No (reservada) | Usuario de la base de datos. |
| `DB_PASSWORD` | No (reservada) | Contraseña de la base de datos. |

Generar un secreto fuerte:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Sirve la compilación de producción |
| `npm run typecheck` | Verificación de tipos (`tsc --noEmit`) |

## Funcionalidades

- **Autenticación** con cookie de sesión firmada, opción "recordarme" (14 días vs. 8 horas) y bloqueo temporal tras 3 intentos fallidos (15 min).
- **Dashboard** con indicadores, gráficos (creados vs. resueltos, tendencia semanal, ranking de tiendas, tipos de falla).
- **Tickets**: listado con filtros, exportación y detalle con comentarios, línea de tiempo, cambio de estado y valoración (1–5).
- **Nueva solicitud**: formulario con tienda, equipo, tipo/subtipo de falla, prioridad, diagnóstico inicial, contacto y adjuntos (hasta 6 archivos, 25 MB; JPG, PNG, MP4).
- **SLA** de 48 horas con indicadores de cumplimiento.
- **Tiendas y equipos**: inventario de pórticos por tienda con tickets abiertos.
- **Reportes** y **configuración** de cuenta/usuarios.
- **Acta en PDF** por ticket (`pdf-lib`), incluyendo el logo `public/dmc-logo.png`.
- **Filtro de sucursal** global persistido en cookie.

### Ciclo de vida de un ticket

`Nuevo → Asignado → En terreno → En espera cliente → Resuelto → Cerrado`

Prioridades: `Baja`, `Media`, `Alta`, `Crítica`.

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Redirige a `/dashboard` |
| `/login` | Inicio de sesión (única ruta pública) |
| `/dashboard` | Panel de indicadores |
| `/tickets` | Listado de tickets |
| `/tickets/nueva` | Crear nueva solicitud |
| `/tickets/[id]` | Detalle del ticket (formato de id `TKT-AAAA-NNNN`) |
| `/tickets/[id]/acta` | Descarga del acta en PDF (route handler) |
| `/tickets/export` | Exportación de tickets (route handler) |
| `/tiendas`, `/tiendas/[id]` | Listado y detalle de tienda |
| `/equipos` | Inventario de equipos |
| `/reportes` | Reportes |
| `/configuracion` | Configuración de cuenta y usuarios |

## Estructura del proyecto

```
sys_tickets/
├── app/
│   ├── (app)/                 # Grupo autenticado (layout con sidebar/topbar)
│   │   ├── dashboard/  tickets/  tiendas/  equipos/  reportes/  configuracion/
│   │   └── tickets/[id]/acta/route.ts   # PDF
│   ├── login/                 # Pantalla pública de acceso
│   ├── layout.tsx  page.tsx  globals.css
├── components/                # UI compartida (charts, sidebar, topbar, tabla, toast…)
├── lib/
│   ├── actions.ts             # Server Actions (login, comentarios, estado, tickets…)
│   ├── data.ts                # Datos estáticos del diseño (temporal)
│   ├── repo.ts                # Capa de acceso a datos (en memoria hoy; SQL mañana)
│   ├── schemas.ts             # Esquemas Zod de entrada
│   ├── session.ts             # Cookie de sesión firmada
│   ├── filtros.ts  format.ts  # Utilidades
├── public/                    # Estáticos (dmc-logo.png)
├── proxy.ts                   # Barrera de autenticación (reemplaza a middleware)
├── next.config.ts             # Cabeceras de seguridad, CSP, paquetes externos
├── .env.example               # Plantilla de variables de entorno
└── AGENTS.md                  # Instrucciones para asistentes de IA
```

## Arquitectura

- **Repositorio como frontera de datos.** Toda la app consume `lib/repo.ts`, nunca `lib/data.ts` directamente. Para conectar SQL Server solo hay que reemplazar el cuerpo de las funciones de `repo.ts` conservando las firmas.
- **Server Actions** (`lib/actions.ts`) para mutaciones, con validación Zod y revalidación de rutas.
- **Defensa en capas de autenticación:** `proxy.ts` bloquea toda ruta sin sesión válida; el layout `(app)` y los route handlers vuelven a verificar.
- **Estado en memoria:** el store de tickets vive en `globalThis` y se reinicia al reiniciar el servidor. No es apto para múltiples instancias.

## Seguridad

- Cookie `httpOnly`, `sameSite=lax`, `secure` en producción, firmada con HMAC‑SHA256 y comparación en tiempo constante (`timingSafeEqual`).
- Cabeceras en `next.config.ts`: `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`. `X-Powered-By` desactivado.
- Entrada validada con Zod (ids de ticket con regex estricta, límites de longitud y de adjuntos).
- `server-only` impide que módulos sensibles (`session`, `repo`) lleguen al cliente.
- **Limitación conocida:** el contador de intentos de login es en memoria (no sirve con varias instancias) y las credenciales son de demostración.
- `.gitignore` excluye `.env*` (excepto `.env.example`), llaves/certificados, respaldos de BD y cargas de usuario. **Nunca subas secretos al repositorio.**

## Modelo de datos

Definido (por ahora) en `lib/data.ts`:

- **Ticket**: id `TKT-AAAA-NNNN`, tienda, equipo (serie), estado, prioridad, tipo/subtipo de falla, descripción, técnico, fechas, horas transcurridas, comentarios, línea de tiempo, valoración.
- **Tienda**: id, nombre, comuna, contacto y lista de equipos.
- **Equipo**: serie, modelo (`SD-8088`, `SD-601`, `SD-602`, `RF4210 TX/RX`), ubicación.
- **Usuario / cuenta**: perfil (Administrador de cuenta, Jefe de local, Operaciones) y tiendas asignadas.

Tipos de falla: Conectividad, Falsa alarma, No detecta etiquetas, Daño físico, Energía, Sincronización TX/RX, Otros.

## Despliegue

1. Definir `SESSION_SECRET` (≥ 32 caracteres) en el entorno del proveedor.
2. `npm run build` y `npm run start` (o plataforma compatible con Next.js, p. ej. Vercel).
3. Servir siempre por HTTPS (la cookie es `secure` y se envía HSTS).
4. El PDF requiere `public/dmc-logo.png` en el bundle; ya está configurado en `outputFileTracingIncludes`.

## Convenciones de Git

- El archivo `.gitignore` está pensado para que `git add .` sea seguro: no incluye dependencias, builds, secretos, logs, respaldos de BD ni archivos de editor/SO.
- Se **versionan**: código fuente, `package-lock.json`, `.env.example`, `AGENTS.md`, `README.md`.
- `AGENTS.md` lo regenera `next dev`; confírmalo junto con tu trabajo para mantener limpio el árbol.
- Antes de hacer commit: `npm run typecheck`.

```bash
git init
git add .
git status          # revisa que no aparezcan .env, node_modules ni .next
git commit -m "chore: commit inicial"
```

## Roadmap / pendientes

- [ ] Conectar SQL Server (`mssql`) reemplazando el cuerpo de `lib/repo.ts`.
- [ ] Autenticación real (usuarios en BD, hash de contraseñas, perfiles y alcance por tienda).
- [ ] Rate limiting de login persistente (Redis/BD).
- [ ] Persistencia y almacenamiento de adjuntos.
- [ ] Notificaciones por correo en cambios de estado.
- [ ] Pruebas automatizadas (unitarias y e2e).
