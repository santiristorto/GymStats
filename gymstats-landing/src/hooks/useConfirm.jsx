import { useCallback, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";

/**
 * useConfirm() devuelve [confirm, dialogElement].
 * confirm({ title, message, confirmLabel, tone }) devuelve una Promise<boolean>.
 * Renderizar `dialogElement` dentro del componente que llama a confirm().
 */
export function useConfirm() {
  const [request, setRequest] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setRequest({ ...options, resolve });
    });
  }, []);

  if (!request) {
    return [confirm, null];
  }

  const finish = (result) => {
    request.resolve(result);
    setRequest(null);
  };

  const dialog = (
    <ConfirmDialog
      title={request.title}
      message={request.message}
      confirmLabel={request.confirmLabel}
      tone={request.tone}
      onConfirm={() => finish(true)}
      onCancel={() => finish(false)}
    />
  );

  return [confirm, dialog];
}
