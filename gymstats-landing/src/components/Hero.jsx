function Hero() {
  return (
    <section style={styles.hero}>
      <h1>Gestioná tu gimnasio con GymStats</h1>
      <p>Control de clientes, pagos y asistencia en un solo lugar</p>
      <button style={styles.button}>Empezar</button>
    </section>
  )
}

const styles = {
  hero: {
    padding: "80px 40px",
    textAlign: "center",
  },
  button: {
    padding: "10px 20px",
    marginTop: "20px",
    cursor: "pointer",
  }
}

export default Hero