/** Limpia un teléfono a solo dígitos para armar el link de wa.me. */
function sanitizePhone(phone) {
  return (phone || "").replace(/[^\d]/g, "");
}

export function buildReminderMessage(client) {
  return `Hola ${client.name}, ¿cómo estás? Te recordamos que la cuota del gimnasio correspondiente a este mes figura pendiente. Cuando puedas, avisanos cualquier duda. Muchas gracias.`;
}

/** Devuelve la URL de WhatsApp Web/App con el mensaje de recordatorio precargado. */
export function getReminderWhatsAppUrl(client) {
  const phone = sanitizePhone(client.phone);
  const text = encodeURIComponent(buildReminderMessage(client));
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
}

export function openWhatsAppReminder(client) {
  window.open(getReminderWhatsAppUrl(client), "_blank", "noopener,noreferrer");
}
