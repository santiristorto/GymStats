import { useRef } from "react";
import { Download, Upload, Trash2, Save } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { useConfirm } from "../hooks/useConfirm";
import "./Settings.css";

const CURRENCIES = ["ARS", "USD", "EUR", "MXN", "CLP", "UYU"];

function Settings({ clients, setClients, settings, setSettings }) {
  const fileInputRef = useRef(null);
  const { showToast } = useToast();
  const [confirm, confirmDialog] = useConfirm();

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    showToast("Ajustes guardados");
  };

  const handleExport = () => {
    const payload = { settings, clients, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gymstats-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup descargado");
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data.clients)) throw new Error("Formato inválido");

      const ok = await confirm({
        title: "Restaurar backup",
        message: `Se van a reemplazar los ${clients.length} clientes actuales por ${data.clients.length} del archivo. ¿Continuar?`,
        confirmLabel: "Restaurar",
        tone: "danger",
      });
      if (!ok) return;

      setClients(data.clients);
      if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
      showToast("Backup restaurado correctamente");
    } catch {
      showToast("No se pudo leer el archivo. Verificá que sea un backup válido.", "danger");
    }
  };

  const handleReset = async () => {
    const ok = await confirm({
      title: "Borrar todos los datos",
      message: "Esta acción va a eliminar todos los clientes guardados en este navegador. No se puede deshacer.",
      confirmLabel: "Borrar todo",
      tone: "danger",
    });
    if (!ok) return;
    setClients([]);
    showToast("Datos eliminados", "danger");
  };

  return (
    <section className="settings-page">
      <div className="page-head">
        <div>
          <h1>Ajustes</h1>
          <p className="page-subtitle">Configuración general y respaldo de datos</p>
        </div>
      </div>

      <form className="settings-card" onSubmit={handleSaveSettings}>
        <h2>General</h2>
        <div className="form-grid">
          <label>
            Nombre del gimnasio
            <input name="gymName" value={settings.gymName} onChange={handleSettingsChange} />
          </label>
          <label>
            Moneda
            <select name="currency" value={settings.currency} onChange={handleSettingsChange}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" className="btn btn-primary">
          <Save size={16} /> Guardar cambios
        </button>
      </form>

      <div className="settings-card">
        <h2>Respaldo de datos</h2>
        <p className="settings-note">
          GymStats guarda toda la información en este navegador (no hay servidor ni base de datos todavía).
          Descargá una copia periódicamente para no perder datos si cambiás de equipo o borrás el caché.
        </p>
        <div className="settings-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={16} /> Descargar backup
          </button>
          <button className="btn btn-ghost" onClick={handleImportClick}>
            <Upload size={16} /> Restaurar backup
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImportFile} />
        </div>
      </div>

      <div className="settings-card danger-zone">
        <h2>Zona de riesgo</h2>
        <p className="settings-note">Elimina permanentemente todos los clientes cargados en este navegador.</p>
        <button className="btn btn-danger" onClick={handleReset}>
          <Trash2 size={16} /> Borrar todos los datos
        </button>
      </div>

      {confirmDialog}
    </section>
  );
}

export default Settings;
