import { useState, lazy, Suspense } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./components/Dashboard";
import Clients from "./components/Clients";
import Payments from "./components/Payments";
import Calendar from "./components/Calendar";
import Caja from "./components/Caja";
import Settings from "./components/Settings";
import { ToastProvider } from "./context/ToastContext.jsx";
import { useLocalStorage } from "./hooks/useLocalStorage";
import "./App.css";

// Estadísticas depende de Recharts (pesada): se carga sólo cuando se visita esa vista.
const Stats = lazy(() => import("./components/Stats"));

const VIEWS = {
  dashboard: { label: "Dashboard", Component: Dashboard },
  clients: { label: "Clientes", Component: Clients },
  payments: { label: "Pagos", Component: Payments },
  calendar: { label: "Calendario", Component: Calendar },
  caja: { label: "Caja", Component: Caja },
  stats: { label: "Estadísticas", Component: Stats },
  settings: { label: "Ajustes", Component: Settings },
};

const DEFAULT_SETTINGS = { gymName: "GymStats", currency: "ARS" };

function App() {
  const [clients, setClients] = useLocalStorage("gymstats:clients", []);
  const [settings, setSettings] = useLocalStorage("gymstats:settings", DEFAULT_SETTINGS);
  const [view, setView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [focusClientId, setFocusClientId] = useState(null);

  const { label, Component } = VIEWS[view];

  const handleSetView = (nextView) => {
    setView(nextView);
    setSidebarOpen(false);
  };

  // Permite abrir la ficha de un cliente puntual desde el Dashboard o el Calendario.
  const openClient = (clientId) => {
    setFocusClientId(clientId);
    handleSetView("clients");
  };

  return (
    <ToastProvider>
      <div className="app-layout">
        <Sidebar
          view={view}
          setView={handleSetView}
          gymName={settings.gymName}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="app-main">
          <Topbar title={label} onMenuClick={() => setSidebarOpen(true)} />

          <main className="content">
            <Suspense fallback={<p className="dim">Cargando...</p>}>
              <Component
                clients={clients}
                setClients={setClients}
                settings={settings}
                setSettings={setSettings}
                onOpenClient={openClient}
                focusClientId={view === "clients" ? focusClientId : null}
                onFocusHandled={() => setFocusClientId(null)}
              />
            </Suspense>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;
