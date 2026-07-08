import { useState, useEffect, lazy, Suspense } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./components/Login";
import ResetPassword from "./components/ResetPassword";
import CreateGym from "./components/CreateGym";
import Dashboard from "./components/Dashboard";
import Clients from "./components/Clients";
import Attendance from "./components/Attendance";
import Payments from "./components/Payments";
import Calendar from "./components/Calendar";
import Caja from "./components/Caja";
import Settings from "./components/Settings";
import { ToastProvider } from "./context/ToastContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { GymProvider } from "./context/GymContext.jsx";
import { useAuth } from "./hooks/useAuth";
import { useGym } from "./hooks/useGym";
import { getClients } from "./services/clientService";
import "./App.css";

const Stats = lazy(() => import("./components/Stats"));

const VIEWS = {
  dashboard: { label: "Dashboard", Component: Dashboard },
  clients: { label: "Clientes", Component: Clients },
  attendance: { label: "Asistencia", Component: Attendance },
  payments: { label: "Pagos", Component: Payments },
  calendar: { label: "Calendario", Component: Calendar },
  caja: { label: "Caja", Component: Caja },
  stats: { label: "Estadísticas", Component: Stats },
  settings: { label: "Ajustes", Component: Settings },
};

function AppShell() {
  const { user, logout } = useAuth();
  const { gym, setGym } = useGym();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [focusClientId, setFocusClientId] = useState(null);

  // Deriva las "settings" que ya usan todos los componentes (gymName/currency)
  // a partir del gimnasio actual, en vez de guardarlas sueltas en localStorage.
  const settings = { gymName: gym.name, currency: gym.currency || "ARS" };
  const setSettings = (updater) => {
    const next = typeof updater === "function" ? updater(settings) : updater;
    setGym((prev) => ({ ...prev, name: next.gymName, currency: next.currency }));
  };

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await getClients(gym.id);
      setClients(data || []);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial de clientes desde Supabase al montar la app.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gym.id]);

  const refreshClients = async () => {
    await loadClients();
  };

  const handleSetView = (newView) => {
    setView(newView);
    setSidebarOpen(false);
  };

  const openClient = (clientId) => {
    setFocusClientId(clientId);
    handleSetView("clients");
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <h2>Cargando GymStats...</h2>
      </div>
    );
  }

  const { label, Component } = VIEWS[view];

  return (
    <ToastProvider>
      <div className="app-layout">
        <Sidebar
          view={view}
          setView={handleSetView}
          gymName={settings.gymName}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userEmail={user?.email}
          onLogout={logout}
        />

        <div className="app-main">
          <Topbar title={label} onMenuClick={() => setSidebarOpen(true)} />

          <main className="content">
            <Suspense fallback={<p>Cargando...</p>}>
              <Component
                clients={clients}
                setClients={setClients}
                refreshClients={refreshClients}
                settings={settings}
                setSettings={setSettings}
                gym={gym}
                setGym={setGym}
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

function GymGate() {
  const { gym, gymLoading, gymError, setGym } = useGym();

  if (gymLoading) {
    return (
      <div className="loading-screen">
        <h2>Cargando GymStats...</h2>
      </div>
    );
  }

  if (gymError) {
    return (
      <div className="loading-screen">
        <h2>No se pudo cargar tu gimnasio</h2>
        <p>{gymError}</p>
      </div>
    );
  }

  if (!gym) {
    return <CreateGym onCreated={setGym} />;
  }

  return <AppShell />;
}

function AuthGate() {
  const { user, authLoading, passwordRecovery } = useAuth();

  if (authLoading) {
    return (
      <div className="loading-screen">
        <h2>Cargando GymStats...</h2>
      </div>
    );
  }

  // Prioridad: si viene del link de "restablecer contraseña" del mail,
  // mostramos esa pantalla sin importar si ya hay una sesión activa.
  if (passwordRecovery) return <ResetPassword />;

  if (!user) return <Login />;

  return (
    <GymProvider>
      <GymGate />
    </GymProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
