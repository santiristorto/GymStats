import { currentYearMonth } from "./clients";

const NAMES = [
  "Lucía Fernández",
  "Martín Gómez",
  "Sofía Álvarez",
  "Nicolás Torres",
  "Camila Ruiz",
  "Agustín Molina",
  "Valentina Díaz",
  "Bruno Sosa",
];

const PLANS = ["Musculación", "Funcional", "Crossfit", "Pase full", "Clases grupales"];

function prevYearMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return currentYearMonth(d);
}

export function generateSeedClients() {
  const thisMonth = currentYearMonth();
  const lastMonth = prevYearMonth();

  return NAMES.map((name, i) => {
    const paidThisMonth = i % 3 !== 0;
    const isActive = i !== NAMES.length - 1;
    const slug = name.toLowerCase().replace(/[^a-z]+/g, ".");

    return {
      id: crypto.randomUUID(),
      name,
      phone: `351 5${(500 + i * 37).toString().padStart(3, "0")}-${(1000 + i * 91).toString().slice(-4)}`,
      email: `${slug}@correo.com`,
      plan: PLANS[i % PLANS.length],
      monthlyFee: 15000 + (i % 4) * 5000,
      paymentDay: [5, 10, 15, 20, 25][i % 5],
      status: isActive ? "Activo" : "Inactivo",
      joinDate: new Date(2025, i % 12, (i % 27) + 1).toISOString().slice(0, 10),
      lastPaymentMonth: paidThisMonth ? thisMonth : lastMonth,
      notes: "",
      paymentHistory: [],
    };
  });
}
