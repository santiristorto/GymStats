import { useState } from "react";
import { CreditCard, Copy, ExternalLink, MessageCircle, Check } from "lucide-react";
import Modal from "./Modal";
import { PAYMENT_CONCEPTS } from "../utils/clients";
import { supabase } from "../lib/supabase";
import { getPaymentLinkWhatsAppUrl } from "../utils/whatsapp";
import { useToast } from "../hooks/useToast";
import "./PaymentModal.css";

function PaymentModal({ client, settings, gym, onConfirm, onClose }) {
  const { showToast } = useToast();
  const [amount, setAmount] = useState(String(client.monthlyFee || ""));
  const [concept, setConcept] = useState("Cuota mensual");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [mpLoading, setMpLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Ingresá un monto mayor a 0");
      return;
    }
    onConfirm({ amount: Number(amount), concept, note: note.trim() });
  };

  const handleMercadoPago = async () => {
    if (!amount || Number(amount) <= 0) {
      setError("Ingresá un monto mayor a 0");
      return;
    }
    setMpLoading(true);
    setCheckoutUrl("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-mp-preference", {
        body: { gymId: gym.id, clientId: client.id, clientName: client.name, amount: Number(amount), concept, currency: settings.currency },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      // No intentamos abrir la ventana solos: después de esperar la respuesta
      // del servidor, los navegadores suelen bloquear el popup en silencio.
      // Mostramos el link para que lo abras/mandes vos con un clic real.
      setCheckoutUrl(data.checkoutUrl);
    } catch (err) {
      console.error(err);
      showToast(err.message || "No se pudo generar el link de Mercado Pago", "danger");
    } finally {
      setMpLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      setCopied(true);
      showToast("Link copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("No se pudo copiar, seleccionalo manualmente", "danger");
    }
  };

  return (
    <Modal
      title={`Registrar cobro — ${client.name}`}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="payment-form" className="btn btn-primary">
            Registrar manual
          </button>
        </>
      }
    >
      <form id="payment-form" className="payment-form" onSubmit={handleSubmit} noValidate>
        <label>
          Concepto
          <select value={concept} onChange={(e) => setConcept(e.target.value)}>
            {PAYMENT_CONCEPTS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          Monto ({settings.currency})
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
            }}
            autoFocus
          />
          {error && <span className="field-error">{error}</span>}
        </label>

        {concept !== "Cuota mensual" && (
          <label>
            Detalle (opcional)
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={concept === "Producto" ? "Ej: botella, remera..." : "Detalle"}
            />
          </label>
        )}

        {concept === "Cuota mensual" && Number(amount) < Number(client.monthlyFee || 0) && (
          <p className="payment-hint">
            Este monto es menor a la cuota completa ({client.monthlyFee}) — se va a registrar como pago
            parcial y el cliente va a seguir figurando como pendiente hasta completar el total.
          </p>
        )}

        {gym?.mp_access_token && (
          <div className="mp-block">
            <button type="button" className="btn btn-secondary" onClick={handleMercadoPago} disabled={mpLoading}>
              <CreditCard size={16} /> {mpLoading ? "Generando link..." : "Generar link de Mercado Pago"}
            </button>

            {checkoutUrl && (
              <div className="mp-result">
                <input type="text" readOnly value={checkoutUrl} onFocus={(e) => e.target.select()} />
                <div className="mp-result-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopy}>
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copiado" : "Copiar"}
                  </button>
                  {client.phone && (
                    <a
                      className="btn btn-sm btn-secondary"
                      href={getPaymentLinkWhatsAppUrl(client, checkoutUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={14} /> Enviar por WhatsApp
                    </a>
                  )}
                  <a className="btn btn-sm btn-ghost" href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} /> Abrir
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}

export default PaymentModal;
