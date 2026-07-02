import { useState } from "react"
import ClientCard from "./ClientCard"
import ClientForm from "./ClientForm"

function Clients({ clients, setClients }) {
  const [name, setName] = useState("")
  const [editingId, setEditingId] = useState(null)

  const addClient = () => {
    if (name.trim() === "") return

    setClients([
      ...clients,
      { id: Date.now(), name, status: "Activo" }
    ])

    setName("")
  }

  const deleteClient = (id) => {
    setClients(clients.filter(c => c.id !== id))
  }

  const startEdit = (client) => {
    setName(client.name)
    setEditingId(client.id)
  }

  const saveEdit = () => {
    setClients(
      clients.map(c =>
        c.id === editingId ? { ...c, name } : c
      )
    )

    setName("")
    setEditingId(null)
  }

  return (
    <section style={styles.container}>
      <h2>Clientes</h2>

      <ClientForm
        name={name}
        setName={setName}
        onAdd={addClient}
        onSave={saveEdit}
        editingId={editingId}
      />

      <div style={styles.list}>
        {clients.map(client => (
          <ClientCard
            key={client.id}
            client={client}
            onEdit={startEdit}
            onDelete={deleteClient}
          />
        ))}
      </div>
    </section>
  )
}

const styles = {
  container: { padding: "40px" },
  list: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  }
}

export default Clients