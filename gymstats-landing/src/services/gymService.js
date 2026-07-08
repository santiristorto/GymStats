import { supabase } from "../lib/supabase";

/** Devuelve el gimnasio del usuario logueado, o null si todavía no creó uno. */
export async function getMyGym() {
  const { data, error } = await supabase.from("gyms").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

/** Crea el gimnasio del usuario logueado (paso de onboarding tras el primer login). */
export async function createGym({ name, currency = "ARS" }) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const { data, error } = await supabase
    .from("gyms")
    .insert([{ name, currency, owner_id: userData.user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGym(gymId, fields) {
  const { data, error } = await supabase.from("gyms").update(fields).eq("id", gymId).select().single();
  if (error) throw error;
  return data;
}
