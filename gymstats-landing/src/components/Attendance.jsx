import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import EmptyState from "./EmptyState";
import { useToast } from "../hooks/useToast";
import { checkIn, getTodayAttendance } from "../services/attendanceService";
import "./Attendance.css";

function Attendance({ clients, gym }) {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadToday = async () => {
    try {
      setLoading(true);
      const data = await getTodayAttendance(gym.id);
      setTodayAttendance(data);
    } catch (error) {
      console.error(error);
      showToast(error.message || "No se pudo cargar la asistencia de hoy", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkedInIds = useMemo(() => new Set(todayAttendance.map((a) => a.client_id)), [todayAttendance]);

  const activeClients = clients.filter((c) => c.status === "Activo");
  const term = search.trim().toLowerCase();
  const filtered = term ? activeClients.filter((c) => c.name.toLowerCase().includes(term)) : [];

  const handleCheckIn = async (client) => {
    try {
      const record = await checkIn(client.id, gym.id);
      setTodayAttendance((prev) => [record, ...prev]);
      showToast(`Entrada registrada: ${client.name}`);
    } catch (error) {
      console.error(error);
      showToast(error.message || "No se pudo registrar la entrada", "danger");
    }
  };

  const clientName = (clientId) => clients.find((c) => c.id === clientId)?.name || "Cliente eliminado";

  return (
    <section className="attendance-page">
      <div className="page-head">
        <div>
          <h1>Asistencia</h1>
          <p className="page-subtitle">{todayAttendance.length} check-ins hoy</p>
        </div>
      </div>

      {activeClients.length === 0 ? (
        <EmptyState
          title="No hay socios activos"
          description="Agregá clientes activos en la sección Clientes para poder registrar su asistencia."
        />
      ) : (
        <>
          <div className="toolbar">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar cliente para marcar entrada..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {term && (
            <div className="attendance-results">
              {filtered.length === 0 ? (
                <p className="dim">No encontramos clientes activos con ese nombre.</p>
              ) : (
                <ul className="attendance-list">
                  {filtered.map((client) => {
                    const already = checkedInIds.has(client.id);
                    return (
                      <li key={client.id}>
                        <span>{client.name}</span>
                        <button
                          className="btn btn-sm btn-secondary"
                          disabled={already}
                          onClick={() => handleCheckIn(client)}
                        >
                          {already ? "Ya registrado hoy" : "Marcar entrada"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          <h2 className="section-title">Asistencia de hoy</h2>
          {loading ? (
            <p className="dim">Cargando...</p>
          ) : todayAttendance.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Todavía no hay check-ins hoy"
              description="Buscá un cliente arriba para marcar su entrada."
            />
          ) : (
            <div className="table-wrap">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAttendance.map((a) => (
                    <tr key={a.id}>
                      <td data-label="Cliente">{clientName(a.client_id)}</td>
                      <td data-label="Hora">
                        {new Date(a.checked_in_at).toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Attendance;
