import { Dumbbell } from "lucide-react";
import "./LoadingScreen.css";

function LoadingScreen({ title = "Cargando GymStats...", subtitle }) {
  return (
    <div className="loading-screen">
      <span className="loading-logo">
        <Dumbbell size={22} />
      </span>
      <div className="loading-spinner" aria-hidden="true" />
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

export default LoadingScreen;
