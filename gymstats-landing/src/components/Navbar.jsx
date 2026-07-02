function Navbar() {
  return (
    <nav style={styles.nav}>
      <h2>GymStats</h2>

      <div style={styles.links}>
        <a href="#">Inicio</a>
        <a href="#">Clientes</a>
        <a href="#">Pagos</a>
        <a href="#">Contacto</a>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    backgroundColor: "#111",
    color: "white",
  },
  links: {
    display: "flex",
    gap: "20px",
  }
}

export default Navbar