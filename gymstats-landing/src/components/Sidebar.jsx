import "./Sidebar.css";
import { Dumbbell, LayoutDashboard, Users, Wallet, CalendarDays, Landmark, BarChart3, Settings, X, LogOut, ClipboardCheck } from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "clients", label: "Clientes", icon: Users },
  { key: "attendance", label: "Asistencia", icon: ClipboardCheck },
  { key: "payments", label: "Pagos", icon: Wallet },
  { key: "calendar", label: "Calendario", icon: CalendarDays },
  { key: "caja", label: "Caja", icon: Landmark },
  { key: "stats", label: "Estadísticas", icon: BarChart3 },
  { key: "settings", label: "Ajustes", icon: Settings },
];

function Sidebar({ view, setView, gymName, isOpen, onClose, userEmail, onLogout }) {
  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-mark">
              <Dumbbell size={20} />
            </span>
            <span className="logo-text">{gymName?.trim() || "GymStats"}</span>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <nav className="menu">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={view === key ? "active" : ""}
              onClick={() => setView(key)}
              aria-current={view === key ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {userEmail && <p className="sidebar-user" title={userEmail}>{userEmail}</p>}
          <button className="sidebar-logout" onClick={onLogout}>
            <LogOut size={16} /> Cerrar sesión
          </button>
          <p className="version">GymStats · v1.0</p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
