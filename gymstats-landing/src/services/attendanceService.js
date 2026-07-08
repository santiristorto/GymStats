import { supabase } from "../lib/supabase";

export async function checkIn(clientId, gymId) {
  const { data, error } = await supabase
    .from("attendance")
    .insert([{ client_id: clientId, gym_id: gymId }])
    .select();

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error(
      "Supabase no devolvió el check-in creado. Revisá las políticas de RLS de la tabla 'attendance'."
    );
  }

  return data[0];
}

export async function getAttendanceBetween(gymId, startISO, endISO) {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("gym_id", gymId)
    .gte("checked_in_at", startISO)
    .lte("checked_in_at", endISO)
    .order("checked_in_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function getTodayAttendance(gymId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return getAttendanceBetween(gymId, start.toISOString(), end.toISOString());
}
