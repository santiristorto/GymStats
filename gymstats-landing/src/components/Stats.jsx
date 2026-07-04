import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import EmptyState from "./EmptyState";
import { getMonthlyIncome, getMonthlyNewClients, getStatusCounts, getPaymentStatusCounts } from "../utils/clients";
import { formatCurrency } from "../utils/format";
import "./Stats.css";

const tooltipStyle = {
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border-strong)",
  borderRadius: 8,
  color: "var(--color-text)",
  fontSize: 13,
};

function Stats({ clients, settings }) {
  if (clients.length === 0) {
    return (
      <section className="stats-page">
        <h1>Estadísticas</h1>
        <EmptyState title="Todavía no hay datos" description="Cargá clientes para ver las estadísticas del gimnasio." />
      </section>
    );
  }

  const monthlyIncome = getMonthlyIncome(clients, 6);
  const monthlyNewClients = getMonthlyNewClients(clients, 6);
  const statusCounts = getStatusCounts(clients);
  const paymentStatusCounts = getPaymentStatusCounts(clients).filter((s) => s.value > 0);

  return (
    <section className="stats-page">
      <h1>Estadísticas</h1>

      <div className="stats-grid">
        <div className="panel">
          <h2>Ingresos por mes</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyIncome}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" stroke="var(--color-text-dim)" fontSize={12} />
              <YAxis stroke="var(--color-text-dim)" fontSize={12} width={70} tickFormatter={(v) => formatCurrency(v, settings.currency)} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [formatCurrency(value, settings.currency), "Ingresos"]}
              />
              <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h2>Clientes nuevos por mes</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyNewClients}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" stroke="var(--color-text-dim)" fontSize={12} />
              <YAxis stroke="var(--color-text-dim)" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, "Clientes nuevos"]} />
              <Bar dataKey="nuevos" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h2>Clientes activos vs. inactivos</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusCounts} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {statusCounts.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="stats-legend">
            {statusCounts.map((s) => (
              <li key={s.name}>
                <span className="dot" style={{ background: s.color }} />
                {s.name} · {s.value}
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h2>Cobros por mes</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyIncome}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" stroke="var(--color-text-dim)" fontSize={12} />
              <YAxis stroke="var(--color-text-dim)" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, "Cobros"]} />
              <Bar dataKey="cobros" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel stats-panel-wide">
          <h2>Morosidad (clientes activos)</h2>
          {paymentStatusCounts.length === 0 ? (
            <p className="dim">No hay socios activos todavía.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={paymentStatusCounts} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {paymentStatusCounts.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="stats-legend">
                {paymentStatusCounts.map((s) => (
                  <li key={s.key}>
                    <span className="dot" style={{ background: s.color }} />
                    {s.name} · {s.value}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default Stats;
