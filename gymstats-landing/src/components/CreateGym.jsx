import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { createGym } from "../services/gymService";
import "./Login.css";

const CURRENCIES = ["ARS", "USD", "EUR", "MXN", "CLP", "UYU"];

function CreateGym({ onCreated }) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("ARS");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Ingresá el nombre de tu gimnasio");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const gym = await createGym({ name: name.trim(), currency });
      onCreated(gym);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo crear el gimnasio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <span className="logo-mark">
            <Dumbbell size={22} />
          </span>
          <span className="logo-text">GYMSTATS</span>
        </div>

        <h1>Creá tu gimnasio</h1>
        <p className="login-subtitle">Último paso antes de empezar a cargar clientes</p>

        <label>
          Nombre del gimnasio
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: PowerGym Villa María"
            autoFocus
            required
          />
        </label>

        <label>
          Moneda
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {error && <span className="field-error">{error}</span>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creando..." : "Crear gimnasio"}
        </button>
      </form>
    </div>
  );
}

export default CreateGym;
