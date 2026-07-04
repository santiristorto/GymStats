function Sidebar({ view, setView }) {
  return (
    <aside className="sidebar">

      <h2>🏋️ GymStats</h2>

      <button onClick={() => setView("dashboard")}>
        Dashboard
      </button>

      <button onClick={() => setView("clients")}>
        Clientes
      </button>

    </aside>
  )
}

export default Sidebar;