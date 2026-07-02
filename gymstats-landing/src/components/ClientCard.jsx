function ClientCard({ client, onEdit, onDelete }) {
  return (
    <div style={styles.card}>
      <h3>{client.name}</h3>
      <p>Estado: {client.status}</p>

      <div style={styles.buttons}>
        <button onClick={() => onEdit(client)}>Editar</button>
        <button onClick={() => onDelete(client.id)}>Eliminar</button>
      </div>
    </div>
  )
}

const styles = {
  card: {
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    minWidth: "180px",
  },
  buttons: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  }
}

export default ClientCard