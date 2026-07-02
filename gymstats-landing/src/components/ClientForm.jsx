function ClientForm({ name, setName, onAdd, onSave, editingId }) {
  return (
    <div style={styles.form}>
      <input
        type="text"
        placeholder="Nombre del cliente"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {editingId ? (
        <button onClick={onSave}>Guardar</button>
      ) : (
        <button onClick={onAdd}>Agregar</button>
      )}
    </div>
  )
}

const styles = {
  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  }
}

export default ClientForm