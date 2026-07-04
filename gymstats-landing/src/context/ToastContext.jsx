import { useCallback, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { ToastContext } from "./toastContext";
import "./Toast.css";

const ICONS = {
  success: CheckCircle2,
  danger: AlertTriangle,
  info: Info,
};

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      timers.current[id] = setTimeout(() => removeToast(id), 3500);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || CheckCircle2;
          return (
            <div key={t.id} className={`toast toast-${t.type}`}>
              <Icon size={18} />
              <span>{t.message}</span>
              <button onClick={() => removeToast(t.id)} aria-label="Cerrar notificación">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

