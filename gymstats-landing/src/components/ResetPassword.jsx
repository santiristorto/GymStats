import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "./Login.css";

function ResetPassword() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña tiene que tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
    } catch (err) {
      setError(err.message || "No se pudo actualizar la contraseña");
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

        <h1>Nueva contraseña</h1>
        <p className="login-subtitle">Elegí una contraseña nueva para tu cuenta</p>

        <label>
          Contraseña nueva
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            minLength={6}
            autoFocus
            required
          />
        </label>

        <label>
          Repetir contraseña
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            minLength={6}
            required
          />
        </label>

        {error && <span className="field-error">{error}</span>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Guardando..." : "Guardar nueva contraseña"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
