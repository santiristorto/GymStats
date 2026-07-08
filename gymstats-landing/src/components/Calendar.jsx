import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import Modal from "./Modal";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import { getClientsDueOnDay, currentYearMonth, registerPayment } from "../utils/clients";
import { formatCurrency } from "../utils/format";
import { openWhatsAppReminder } from "../utils/whatsapp";
import { editClient } from "../services/clientService";
import { useToast } from "../hooks/useToast";
import "./Calendar.css";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  // Lunes = 0 ... Domingo = 6 (en vez del 0=Domingo por defecto de JS)
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function Calendar({ clients, setClients, settings, onOpenClient }) {
  const { showToast } = useToast();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const displayedYm = currentYearMonth(cursor);

  const isToday = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const goToMonth = (offset) => setCursor(new Date(year, month + offset, 1));

  const dueClientsForDay = (day) => (day ? getClientsDueOnDay(clients, year, month, day) : []);

  const selectedClients = selectedDay ? dueClientsForDay(selectedDay) : [];

  const activeClientsCount = clients.filter((c) => c.status === "Activo").length;

  const handleMarkPaid = async (client) => {
    try {
      const fields = registerPayment(client, { amount: client.monthlyFee, concept: "Cuota mensual" });
      const updated = await editClient(client.id, fields);
      setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      showToast(`Pago de ${client.name} registrado`);
    } catch (error) {
      console.error(error);
      showToast(error.message || "No se pudo registrar el pago", "danger");
    }
  };

  return (
    <section className="calendar-page">
      <div className="page-head">
        <div>
          <h1>Calendario</h1>
          <p className="page-subtitle">Vencimientos de cuota por día</p>
        </div>
        <div className="calendar-nav">
          <button className="icon-btn" onClick={() => goToMonth(-1)} aria-label="Mes anterior">
            <ChevronLeft size={18} />
          </button>
          <strong className="calendar-month-label">
            {cursor.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
          </strong>
          <button className="icon-btn" onClick={() => goToMonth(1)} aria-label="Mes siguiente">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {activeClientsCount === 0 ? (
        <EmptyState title="No hay socios activos" description="Agregá clientes activos para verlos reflejados acá." />
      ) : (
        <div className="calendar-grid-wrap">
          <div className="calendar-weekdays">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {cells.map((day, i) => {
              const dueClients = dueClientsForDay(day);
              const paidCount = dueClients.filter((c) => c.lastPaymentMonth === displayedYm).length;
              const pendingCount = dueClients.length - paidCount;
              return (
                <button
                  key={i}
                  type="button"
                  className={`calendar-cell ${day ? "" : "calendar-cell-empty"} ${isToday(day) ? "is-today" : ""}`}
                  disabled={!day || dueClients.length === 0}
                  onClick={() => setSelectedDay(day)}
                >
                  {day && (
                    <>
                      <span className="calendar-day-number">{day}</span>
                      {dueClients.length > 0 && (
                        <span className="calendar-day-badges">
                          {pendingCount > 0 && <span className="calendar-dot pending">{pendingCount}</span>}
                          {paidCount > 0 && <span className="calendar-dot paid">{paidCount}</span>}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedDay && (
        <Modal
          title={`Vencen el día ${selectedDay}`}
          onClose={() => setSelectedDay(null)}
          footer={
            <button className="btn btn-ghost" onClick={() => setSelectedDay(null)}>
              Cerrar
            </button>
          }
        >
          <ul className="calendar-day-list">
            {selectedClients.map((client) => {
              const paid = client.lastPaymentMonth === displayedYm;
              return (
                <li key={client.id}>
                  <div className="alert-info">
                    <span className="alert-name">{client.name}</span>
                    <span className="dim">{formatCurrency(client.monthlyFee, settings.currency)}</span>
                  </div>
                  <div className="alert-meta">
                    <Badge tone={paid ? "success" : "warning"}>{paid ? "Pagado" : "Pendiente"}</Badge>
                    {!paid && (
                      <>
                        <button
                          className="icon-btn"
                          onClick={() => openWhatsAppReminder(client)}
                          aria-label={`Enviar recordatorio a ${client.name}`}
                        >
                          <MessageCircle size={16} />
                        </button>
                        {displayedYm === currentYearMonth() && (
                          <button className="btn btn-sm btn-secondary" onClick={() => handleMarkPaid(client)}>
                            Marcar pagado
                          </button>
                        )}
                      </>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => onOpenClient?.(client.id)}>
                      Abrir
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Modal>
      )}
    </section>
  );
}

export default Calendar;
