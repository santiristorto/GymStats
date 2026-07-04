export function formatCurrency(value, currency = "ARS") {
  const amount = Number(value) || 0;
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Por si currency no es un código ISO válido
    return `${currency} ${amount.toLocaleString("es-AR")}`;
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
