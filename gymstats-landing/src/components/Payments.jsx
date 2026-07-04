import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, Clock, Wallet, MessageCircle } from "lucide-react";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import { useToast } from "../hooks/useToast";
import { getPaymentStatus, PAYMENT_STATUS_META, currentYearMonth, getFinancialSummary } from "../utils/clients";
import { formatCurrency } from "../utils/format";
import { openWhatsAppReminder } from "../utils/whatsapp";
import "./Payments.css";

const ORDER = { vencido: 0, proximo: 1, pendiente: 2, "al-dia": 3, inactivo: 4 };

function Payments({ clients, setClients, settings }) {
  const { showToast } = useToast();
  const ym = currentYearMonth();

  const rows = useMemo(() => {
    return clients
      .filter((c) => c.status === "Activo")
      .map((c) => ({ client: c, status: getPaymentStatus(c) }))
      .sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.client.name.localeCompare(b.client.name));
  }, [clients]);

  const { expected, collected } = getFinancialSummary(clients);
  const overdueCount = rows.filter((r) => r.status === "vencido").length;

  const markPaid = (client) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === client.id
          ? {
              ...c,
              lastPaymentMonth: ym,
              paymentHistory: [
                ...(c.paymentHistory || []),
                { month: ym, date: new Date().toISOString(), amount: Number(c.monthlyFee) || 0 },
              ],
            }
          : c
      )
    );
    showToast(`Pago de ${client.name} registrado`);
  };

  return (
    <section className="payments-page">
      <div className="page-head">
        <div>
          <h1>Pagos</h1>
          <p className="page-subtitle">Seguimiento de cuotas del mes actual</p>
        </div>
      </div>

      <div className="payments-summary">
        <div className="summary-card">
          <Wallet size={20} />
          <div>
            <span className="summary-label">Esperado este mes</span>
            <strong>{formatCurrency(expected, settings.currency)}</strong>
          </div>
        </div>
        <div className="summary-card success">
          <CheckCircle2 size={20} />
          <div>
            <span className="summary-label">Cobrado</span>
            <strong>{formatCurrency(collected, settings.currency)}</strong>
          </div>
        </div>
        <div className="summary-card danger">
          <AlertTriangle size={20} />
          <div>
            <span className="summary-label">Cuotas vencidas</span>
            <strong>{overdueCount}</strong>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No hay socios activos"
          description="Agregá clientes activos en la sección Clientes para hacer seguimiento de sus pagos."
        />
      ) : (
        <div className="table-wrap">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Plan</th>
                <th>Cuota</th>
                <th>Día de pago</th>
                <th>Estado</th>
                <th aria-label="Acción"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ client, status }) => {
                const meta = PAYMENT_STATUS_META[status];
                const isPaid = status === "al-dia";
                return (
                  <tr key={client.id}>
                    <td data-label="Nombre">{client.name}</td>
                    <td data-label="Plan">{client.plan || "—"}</td>
                    <td data-label="Cuota">{formatCurrency(client.monthlyFee, settings.currency)}</td>
                    <td data-label="Día de pago">Día {client.paymentDay || "—"}</td>
                    <td data-label="Estado">
                      <Badge tone={meta.color}>{meta.label}</Badge>
                    </td>
                    <td data-label="">
                      <div className="payments-row-actions">
                        {!isPaid && client.phone && (
                          <button
                            className="icon-btn"
                            onClick={() => openWhatsAppReminder(client)}
                            aria-label={`Enviar recordatorio a ${client.name}`}
                            title="Enviar recordatorio por WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </button>
                        )}
                        <button className="btn btn-sm btn-secondary" disabled={isPaid} onClick={() => markPaid(client)}>
                          {isPaid ? "Pagado" : "Marcar pagado"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Payments;
