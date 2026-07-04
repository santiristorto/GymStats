import "./Topbar.css";
import { Menu } from "lucide-react";

function Topbar({ title, onMenuClick }) {
  return (
    <header className="topbar">
      <button className="topbar-menu" onClick={onMenuClick} aria-label="Abrir menú">
        <Menu size={22} />
      </button>
      <h1 className="topbar-title">{title}</h1>
    </header>
  );
}

export default Topbar;
