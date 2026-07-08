import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, UserRound, MessageCircle } from "lucide-react";
import ClientModal from "./ClientModal";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import ExportButtons from "./ExportButtons";
import { useConfirm } from "../hooks/useConfirm";
import { useToast } from "../hooks/useToast";
import { createEmptyClient, getPaymentStatus, PAYMENT_STATUS_META, findDuplicateClient } from "../utils/clients";
import { formatCurrency } from "../utils/format";
import { openWhatsAppReminder } from "../utils/whatsapp";
import "./Clients.css";
import {
  addClient,
  editClient,
  deleteClient,
} from "../services/clientService";

function Clients({
  clients,
  setClients,
  settings,
  gym,
  focusClientId,
  onFocusHandled,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [paymentFilter, setPaymentFilter] = useState("todos");
  const [modalState, setModalState] = useState(null); // { mode: "create" | "edit", data }
  const [handledFocusId, setHandledFocusId] = useState(null);
  const [confirm, confirmDialog] = useConfirm();
  const { showToast } = useToast();

  // Si venimos de "Abrir" en Dashboard/Calendario, abrimos directamente la ficha del cliente.
  // (patrón recomendado por React para ajustar estado ante un cambio de prop, sin useEffect)
  if (focusClientId && focusClientId !== handledFocusId) {
    setHandledFocusId(focusClientId);
    const client = clients.find((c) => c.id === focusClientId);
    if (client) setModalState({ mode: "edit", data: { ...client } });
    onFocusHandled?.();
  }

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clients
      .filter((c) => {
        if (!term) return true;
        return (
          c.name.toLowerCase().includes(term) ||
          (c.phone || "").toLowerCase().includes(term) ||
          (c.email || "").toLowerCase().includes(term)
        );
      })
      .filter((c) => (statusFilter === "todos" ? true : c.status === statusFilter))
      .filter((c) => (paymentFilter === "todos" ? true : getPaymentStatus(c) === paymentFilter))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, search, statusFilter, paymentFilter]);

  const openCreate = () => setModalState({ mode: "create", data: createEmptyClient() });
  const openEdit = (client) => setModalState({ mode: "edit", data: { ...client } });
  const closeModal = () => setModalState(null);

  const handleSave = async (form) => {
    try {
      const normalized = {
        ...form,
        monthlyFee: Number(form.monthlyFee) || 0,
        paymentDay: Number(form.paymentDay) || 1,
      };

      const excludeId = modalState.mode === "edit" ? normalized.id : null;
      const duplicate = findDuplicateClient(clients, normalized, excludeId);
      if (duplicate) {
        const ok = await confirm({
          title: "Posible cliente duplicado",
          message: `Ya existe "${duplicate.name}" con el mismo teléfono o email. ¿Querés guardar igual?`,
          confirmLabel: "Guardar igual",
          tone: "primary",
        });
        if (!ok) return;
      }

      if (modalState.mode === "create") {
        const newClient = await addClient(normalized, gym.id);
        setClients((prev) => [...prev, newClient]);
        showToast("Cliente agregado correctamente");
      } else {
        const updatedClient = await editClient(normalized.id, normalized);
        setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
        showToast("Cliente actualizado");
      }

      closeModal();
    } catch (error) {
      console.error(error);
      showToast(error.message || "Error al guardar el cliente", "danger");
    }
  };
  const handleDelete = async (client) => {
  const ok = await confirm({
    title: "Eliminar cliente",
    message: `¿Seguro que querés eliminar a ${client.name}?`,
    confirmLabel: "Eliminar",
    tone: "danger",
  });

  if (!ok) return;

  try {
    await deleteClient(client.id);

    setClients((prev) =>
      prev.filter((c) => c.id !== client.id)
    );

    showToast("Cliente eliminado");
  } catch (error) {
    console.error(error);
    showToast(error.message || "No se pudo eliminar", "danger");
  }
};

  const loadDemo = () => {
  showToast(
    "Los datos de ejemplo se agregarán desde Supabase en la próxima versión.",
    "warning"
  );
};

  return (
    <section className="clients-page">
      <div className="page-head">
        <div>
          <h1>Clientes</h1>
          <p className="page-subtitle">
            {clients.length} {clients.length === 1 ? "socio registrado" : "socios registrados"}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Nuevo cliente
        </button>
      </div>

      {clients.length > 0 && (
        <div className="clients-toolbar-row">
          <div className="toolbar">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="Activo">Activos</option>
              <option value="Inactivo">Inactivos</option>
            </select>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="todos">Todos los pagos</option>
              {Object.entries(PAYMENT_STATUS_META)
                .filter(([key]) => key !== "inactivo")
                .map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
            </select>
          </div>
          <ExportButtons
            filename="gymstats-clientes"
            columns={[
              { key: "name", label: "Nombre" },
              { key: "phone", label: "Teléfono" },
              { key: "email", label: "Email" },
              { key: "plan", label: "Plan" },
              { key: "monthlyFee", label: "Cuota" },
              { key: "paymentDay", label: "Día de pago" },
              { key: "status", label: "Estado" },
            ]}
            rows={filteredClients}
          />
        </div>
      )}

      {clients.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="Todavía no cargaste clientes"
          description="Agregá tu primer socio o probá con datos de ejemplo para ver cómo funciona el panel."
          action={
            <div className="empty-actions">
              <button className="btn btn-primary" onClick={openCreate}>
                <Plus size={16} /> Nuevo cliente
              </button>
              <button className="btn btn-ghost" onClick={loadDemo}>
                Cargar datos de ejemplo
              </button>
            </div>
          }
        />
      ) : filteredClients.length === 0 ? (
        <EmptyState title="Sin resultados" description="No encontramos clientes que coincidan con la búsqueda." />
      ) : (
        <div className="table-wrap">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Plan</th>
                <th>Cuota</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th aria-label="Acciones"></th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => {
                const paymentStatus = getPaymentStatus(client);
                const meta = PAYMENT_STATUS_META[paymentStatus];
                return (
                  <tr key={client.id}>
                    <td data-label="Nombre">
                      <div className="client-name-cell">
                        <span className="avatar">{client.name.charAt(0).toUpperCase()}</span>
                        {client.name}
                      </div>
                    </td>
                    <td data-label="Contacto">
                      <div className="contact-cell">
                        <span>{client.phone || "—"}</span>
                        <span className="dim">{client.email || "—"}</span>
                      </div>
                    </td>
                    <td data-label="Plan">{client.plan || "—"}</td>
                    <td data-label="Cuota">{formatCurrency(client.monthlyFee, settings.currency)}</td>
                    <td data-label="Vencimiento">
                      <div className="due-cell">
                        <span>Día {client.paymentDay || "—"}</span>
                        <Badge tone={meta.color}>{meta.label}</Badge>
                      </div>
                    </td>
                    <td data-label="Estado">
                      <Badge tone={client.status === "Activo" ? "success" : "muted"}>{client.status}</Badge>
                    </td>
                    <td data-label="Acciones">
                      <div className="row-actions">
                        {client.phone && (
                          <button
                            className="icon-btn"
                            onClick={() => openWhatsAppReminder(client)}
                            aria-label={`Enviar recordatorio a ${client.name}`}
                            title="Enviar recordatorio por WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </button>
                        )}
                        <button className="icon-btn" onClick={() => openEdit(client)} aria-label={`Editar ${client.name}`}>
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-btn icon-btn-danger"
                          onClick={() => handleDelete(client)}
                          aria-label={`Eliminar ${client.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalState && (
        <ClientModal
          title={modalState.mode === "create" ? "Nuevo cliente" : "Editar cliente"}
          initialData={modalState.data}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
      {confirmDialog}
    </section>
  );
}

export default Clients;
