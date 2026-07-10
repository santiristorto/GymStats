import { useRef, useState } from "react";
import { Download, Upload, Trash2, Save, CreditCard } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { useConfirm } from "../hooks/useConfirm";
import { replaceAllClients, deleteAllClients } from "../services/clientService";
import { updateGym } from "../services/gymService";
import NotificationSettings from "./NotificationSettings";
import "./Settings.css";

const CURRENCIES = ["ARS", "USD", "EUR", "MXN", "CLP", "UYU"];

function Settings({ clients, refreshClients, settings, setSettings, gym, setGym }) {
  const fileInputRef = useRef(null);
  const { showToast } = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [mpToken, setMpToken] = useState(gym.mp_access_token || "");
  const [savingMp, setSavingMp] = useState(false);

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingGeneral(true);
    try {
      const updated = await updateGym(gym.id, { name: settings.gymName, currency: settings.currency });
      setGym(updated);
      showToast("Ajustes guardados");
    } catch (error) {
      console.error(error);
      showToast(error.message || "No se pudieron guardar los ajustes", "danger");
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSaveMp = async (e) => {
    e.preventDefault();
    setSavingMp(true);
    try {
      const updated = await updateGym(gym.id, { mp_access_token: mpToken.trim() });
      setGym(updated);
      setMpToken(updated.mp_access_token || "");
      showToast("Credencial de Mercado Pago guardada");
    } catch (error) {
      console.error(error);
      showToast(error.message || "No se pudo guardar la credencial", "danger");
    } finally {
      setSavingMp(false);
    }
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
        message: `Se van a reemplazar los ${clients.length} clientes actuales en Supabase por ${data.clients.length} del archivo. ¿Continuar?`,
        confirmLabel: "Restaurar",
        tone: "danger",
      });
      if (!ok) return;

      await replaceAllClients(data.clients, gym.id);
      await refreshClients();
      showToast("Backup restaurado correctamente");
    } catch (error) {
      console.error(error);
      showToast(error.message || "No se pudo leer el archivo. Verificá que sea un backup válido.", "danger");
    }
  };

  const handleReset = async () => {
    const ok = await confirm({
      title: "Borrar todos los datos",
      message: "Esta acción va a eliminar todos los clientes guardados en Supabase. No se puede deshacer.",
      confirmLabel: "Borrar todo",
      tone: "danger",
    });
    if (!ok) return;

    try {
      await deleteAllClients(gym.id);
      await refreshClients();
      showToast("Datos eliminados", "danger");
    } catch (error) {
      console.error(error);
      showToast(error.message || "No se pudieron borrar los datos", "danger");
    }
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
        <button type="submit" className="btn btn-primary" disabled={savingGeneral}>
          <Save size={16} /> {savingGeneral ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <form className="settings-card" onSubmit={handleSaveMp}>
        <h2>Mercado Pago</h2>
        <p className="settings-note">
          Pegá acá tu <strong>Access Token</strong> de producción (Mercado Pago → Tu negocio → Configuración →
          Credenciales). Se usa solo del lado del servidor (Edge Function) para generar los links de cobro, nunca
          se envía al navegador de tus clientes.
        </p>
        {gym.mp_access_token && (
          <p className="settings-note mp-configured">✓ Ya tenés una credencial guardada para este gimnasio.</p>
        )}
        <div className="form-grid">
          <label className="full-width">
            Access Token
            <input
              type="password"
              value={mpToken}
              onChange={(e) => setMpToken(e.target.value)}
              placeholder="APP_USR-xxxxxxxxxxxxxxxx"
            />
          </label>
        </div>
        <button type="submit" className="btn btn-secondary" disabled={savingMp}>
          <CreditCard size={16} /> {savingMp ? "Guardando..." : "Guardar credencial"}
        </button>
      </form>

      <div className="settings-card">
        <h2>Respaldo de datos</h2>
        <p className="settings-note">
          GymStats guarda toda la información en Supabase. Igual, descargá una copia
          periódicamente como respaldo adicional por si necesitás restaurar datos.
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

      <NotificationSettings gym={gym} />

      <div className="settings-card danger-zone">
        <h2>Zona de riesgo</h2>
        <p className="settings-note">Elimina permanentemente todos los clientes guardados en Supabase.</p>
        <button className="btn btn-danger" onClick={handleReset}>
          <Trash2 size={16} /> Borrar todos los datos
        </button>
      </div>

      {confirmDialog}
    </section>
  );
}

export default Settings;
