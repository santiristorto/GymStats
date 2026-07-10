import { useEffect, useState } from "react";
import { Bell, BellOff, Send } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { isPushSupported, urlBase64ToUint8Array } from "../utils/push";
import { savePushSubscription, removePushSubscription, sendTestPush } from "../services/pushService";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function NotificationSettings({ gym }) {
  const { showToast } = useToast();
  const supported = isPushSupported();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready.then(async (registration) => {
      const sub = await registration.pushManager.getSubscription();
      setSubscribed(Boolean(sub));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      if (Notification.permission === "denied") {
        showToast("Bloqueaste las notificaciones para este sitio. Habilitalas desde la configuración del navegador.", "danger");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        showToast("No diste permiso para las notificaciones", "danger");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      await savePushSubscription(gym.id, subscription);
      setSubscribed(true);
      showToast("Notificaciones activadas");
    } catch (error) {
      console.error(error);
      showToast(error.message || "No se pudieron activar las notificaciones", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await removePushSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setSubscribed(false);
      showToast("Notificaciones desactivadas");
    } catch (error) {
      console.error(error);
      showToast(error.message || "No se pudieron desactivar", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTestLoading(true);
    try {
      await sendTestPush(gym.id);
      showToast("Notificación de prueba enviada, esperala en unos segundos");
    } catch (error) {
      console.error(error);
      showToast(error.message || "No se pudo enviar la notificación de prueba", "danger");
    } finally {
      setTestLoading(false);
    }
  };

  if (!VAPID_PUBLIC_KEY) {
    return (
      <div className="settings-card">
        <h2>Notificaciones</h2>
        <p className="settings-note">
          Falta configurar <code>VITE_VAPID_PUBLIC_KEY</code> en el <code>.env</code> para activar esta función.
        </p>
      </div>
    );
  }

  return (
    <div className="settings-card">
      <h2>Notificaciones</h2>
      {!supported ? (
        <p className="settings-note">Tu navegador no soporta notificaciones push.</p>
      ) : (
        <>
          <p className="settings-note">
            Recibí un aviso en tu celu/compu cuando haya cuotas por vencer, aunque no tengas la app abierta.
          </p>
          <div className="settings-actions">
            {subscribed ? (
              <button className="btn btn-secondary" onClick={handleDisable} disabled={loading}>
                <BellOff size={16} /> Desactivar notificaciones
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleEnable} disabled={loading}>
                <Bell size={16} /> Activar notificaciones
              </button>
            )}
            {subscribed && (
              <button className="btn btn-ghost" onClick={handleTest} disabled={testLoading}>
                <Send size={16} /> {testLoading ? "Enviando..." : "Mandar una de prueba"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationSettings;
