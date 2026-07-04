function ClientCard({ client, onEdit, onDelete }) {
  return (
    <div style={styles.card}>
      <h3>{client.name}</h3>
      <p>Estado: {client.status}</p>

      <div style={styles.buttonedit}>
       <button className="buttonedit" onClick={() => onEdit(client)}>Editar</button>
      </div>
      <div style={styles.buttondel}>
        <button className="buttondel" onClick={() => onDelete(client.id)}>Eliminar</button>
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
  }

export default ClientCard