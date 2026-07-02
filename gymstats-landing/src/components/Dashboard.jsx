function Dashboard({ clients }) {
  const total = clients.length
  const active = clients.filter(c => c.status === "Activo").length
  const inactive = clients.filter(c => c.status === "Inactivo").length
  const percentActive = total === 0 ? 0 : Math.round((active / total) * 100)

  return (
    <section style={styles.container}>
      <h2>Dashboard</h2>

      <div style={styles.cards}>
        <div className="card">
          <h3>Total clientes</h3>
          <p>{total}</p>
        </div>

        <div className="card">
          <h3>Activos</h3>
          <p>{active}</p>
        </div>

        <div className="card">
          <h3>Inactivos</h3>
          <p>{inactive}</p>
        </div>

        <div className="card">
              <h3>% Activos</h3>
          <p>{percentActive}%</p>
        </div>
      </div>
    </section>
  )
}

const styles = {
  container: {
    padding: "40px",
  },
  cards: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  card: {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    minWidth: "150px",
  }
}

export default Dashboard