# GymStats — Panel de administración de gimnasio

Panel para gestionar clientes, cuotas y pagos de un gimnasio. Hecho con React + Vite.

## ⚠️ Importante: cómo abrir el proyecto

**No funciona haciendo doble clic en `index.html`.** Los navegadores bloquean por
seguridad los módulos de JavaScript cuando se abren así (protocolo `file://`), y vas a
ver la pantalla en blanco. Esto le pasa a cualquier proyecto hecho con React/Vite, no
es un problema de esta app en particular — siempre hay que levantar un servidor local,
aunque sea muy simple. Seguí uno de los dos caminos de abajo.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (incluye `npm`)

## Modo desarrollo (recomendado mientras trabajás en el proyecto)

```bash
npm install
npm run dev
```

Abrí la URL que te muestra la terminal (por defecto `http://localhost:5173`).
Los cambios en el código se reflejan al instante.

## Generar la versión final para publicar

```bash
npm install
npm run build
npm run preview
```

`npm run build` genera la carpeta `dist/` lista para subir a cualquier hosting
(Netlify, Vercel, GitHub Pages, un hosting compartido, etc). `npm run preview`
te deja probarla localmente tal cual quedaría en producción, sirviéndola con
un servidor (no abriendo el archivo directo).

Para publicarla en un hosting real, subí el **contenido** de la carpeta `dist/`
(no la carpeta entera) a tu servidor.

## Funcionalidades

- **Dashboard ejecutivo**: KPIs de clientes activos/inactivos, cuotas vencidas, que vencen hoy y esta semana, e ingresos esperado/cobrado/pendiente. Panel de próximos vencimientos agrupado en Hoy / Mañana / Próximos 7 días, con acceso directo a la ficha del cliente.
- **Clientes**: alta, edición, baja, búsqueda por nombre/teléfono/email, filtro por estado y por estado de pago, recordatorio por WhatsApp, exportación a Excel/PDF.
- **Pagos**: seguimiento de cuotas del mes, marcar como pagado, recordatorio por WhatsApp para quienes no pagaron.
- **Calendario**: vista mensual con los vencimientos de cada día.
- **Caja**: ingresos de hoy/semana/mes, historial de cobros, totales esperado/cobrado/pendiente, exportación a Excel/PDF.
- **Estadísticas**: ingresos y cobros por mes, clientes nuevos por mes, activos vs. inactivos, morosidad (gráficos con Recharts).
- **Ajustes**: nombre del gimnasio, moneda, backup y restauración de datos.

## Datos

Por ahora los datos (clientes, cuotas, pagos) se guardan en el navegador
(`localStorage`), no hay servidor ni base de datos. Desde **Ajustes → Respaldo
de datos** podés descargar un backup en JSON y restaurarlo cuando quieras,
para no perder información si cambiás de equipo o borrás el caché.

## Estructura del proyecto

```
src/
  components/   Componentes de UI (Dashboard, Clientes, Pagos, Calendario, Caja, Estadísticas, Ajustes, etc.)
  context/      Contexto de notificaciones (toasts)
  hooks/        Hooks reutilizables (localStorage, confirmación, toasts)
  utils/        Lógica de negocio (formato, estado de pagos, exportación, WhatsApp)
  styles/       Sistema de diseño (tokens de color, tipografía, base, impresión)
```
