import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, Clock, Wallet, MessageCircle, Undo2, Megaphone } from "lucide-react";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import PaymentModal from "./PaymentModal";
import Modal from "./Modal";
import { useToast } from "../hooks/useToast";
import { useConfirm } from "../hooks/useConfirm";
import {
  getPaymentStatus,
  PAYMENT_STATUS_META,
  getFinancialSummary,
  registerPayment,
  undoLastPayment,
} from "../utils/clients";
import { formatCurrency } from "../utils/format";
import { openWhatsAppReminder } from "../utils/whatsapp";
import { editClient } from "../services/clientService";
import "./Payments.css";

const ORDER = { vencido: 0, proximo: 1, pendiente: 2, "al-dia": 3, inactivo: 4 };

function Payments({ clients, setClients, settings, gym }) {
  const { showToast } = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const [payingClient, setPayingClient] = useState(null);
  const [remindersOpen, setRemindersOpen] = useState(false);

  const rows = useMemo(() => {
    return clients
      .filter((c) => c.status === "Activo")
      .map((c) => ({ client: c, status: getPaymentStatus(c) }))
      .sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.client.name.localeCompare(b.client.name));
  }, [clients]);

  const { expected, collected } = getFinancialSummary(clients);
  const overdueCount = rows.filter((r) => r.status === "vencido").length;
  const pendingRows = rows.filter((r) => r.status === "vencido" || r.status === "proximo");

  const applyUpdate = async (client, fields, successMessage) => {
    try {
      const updated = await editClient(client.id, fields);
      setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      showToast(successMessage);
    } catch (error) {
      console.error(error);
      showToast(error.message || "No se pudo actualizar el pago", "danger");
    }
  };

  const handleConfirmPayment = ({ amount, concept, note }) => {
    const fields = registerPayment(payingClient, { amount, concept, note });
    applyUpdate(payingClient, fields, `Cobro de ${payingClient.name} registrado`);
    setPayingClient(null);
  };

  const handleUndo = async (client) => {
    const ok = await confirm({
      title: "Deshacer último pago",
      message: `Se va a eliminar el último cobro registrado de ${client.name}. ¿Continuar?`,
      confirmLabel: "Deshacer",
      tone: "danger",
    });
    if (!ok) return;
    const fields = undoLastPayment(client);
    applyUpdate(client, fields, `Se deshizo el último pago de ${client.name}`);
  };

  return (
    <section className="payments-page">
      <div className="page-head">
        <div>
          <h1>Pagos</h1>
          <p className="page-subtitle">Seguimiento de cuotas del mes actual</p>
        </div>
        {pendingRows.length > 0 && (
          <button className="btn btn-secondary" onClick={() => setRemindersOpen(true)}>
            <Megaphone size={16} /> Recordar a vencidos ({pendingRows.length})
          </button>
        )}
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
                const hasHistory = (client.paymentHistory || []).length > 0;
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
                        {hasHistory && (
                          <button
                            className="icon-btn"
                            onClick={() => handleUndo(client)}
                            aria-label={`Deshacer último pago de ${client.name}`}
                            title="Deshacer último pago"
                          >
                            <Undo2 size={16} />
                          </button>
                        )}
                        <button className="btn btn-sm btn-secondary" onClick={() => setPayingClient(client)}>
                          {isPaid ? "Registrar cobro" : "Marcar pagado"}
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

      {payingClient && (
        <PaymentModal
          client={payingClient}
          settings={settings}
          gym={gym}
          onConfirm={handleConfirmPayment}
          onClose={() => setPayingClient(null)}
        />
      )}

      {remindersOpen && (
        <Modal title="Recordar a vencidos" onClose={() => setRemindersOpen(false)} footer={
          <button className="btn btn-ghost" onClick={() => setRemindersOpen(false)}>Cerrar</button>
        }>
          <ul className="calendar-day-list">
            {pendingRows.map(({ client, status }) => (
              <li key={client.id}>
                <div className="alert-info">
                  <span className="alert-name">{client.name}</span>
                  <span className="dim">{formatCurrency(client.monthlyFee, settings.currency)}</span>
                </div>
                <div className="alert-meta">
                  <Badge tone={PAYMENT_STATUS_META[status].color}>{PAYMENT_STATUS_META[status].label}</Badge>
                  {client.phone ? (
                    <button className="btn btn-sm btn-secondary" onClick={() => openWhatsAppReminder(client)}>
                      <MessageCircle size={14} /> Enviar
                    </button>
                  ) : (
                    <span className="dim">Sin teléfono</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Modal>
      )}

      {confirmDialog}
    </section>
  );
}

export default Payments;
