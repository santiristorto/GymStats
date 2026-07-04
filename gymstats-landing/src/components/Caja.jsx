import { CalendarDays, Wallet, CheckCircle2, Landmark, TrendingUp } from "lucide-react";
import EmptyState from "./EmptyState";
import ExportButtons from "./ExportButtons";
import { getAllTransactions, getFinancialSummary, daysBetween } from "../utils/clients";
import { formatCurrency, formatDate } from "../utils/format";
import "./Caja.css";

function Caja({ clients, settings }) {
  const today = new Date();
  const transactions = getAllTransactions(clients);
  const { expected, collected, pending } = getFinancialSummary(clients);

  const sumWhere = (predicate) =>
    transactions.filter(predicate).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const incomeToday = sumWhere((t) => daysBetween(new Date(t.date), today) === 0);
  const incomeWeek = sumWhere((t) => {
    const diff = daysBetween(new Date(t.date), today);
    return diff >= 0 && diff <= 6;
  });
  const incomeMonth = sumWhere((t) => new Date(t.date).getMonth() === today.getMonth() && new Date(t.date).getFullYear() === today.getFullYear());

  const exportColumns = [
    { key: "date", label: "Fecha" },
    { key: "clientName", label: "Cliente" },
    { key: "month", label: "Mes correspondiente" },
    { key: "amount", label: "Monto" },
  ];
  const exportRows = transactions.map((t) => ({
    date: formatDate(t.date),
    clientName: t.clientName,
    month: t.month,
    amount: t.amount,
  }));

  return (
    <section className="caja-page">
      <div className="page-head">
        <div>
          <h1>Caja</h1>
          <p className="page-subtitle">Ingresos y cobros del gimnasio</p>
        </div>
        <ExportButtons filename="gymstats-caja" columns={exportColumns} rows={exportRows} />
      </div>

      <div className="caja-summary">
        <div className="summary-card">
          <CalendarDays size={20} />
          <div>
            <span className="summary-label">Ingresos de hoy</span>
            <strong>{formatCurrency(incomeToday, settings.currency)}</strong>
          </div>
        </div>
        <div className="summary-card">
          <TrendingUp size={20} />
          <div>
            <span className="summary-label">Ingresos de la semana</span>
            <strong>{formatCurrency(incomeWeek, settings.currency)}</strong>
          </div>
        </div>
        <div className="summary-card">
          <Wallet size={20} />
          <div>
            <span className="summary-label">Ingresos del mes</span>
            <strong>{formatCurrency(incomeMonth, settings.currency)}</strong>
          </div>
        </div>
        <div className="summary-card">
          <Landmark size={20} />
          <div>
            <span className="summary-label">Total esperado</span>
            <strong>{formatCurrency(expected, settings.currency)}</strong>
          </div>
        </div>
        <div className="summary-card success">
          <CheckCircle2 size={20} />
          <div>
            <span className="summary-label">Total cobrado</span>
            <strong>{formatCurrency(collected, settings.currency)}</strong>
          </div>
        </div>
        <div className="summary-card danger">
          <Landmark size={20} />
          <div>
            <span className="summary-label">Saldo pendiente</span>
            <strong>{formatCurrency(pending, settings.currency)}</strong>
          </div>
        </div>
      </div>

      <h2 className="section-title">Historial de cobros</h2>
      {transactions.length === 0 ? (
        <EmptyState
          title="Todavía no hay cobros registrados"
          description="Cuando marqués una cuota como pagada desde la sección Pagos, va a aparecer acá."
        />
      ) : (
        <div className="table-wrap">
          <table className="caja-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Mes correspondiente</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={`${t.clientId}-${t.month}-${i}`}>
                  <td data-label="Fecha">{formatDate(t.date)}</td>
                  <td data-label="Cliente">{t.clientName}</td>
                  <td data-label="Mes correspondiente">{t.month}</td>
                  <td data-label="Monto">{formatCurrency(t.amount, settings.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Caja;
