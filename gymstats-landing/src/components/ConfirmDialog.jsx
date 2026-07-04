import Modal from "./Modal";

function ConfirmDialog({ title, message, confirmLabel = "Confirmar", tone = "primary", onConfirm, onCancel }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className={`btn btn-${tone}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}

export default ConfirmDialog;
