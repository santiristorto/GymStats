import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  DollarSign,
  Wallet,
  Landmark,
  PlusCircle,
} from "lucide-react";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import DonutChart from "./DonutChart";
import {
  getPaymentStatusCounts,
  getFinancialSummary,
  getUpcomingDueClients,
  PAYMENT_STATUS_META,
} from "../utils/clients";
import { formatCurrency } from "../utils/format";
import "./Dashboard.css";

function Dashboard({
  clients,
  settings,
  onOpenClient,
}) {
  const total = clients.length;
  const active = clients.filter((c) => c.status === "Activo").length;
  const inactive = total - active;

  const { expected, collected, pending } = getFinancialSummary(clients);
  const segments = getPaymentStatusCounts(clients).filter((s) => s.value > 0);

  const dueList = getUpcomingDueClients(clients);
  const overdueCount = dueList.filter((r) => r.daysLeft < 0).length;
  const dueTodayCount = dueList.filter((r) => r.daysLeft === 0).length;
  const dueThisWeekCount = dueList.filter((r) => r.daysLeft >= 1 && r.daysLeft <= 7).length;

  const groups = [
    { key: "hoy", label: "Hoy", rows: dueList.filter((r) => r.daysLeft === 0) },
    { key: "manana", label: "Mañana", rows: dueList.filter((r) => r.daysLeft === 1) },
    { key: "semana", label: "Próximos 7 días", rows: dueList.filter((r) => r.daysLeft >= 2 && r.daysLeft <= 7) },
  ];


  if (total === 0) {
    return (
      <section className="dashboard">
        <h1>Dashboard</h1>
        <EmptyState
          icon={PlusCircle}
          title="Bienvenido a GymStats"
          description="Todavía no cargaste ningún socio. Andá a Clientes para agregar el primero, o probá el panel con datos de ejemplo."
          action={
    <button
      className="btn btn-primary"
      onClick={() => onOpenClient?.()}
    >
      Agregar primer cliente
    </button>
}
        />
      </section>
    );
  }

  return (
    <section className="dashboard">
      <div className="page-title">
    <h1>
        Bienvenido a {settings.gymName}
    </h1>

    <p className="dim">
        Resumen general del gimnasio
    </p>
</div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">
            <Users size={20} />
          </div>
          <span className="card-label">Total clientes</span>
          <strong className="card-value">{total}</strong>
        </div>

        <div className="dashboard-card">
          <div className="card-icon success">
            <UserCheck size={20} />
          </div>
          <span className="card-label">Activos</span>
          <strong className="card-value">{active}</strong>
        </div>

        <div className="dashboard-card">
          <div className="card-icon muted">
            <UserX size={20} />
          </div>
          <span className="card-label">Inactivos</span>
          <strong className="card-value">{inactive}</strong>
        </div>

        <div className="dashboard-card">
          <div className="card-icon danger">
            <AlertTriangle size={20} />
          </div>
          <span className="card-label">Cuotas vencidas</span>
          <strong className="card-value">{overdueCount}</strong>
        </div>

        <div className="dashboard-card">
          <div className="card-icon warning">
            <CalendarClock size={20} />
          </div>
          <span className="card-label">Vencen hoy</span>
          <strong className="card-value">{dueTodayCount}</strong>
        </div>

        <div className="dashboard-card">
          <div className="card-icon info">
            <CalendarDays size={20} />
          </div>
          <span className="card-label">Vencen esta semana</span>
          <strong className="card-value">{dueThisWeekCount}</strong>
        </div>

        <div className="dashboard-card income">
          <div className="card-icon primary">
            <DollarSign size={20} />
          </div>
          <span className="card-label">Ingreso esperado</span>
          <strong className="card-value">{formatCurrency(expected, settings.currency)}</strong>
        </div>

        <div className="dashboard-card">
          <div className="card-icon success">
            <Wallet size={20} />
          </div>
          <span className="card-label">Ingreso cobrado</span>
          <strong className="card-value">{formatCurrency(collected, settings.currency)}</strong>
        </div>

        <div className="dashboard-card">
          <div className="card-icon danger">
            <Landmark size={20} />
          </div>
          <span className="card-label">Pendiente de cobro</span>
          <strong className="card-value">{formatCurrency(pending, settings.currency)}</strong>
        </div>
      </div>
      <div className="dashboard-card">
  <div className="card-icon info">
    <Users size={20} />
  </div>

  <span className="card-label">
    Clientes al día
  </span>

  <strong className="card-value">
    {segments.find(s => s.key === "aldia")?.value || 0}
  </strong>
</div>


      <div className="dashboard-panels">
        <div className="panel">
          <h2>Estado de pagos</h2>
          {segments.length === 0 ? (
            <p className="dim">No hay socios activos todavía.</p>
          ) : (
            <div className="donut-panel">
              <DonutChart segments={segments.map((s) => ({ key: s.key, value: s.value, color: s.color }))} />
              <ul className="donut-legend">
                {segments.map((s) => (
                  <li key={s.key}>
                    <span className="dot" style={{ background: s.color }} />
                    {s.name} · {s.value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="panel">
          <h2>Próximos vencimientos</h2>
          {dueList.length === 0 ? (
            <p className="dim">No hay cuotas vencidas ni por vencer. Todo al día.</p>
          ) : (
            <div className="due-groups">
              {groups.map(
                (group) =>
                  group.rows.length > 0 && (
                    <div key={group.key} className="due-group">
                      <h3>{group.label}</h3>
                      <ul className="alert-list">
                        {group.rows.map(({ client, status }) => (
                          <li key={client.id}>
                            <div className="alert-info">
                              <span className="alert-name">{client.name}</span>
                              <span className="dim">{formatCurrency(client.monthlyFee, settings.currency)}</span>
                            </div>
                            <div className="alert-meta">
                              <Badge tone={PAYMENT_STATUS_META[status].color}>{PAYMENT_STATUS_META[status].label}</Badge>
                              <button className="btn btn-ghost btn-sm" onClick={() => onOpenClient?.(client.id)}>
                                Abrir
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Dashboard;

