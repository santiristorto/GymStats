export const PLAN_SUGGESTIONS = [
  "Musculación",
  "Funcional",
  "Crossfit",
  "Pase full",
  "Clases grupales",
];

export function createEmptyClient() {
  return {
    id: crypto.randomUUID(),
    name: "",
    phone: "",
    email: "",
    plan: "",
    monthlyFee: "",
    paymentDay: "",
    status: "Activo",
    joinDate: new Date().toISOString().slice(0, 10),
    lastPaymentMonth: "",
    notes: "",
    paymentHistory: [],
  };
}

export function currentYearMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calcula el estado de pago de un cliente para el mes actual:
 * - "inactivo": socio dado de baja
 * - "al-dia": ya pagó el mes en curso
 * - "vencido": pasó el día de vencimiento y no pagó
 * - "proximo": faltan 5 días o menos para el vencimiento
 * - "pendiente": todavía no llega el vencimiento y no pagó
 */
export function getPaymentStatus(client, today = new Date()) {
  if (client.status !== "Activo") return "inactivo";

  const ym = currentYearMonth(today);
  if (client.lastPaymentMonth === ym) return "al-dia";

  const day = clamp(Number(client.paymentDay) || 1, 1, 31);
  const todayDay = today.getDate();

  if (todayDay >= day) return "vencido";
  if (day - todayDay <= 5) return "proximo";
  return "pendiente";
}

export const PAYMENT_STATUS_META = {
  "al-dia": { label: "Al día", color: "success" },
  proximo: { label: "Por vencer", color: "warning" },
  vencido: { label: "Vencido", color: "danger" },
  pendiente: { label: "Pendiente", color: "info" },
  inactivo: { label: "Inactivo", color: "muted" },
};

/**
 * Devuelve la próxima fecha de vencimiento de la cuota de un cliente
 * (si ya pagó el mes en curso, la fecha cae en el mes siguiente).
 */
export function getNextDueDate(client, today = new Date()) {
  const day = clamp(Number(client.paymentDay) || 1, 1, 31);
  const ym = currentYearMonth(today);
  const alreadyPaidThisMonth = client.lastPaymentMonth === ym;

  const baseYear = today.getFullYear();
  const baseMonth = alreadyPaidThisMonth ? today.getMonth() + 1 : today.getMonth();
  const daysInMonth = new Date(baseYear, baseMonth + 1, 0).getDate();

  return new Date(baseYear, baseMonth, Math.min(day, daysInMonth));
}

/** Diferencia en días (redondeada) entre dos fechas, ignorando la hora. */
export function daysBetween(dateA, dateB = new Date()) {
  const a = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const b = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
  return Math.round((a - b) / 86400000);
}

/**
 * Resumen financiero del mes actual para los clientes activos:
 * esperado (suma de cuotas), cobrado (cuotas ya pagadas este mes) y pendiente.
 */
export function getFinancialSummary(clients, today = new Date()) {
  const active = clients.filter((c) => c.status === "Activo");
  const ym = currentYearMonth(today);

  const expected = active.reduce((sum, c) => sum + (Number(c.monthlyFee) || 0), 0);
  const collected = active
    .filter((c) => c.lastPaymentMonth === ym)
    .reduce((sum, c) => sum + (Number(c.monthlyFee) || 0), 0);

  return { expected, collected, pending: Math.max(expected - collected, 0) };
}

/** Aplana el historial de pagos de todos los clientes en una sola lista de transacciones. */
export function getAllTransactions(clients) {
  return clients
    .flatMap((c) => (c.paymentHistory || []).map((p) => ({ ...p, clientId: c.id, clientName: c.name })))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/** Últimos `count` meses como "YYYY-MM", en orden cronológico ascendente. */
export function getLastMonths(count, today = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (count - 1 - i), 1);
    return currentYearMonth(d);
  });
}

function monthLabel(ym) {
  const [year, month] = ym.split("-").map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString("es-AR", { month: "short" });
  return label.charAt(0).toUpperCase() + label.slice(1).replace(".", "");
}

/** Ingresos y cantidad de cobros por mes, en base al historial real de pagos. */
export function getMonthlyIncome(clients, monthsCount = 6, today = new Date()) {
  const months = getLastMonths(monthsCount, today);
  const transactions = getAllTransactions(clients);

  return months.map((ym) => {
    const monthTx = transactions.filter((t) => t.month === ym);
    return {
      month: ym,
      label: monthLabel(ym),
      total: monthTx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
      cobros: monthTx.length,
    };
  });
}

/** Cantidad de clientes nuevos (por fecha de ingreso) por mes. */
export function getMonthlyNewClients(clients, monthsCount = 6, today = new Date()) {
  const months = getLastMonths(monthsCount, today);

  return months.map((ym) => ({
    month: ym,
    label: monthLabel(ym),
    nuevos: clients.filter((c) => c.joinDate && c.joinDate.startsWith(ym)).length,
  }));
}

/** Cantidad de clientes activos vs. inactivos. */
export function getStatusCounts(clients) {
  return [
    { name: "Activos", value: clients.filter((c) => c.status === "Activo").length, color: "var(--color-success)" },
    { name: "Inactivos", value: clients.filter((c) => c.status !== "Activo").length, color: "var(--color-muted)" },
  ];
}

/** Distribución de clientes activos según su estado de pago actual (morosidad). */
export function getPaymentStatusCounts(clients, today = new Date()) {
  const active = clients.filter((c) => c.status === "Activo");
  return ["al-dia", "proximo", "vencido", "pendiente"].map((key) => ({
    key,
    name: PAYMENT_STATUS_META[key].label,
    value: active.filter((c) => getPaymentStatus(c, today) === key).length,
    color: `var(--color-${PAYMENT_STATUS_META[key].color})`,
  }));
}

/**
 * Clientes activos y no pagados este mes, con su fecha de vencimiento y los
 * días que faltan (negativo = vencido). Ordenados por urgencia.
 */
export function getUpcomingDueClients(clients, today = new Date()) {
  return clients
    .filter((c) => c.status === "Activo")
    .map((client) => {
      const dueDate = getNextDueDate(client, today);
      return { client, dueDate, daysLeft: daysBetween(dueDate, today), status: getPaymentStatus(client, today) };
    })
    .filter((r) => r.status !== "al-dia")
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

/**
 * Clientes activos cuyo día de vencimiento cae en `day` del mes indicado
 * (month en formato JS, 0-indexado). Usado por la vista de Calendario.
 */
export function getClientsDueOnDay(clients, year, month, day) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return clients.filter((c) => {
    if (c.status !== "Activo") return false;
    const dueDay = Math.min(clamp(Number(c.paymentDay) || 1, 1, 31), daysInMonth);
    return dueDay === day;
  });
}

export function validateClient(form) {
  const errors = {};

  if (!form.name || !form.name.trim()) {
    errors.name = "El nombre es obligatorio";
  }

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Ingresá un email válido";
  }

  if (form.monthlyFee !== "" && Number(form.monthlyFee) < 0) {
    errors.monthlyFee = "Tiene que ser un número positivo";
  }

  if (form.paymentDay !== "" && (Number(form.paymentDay) < 1 || Number(form.paymentDay) > 31)) {
    errors.paymentDay = "Tiene que estar entre 1 y 31";
  }

  return errors;
}
