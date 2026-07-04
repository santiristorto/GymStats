import { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import Dashboard from "./components/Dashboard"
import Clients from "./components/Clients"
import Sidebar from "./components/Sidebar"

function App() {
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem("clients")
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem("clients", JSON.stringify(clients))
  }, [clients])

  const [view, setView] = useState("dashboard")
  return(<div className="app-layout">

  <Sidebar
    view={view}
    setView={setView}
  />

  <main className="content">

    {view === "dashboard" && (
      <Dashboard clients={clients} />
    )}

    {view === "clients" && (
      <Clients
        clients={clients}
        setClients={setClients}
      />
    )}

  </main>

</div>
)
}

export default App