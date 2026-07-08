import { useEffect, useState } from "react";
import { getMyGym } from "../services/gymService";
import { GymContext } from "./gymContext";

export function GymProvider({ children }) {
  const [gym, setGym] = useState(null);
  const [gymLoading, setGymLoading] = useState(true);
  const [gymError, setGymError] = useState(null);

  const loadGym = async () => {
    try {
      setGymLoading(true);
      const data = await getMyGym();
      setGym(data);
      setGymError(null);
    } catch (error) {
      console.error(error);
      setGymError(error.message || "No se pudo cargar el gimnasio");
    } finally {
      setGymLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadGym();
  }, []);

  return (
    <GymContext.Provider value={{ gym, setGym, gymLoading, gymError, refreshGym: loadGym }}>
      {children}
    </GymContext.Provider>
  );
}
