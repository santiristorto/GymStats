import { useState } from "react";
import Modal from "./Modal";
import { PLAN_SUGGESTIONS, validateClient } from "../utils/clients";
import "./ClientModal.css";

function ClientModal({ title, initialData, onSave, onClose }) {
  const [form, setForm] = useState(initialData);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateClient(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave(form);
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="client-form" className="btn btn-primary">
            Guardar
          </button>
        </>
      }
    >
      <form id="client-form" className="client-form-grid" onSubmit={handleSubmit} noValidate>
        <label>
          Nombre *
          <input name="name" value={form.name} onChange={handleChange} autoFocus placeholder="Nombre y apellido" />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>

        <label>
          Teléfono
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="351 555-1234" />
        </label>

        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="nombre@correo.com" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>

        <label>
          Plan
          <input name="plan" list="plan-suggestions" value={form.plan} onChange={handleChange} placeholder="Musculación" />
          <datalist id="plan-suggestions">
            {PLAN_SUGGESTIONS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </label>

        <label>
          Cuota mensual
          <input name="monthlyFee" type="number" min="0" value={form.monthlyFee} onChange={handleChange} placeholder="0" />
          {errors.monthlyFee && <span className="field-error">{errors.monthlyFee}</span>}
        </label>

        <label>
          Día de vencimiento
          <input
            name="paymentDay"
            type="number"
            min="1"
            max="31"
            value={form.paymentDay}
            onChange={handleChange}
            placeholder="1-31"
          />
          {errors.paymentDay && <span className="field-error">{errors.paymentDay}</span>}
        </label>

        <label>
          Estado
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </label>

        <label>
          Fecha de ingreso
          <input name="joinDate" type="date" value={form.joinDate} onChange={handleChange} />
        </label>

        <label className="full-width">
          Notas
          <textarea
            name="notes"
            rows={2}
            value={form.notes}
            onChange={handleChange}
            placeholder="Lesiones, objetivos, observaciones..."
          />
        </label>
      </form>
    </Modal>
  );
}

export default ClientModal;
