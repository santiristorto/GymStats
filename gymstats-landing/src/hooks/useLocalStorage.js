import { useEffect, useState } from "react";

/**
 * Sincroniza un estado de React con localStorage.
 * Si la clave ya existe la usa como valor inicial; si no, usa initialValue.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch (error) {
      console.error(`No se pudo leer "${key}" de localStorage`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`No se pudo guardar "${key}" en localStorage`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
