import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import "./ErrorBoundary.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Error no controlado en GymStats:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <AlertTriangle size={40} strokeWidth={1.5} />
          <h1>Algo salió mal</h1>
          <p>
            GymStats encontró un error inesperado. Podés intentar recargar la página; si el
            problema persiste, revisá la consola del navegador para más detalles.
          </p>
          {this.state.error && <code>{String(this.state.error.message || this.state.error)}</code>}
          <button className="btn btn-primary" onClick={this.handleReload}>
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
