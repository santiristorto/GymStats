import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "./Login.css";

function Login() {
  const { login, signup, resetPassword } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setInfo("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else if (mode === "signup") {
        const { needsEmailConfirmation } = await signup(email, password);
        if (needsEmailConfirmation) {
          setInfo("¡Listo! Te mandamos un email para confirmar tu cuenta. Confirmalo y volvé a iniciar sesión.");
          setMode("login");
        }
        // Si no hace falta confirmar, el propio AuthContext detecta la sesión
        // y la app sigue directo a la pantalla de "creá tu gimnasio".
      } else if (mode === "forgot") {
        await resetPassword(email);
        setInfo("Te mandamos un email con un link para elegir una contraseña nueva.");
      }
    } catch (err) {
      if (mode === "login") setError("Email o contraseña incorrectos.");
      else if (mode === "signup") setError(err.message || "No se pudo crear la cuenta.");
      else setError(err.message || "No se pudo enviar el mail de recuperación.");
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    login: ["Iniciar sesión", "Accedé al panel de tu gimnasio"],
    signup: ["Crear cuenta", "Registrate para empezar a usar GymStats"],
    forgot: ["Recuperar contraseña", "Te mandamos un link a tu email para elegir una nueva"],
  };
  const [title, subtitle] = titles[mode];

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <span className="logo-mark">
            <Dumbbell size={22} />
          </span>
          <span className="logo-text">GYMSTATS</span>
        </div>

        <h1>{title}</h1>
        <p className="login-subtitle">{subtitle}</p>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@gimnasio.com"
            autoFocus
            required
          />
        </label>

        {mode !== "forgot" && (
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </label>
        )}

        {error && <span className="field-error">{error}</span>}
        {info && <span className="login-info">{info}</span>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading
            ? "Un momento..."
            : mode === "login"
              ? "Ingresar"
              : mode === "signup"
                ? "Crear cuenta"
                : "Mandar link de recuperación"}
        </button>

        {mode === "login" && (
          <button type="button" className="login-toggle" onClick={() => switchMode("forgot")}>
            ¿Olvidaste tu contraseña?
          </button>
        )}

        <button type="button" className="login-toggle" onClick={() => switchMode(mode === "login" ? "signup" : "login")}>
          {mode === "signup" ? "¿Ya tenés cuenta? Iniciá sesión" : mode === "forgot" ? "Volver a iniciar sesión" : "¿No tenés cuenta? Registrate"}
        </button>
      </form>
    </div>
  );
}

export default Login;
