import { useContext } from "react";
import { GymContext } from "../context/gymContext";

export function useGym() {
  const ctx = useContext(GymContext);
  if (!ctx) throw new Error("useGym debe usarse dentro de <GymProvider>");
  return ctx;
}
