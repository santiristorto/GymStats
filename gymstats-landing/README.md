# GymStats — Panel de administración de gimnasio (multi-tenant)

Panel para que **varios gimnasios** gestionen sus clientes, cuotas, pagos y asistencia,
cada uno viendo solo sus propios datos. Hecho con React + Vite + Supabase.

## ⚠️ Importante: cómo abrir el proyecto

**No funciona haciendo doble clic en `index.html`.** Los navegadores bloquean por
seguridad los módulos de JavaScript cuando se abren así (protocolo `file://`), y vas a
ver la pantalla en blanco. Siempre hay que levantar un servidor (aunque sea local).

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (incluye `npm`)
- Para Mercado Pago: [Supabase CLI](https://supabase.com/docs/guides/cli) instalada
  (`npm install -g supabase`) y logueada en tu proyecto (`supabase login`)

## Modo desarrollo

```bash
npm install
npm run dev
```

## Generar la versión final para publicar

```bash
npm install
npm run build
npm run preview
```

`npm run build` genera `dist/`, lista para subir a cualquier hosting con HTTPS
(Netlify, Vercel, etc — **HTTPS es obligatorio** para que la PWA y el service worker
funcionen). Subí el **contenido** de `dist/`, no la carpeta entera.

---

## 🗄️ Setup de Supabase — correr en orden

### 1. Tabla de gimnasios (multi-tenant)

```sql
create table public.gyms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Mi gimnasio',
  currency text not null default 'ARS',
  mp_access_token text,
  created_at timestamptz not null default now()
);

alter table public.gyms enable row level security;

create policy "Owners manage their own gym"
on public.gyms
for all
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());
```

### 2. Vincular `clients` y `attendance` a un gimnasio

```sql
alter table public.clients add column gym_id uuid references public.gyms(id) on delete cascade;
alter table public.attendance add column gym_id uuid references public.gyms(id) on delete cascade;

drop policy if exists "Authenticated users can manage clients" on public.clients;
drop policy if exists "Public full access to clients" on public.clients;

create policy "Users manage clients of their own gym"
on public.clients
for all
to authenticated
using (gym_id in (select id from public.gyms where owner_id = auth.uid()))
with check (gym_id in (select id from public.gyms where owner_id = auth.uid()));

drop policy if exists "Authenticated users can manage attendance" on public.attendance;

create policy "Users manage attendance of their own gym"
on public.attendance
for all
to authenticated
using (gym_id in (select id from public.gyms where owner_id = auth.uid()))
with check (gym_id in (select id from public.gyms where owner_id = auth.uid()));
```

### 3. Migrar los datos que ya tenías cargados

Como ya veníamos con clientes cargados de antes (single-tenant), hay que crear
tu gimnasio y asignarle esos registros existentes:

```sql
-- 1) Buscá tu user id
select id, email from auth.users;

-- 2) Creá tu gimnasio (reemplazá el owner_id por el id de arriba)
insert into public.gyms (owner_id, name, currency)
values ('TU_USER_ID_AQUI', 'Mi gimnasio', 'ARS')
returning id;

-- 3) Con el id que te devolvió, asigná tus datos existentes
update public.clients set gym_id = 'ID_DEL_GYM_AQUI' where gym_id is null;
update public.attendance set gym_id = 'ID_DEL_GYM_AQUI' where gym_id is null;

-- 4) Una vez migrado, hacé obligatorio el campo
alter table public.clients alter column gym_id set not null;
alter table public.attendance alter column gym_id set not null;
```

### 4. Habilitar el registro público (ahora es SaaS)

En **Authentication → Settings**, activá "Allow new users to sign up" (si lo habías
desactivado antes, dalo vuelta: ahora cualquier dueño de gimnasio se registra solo
desde la pantalla de la app, y al entrar por primera vez le pide crear su gimnasio).

### 5. Mercado Pago (Edge Functions)

El código ya está en `supabase/functions/create-mp-preference` y `supabase/functions/mp-webhook`.
Vos tenés que deployarlas:

```bash
supabase link --project-ref TU_PROJECT_REF   # una sola vez

supabase secrets set SUPABASE_URL=https://TU_PROYECTO.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
# (Service Role Key: Project Settings → API → service_role — NUNCA la pongas en el frontend/.env)

supabase functions deploy create-mp-preference
supabase functions deploy mp-webhook --no-verify-jwt
```

Después, cada gimnasio pega **su propio** Access Token de Mercado Pago en
**Ajustes → Mercado Pago** dentro de la app (Mercado Pago → Tu negocio → Credenciales
de producción). Con eso, el botón "Enviar link de Mercado Pago" en Pagos genera un
link de cobro y lo manda por WhatsApp; cuando el cliente paga, el webhook lo acredita
solo, sin que vos hagas nada.

**Importante**: esto usa Checkout Pro con `external_reference` para saber a qué
cliente acreditar el pago. Es la integración más simple y suficiente para cobrar
cuotas; no maneja suscripciones automáticas recurrentes (eso sería un paso más,
con "Preapproval" de Mercado Pago, si en algún momento lo necesitás).

### 6. Actualización en vivo (Realtime)

Para que la pantalla se actualice sola cuando el webhook de Mercado Pago acredita un
pago (sin que tengas que recargar), corré esto una sola vez:

```sql
alter publication supabase_realtime add table public.clients;
```

Si no lo corrés, la app sigue funcionando igual, solo que vas a necesitar recargar la
página para ver los pagos que se acreditan por Mercado Pago.

### 7. Notificaciones push

```sql
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create policy "Users manage their own push subscriptions"
on public.push_subscriptions
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

Deployá las dos funciones nuevas y configurá las claves VAPID (ya generadas y puestas
en tu `.env` como `VITE_VAPID_PUBLIC_KEY` — la privada NUNCA va en el frontend):

```bash
supabase secrets set VAPID_PUBLIC_KEY=BFEujlQzP2XfrYzUJEAMuFa2TZmNTQN9IM_0rGcneUjv9VTvOTz4Qwph-A6phPE4hXlxs9mjaENHI9aKLTYkevo
supabase secrets set VAPID_PRIVATE_KEY=JX61Yv0_y1Yo-0mTzId_2qt_06V6c53gUaofZN6GcyQ

supabase functions deploy send-push
supabase functions deploy send-payment-reminders
```

Probalo desde **Ajustes → Notificaciones → Activar notificaciones**, y después
**"Mandar una de prueba"**. Si no aparece nada, revisá que el navegador no las tenga
bloqueadas para tu sitio (candadito al lado de la URL → Notificaciones → Permitir).

**Para que los recordatorios de "vencen hoy" se manden solos todos los días**, hace
falta un Cron Job que dispare `send-payment-reminders` (por ejemplo, todas las
mañanas a las 9). En el dashboard: **Database → Cron Jobs → Create a new cron job**,
elegís "Supabase Edge Function" como tipo, seleccionás `send-payment-reminders`, y le
ponés el horario (`0 9 * * *` para las 9am todos los días). Esto es opcional — sin
cron, igual podés usar el botón de prueba manual cuando quieras.

Importante: **no subas el `.env` con la clave privada a ningún lado público** (git
está bien porque solo tiene la pública `VITE_VAPID_PUBLIC_KEY`; la privada solo vive
como secret de Supabase).

---

## Funcionalidades

- **Multi-gimnasio (SaaS)**: cada usuario se registra, crea su gimnasio y ve solo sus propios datos (RLS por `gym_id`).
- **Login / Registro**: Supabase Auth, con onboarding para crear el gimnasio la primera vez.
- **Dashboard ejecutivo**: KPIs de activos/inactivos, vencidas, vencen hoy/semana, ingresos esperado/cobrado/pendiente, próximos vencimientos agrupados.
- **Clientes**: alta/edición/baja, búsqueda, filtros, aviso de posible duplicado, recordatorio por WhatsApp, exportación a Excel/PDF.
- **Asistencia**: check-in del día.
- **Pagos**: cobros totales o parciales por concepto (cuota/matrícula/producto/otro), deshacer pago, recordatorio individual o masivo, cobro online con Mercado Pago.
- **Calendario**: vencimientos por día, con acción de marcar pagado.
- **Caja**: ingresos de hoy/semana/mes, historial con concepto, exportación.
- **Estadísticas**: gráficos con Recharts.
- **Ajustes**: nombre/moneda del gimnasio, credencial de Mercado Pago, backup y restauración.
- **PWA**: instalable en el celular como app (ícono, pantalla completa, funciona con conexión intermitente para la parte ya cargada).

## Estructura del proyecto

```
src/
  components/   Componentes de UI
  context/      Auth, Gimnasio y Toasts (contextos globales)
  hooks/        Hooks reutilizables
  services/     Llamadas a Supabase (clientes, asistencia, gimnasio)
  utils/        Lógica de negocio (formato, pagos, exportación, WhatsApp)
  styles/       Sistema de diseño
supabase/
  functions/    Edge Functions de Mercado Pago (create-mp-preference, mp-webhook)
```

## Pendiente / próximos pasos posibles

Antes de vender esto en serio a otros gimnasios, en orden de importancia:

1. ~~Probar el webhook de Mercado Pago~~ ✅ Confirmado: cuando pagan, el cliente queda marcado como pagado.
   Con el paso de Realtime de arriba, ahora además se ve solo en pantalla sin recargar.
2. **Deployar el frontend** (no solo las Edge Functions) a un hosting con HTTPS — Netlify o Vercel, gratis. Sin esto
   solo vos podés usar la app desde tu compu.
3. ~~Probar con una segunda cuenta~~ ✅ Confirmado: el aislamiento entre gimnasios funciona.
4. **Activar credenciales de producción de Mercado Pago** ✅ Ya lo hiciste y probaste un pago real.
5. **Personalizar los emails de Supabase Auth** — texto en español listo para pegar, ver mensaje del chat
   (Authentication → Email Templates → "Confirm signup" y "Reset Password").
6. ~~Notificaciones push~~ ✅ Implementado (ver sección 7 de arriba) — falta que hagas el deploy y el paso del cron si querés que sean automáticas.
7. Si esto se vuelve un producto real: términos de servicio, política de privacidad, y algún tipo de cobro a los
   gimnasios que lo usen (vos también vas a querer cobrarles a ellos, ¿no? Eso es otra integración de Mercado
   Pago/Stripe, pero para tus propios clientes en vez de los de ellos — avisame si llegás a ese punto).
