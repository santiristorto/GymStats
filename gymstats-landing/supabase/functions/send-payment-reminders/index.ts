// Supabase Edge Function: send-payment-reminders
// Pensada para dispararse una vez por día vía Cron (Database → Cron Jobs, o
// pg_cron). Recorre todos los gimnasios y le manda un push al dueño si tiene
// clientes activos cuya cuota vence hoy y todavía no pagaron.
//
// Deploy: supabase functions deploy send-payment-reminders
// (usa los mismos secrets VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY que send-push)

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

function currentYearMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function clientsDueToday(clients, today) {
  const ym = currentYearMonth(today);
  const todayDay = today.getDate();

  return clients.filter((c) => {
    if (c.status !== "Activo") return false;
    if (c.lastPaymentMonth === ym) return false; // ya pagó este mes
    const day = Math.min(Math.max(Number(c.paymentDay) || 1, 1), 31);
    return day === todayDay;
  });
}

Deno.serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    webpush.setVapidDetails(
      "mailto:soporte@gymstats.app",
      Deno.env.get("VAPID_PUBLIC_KEY"),
      Deno.env.get("VAPID_PRIVATE_KEY")
    );

    const today = new Date();
    const { data: gyms, error: gymsError } = await supabaseAdmin.from("gyms").select("id, name");
    if (gymsError) throw gymsError;

    let notified = 0;

    for (const gym of gyms || []) {
      const { data: clients } = await supabaseAdmin
        .from("clients")
        .select("*")
        .eq("gym_id", gym.id);

      const due = clientsDueToday(clients || [], today);
      if (due.length === 0) continue;

      const { data: subs } = await supabaseAdmin
        .from("push_subscriptions")
        .select("*")
        .eq("gym_id", gym.id);

      if (!subs || subs.length === 0) continue;

      const payload = JSON.stringify({
        title: `${gym.name}: cuotas que vencen hoy`,
        body: due.length === 1 ? `${due[0].name} tiene la cuota vencen hoy` : `${due.length} clientes tienen la cuota vencen hoy`,
        url: "./",
      });

      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
          notified++;
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
          }
        }
      }
    }

    return new Response(JSON.stringify({ notified }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
