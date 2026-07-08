import { supabase } from "../lib/supabase";

export async function getClients(gymId) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function addClient(client, gymId) {
  const { data, error } = await supabase
    .from("clients")
    .insert([{ ...client, gym_id: gymId }])
    .select();

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error(
      "Supabase no devolvió el cliente creado. Revisá las políticas de RLS de la tabla 'clients' (necesitás permiso de INSERT y de SELECT)."
    );
  }

  return data[0];
}

export async function editClient(clientId, clientData) {
  const { data, error } = await supabase
    .from("clients")
    .update(clientData)
    .eq("id", clientId)
    .select();

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error(
      "Supabase no devolvió el cliente actualizado. Revisá las políticas de RLS de la tabla 'clients' (necesitás permiso de UPDATE y de SELECT)."
    );
  }

  return data[0];
}

export async function deleteClient(clientId) {
  const { data, error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)
    .select();

  if (error) throw error;

  return data?.[0];
}

/** Reemplaza todos los clientes del gimnasio actual por los de un backup importado (ver Ajustes). */
export async function replaceAllClients(newClients, gymId) {
  const { error: deleteError } = await supabase.from("clients").delete().eq("gym_id", gymId);
  if (deleteError) throw deleteError;

  if (newClients.length === 0) return [];

  // No reenviamos el id/gym_id originales del backup: el id lo genera Supabase
  // y el gym_id siempre es el del gimnasio actual, para no mezclar datos entre cuentas.
  // eslint-disable-next-line no-unused-vars
  const sanitized = newClients.map(({ id, gym_id, ...rest }) => ({ ...rest, gym_id: gymId }));

  const { data, error } = await supabase.from("clients").insert(sanitized).select();
  if (error) throw error;

  return data;
}

/** Borra todos los clientes del gimnasio actual (ver Ajustes → Zona de riesgo). */
export async function deleteAllClients(gymId) {
  const { error } = await supabase.from("clients").delete().eq("gym_id", gymId);
  if (error) throw error;
}
