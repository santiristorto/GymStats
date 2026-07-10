import { supabase } from "../lib/supabase";

export async function savePushSubscription(gymId, subscription) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const json = subscription.toJSON();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      gym_id: gymId,
      user_id: userData.user.id,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
    { onConflict: "endpoint" }
  );
  if (error) throw error;
}

export async function removePushSubscription(endpoint) {
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (error) throw error;
}

export async function sendTestPush(gymId) {
  const { data, error } = await supabase.functions.invoke("send-push", {
    body: { gymId, title: "GymStats", body: "¡Las notificaciones están funcionando! 💪" },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}
