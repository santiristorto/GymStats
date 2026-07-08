// Supabase Edge Function: mp-webhook
// Mercado Pago llama a esta URL cuando cambia el estado de un pago.
// Si está aprobado, acredita el cobro en el historial de pagos del cliente.
//
// Deploy: supabase functions deploy mp-webhook --no-verify-jwt
// (--no-verify-jwt es necesario porque Mercado Pago no manda un JWT de Supabase)
//
// Configurar esta URL como "notification_url" ya se hace automáticamente desde
// create-mp-preference. No hace falta tocar nada en el dashboard de Mercado Pago.

import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");
    const topic = url.searchParams.get("type") || url.searchParams.get("topic");

    if (topic !== "payment" || !paymentId) {
      // Mercado Pago manda otros tipos de notificación que no nos interesan.
      return new Response("ignored", { status: 200 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    // Necesitamos el external_reference para saber de qué gimnasio es el pago,
    // y recién ahí sabemos qué access token usar para consultarlo a Mercado Pago.
    // Como no lo tenemos todavía, probamos primero con cualquier gimnasio que
    // tenga token configurado (simple porque el payment id es único igual).
    const { data: gyms } = await supabaseAdmin.from("gyms").select("id, mp_access_token").not("mp_access_token", "is", null);

    let payment = null;
    for (const gym of gyms || []) {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${gym.mp_access_token}` },
      });
      if (res.ok) {
        payment = await res.json();
        break;
      }
    }

    if (!payment || payment.status !== "approved") {
      return new Response("not approved yet", { status: 200 });
    }

    const { gymId, clientId, concept } = JSON.parse(payment.external_reference || "{}");
    if (!gymId || !clientId) {
      return new Response("missing reference", { status: 200 });
    }

    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .eq("gym_id", gymId)
      .single();

    if (clientError || !client) {
      return new Response("client not found", { status: 200 });
    }

    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const newEntry = {
      month: ym,
      date: now.toISOString(),
      amount: payment.transaction_amount,
      concept: concept || "Cuota mensual",
      note: "Pagado con Mercado Pago",
    };
    const paymentHistory = [...(client.paymentHistory || []), newEntry];

    let lastPaymentMonth = client.lastPaymentMonth;
    if ((concept || "Cuota mensual") === "Cuota mensual") {
      const totalPaid = paymentHistory
        .filter((p) => p.month === ym && (p.concept || "Cuota mensual") === "Cuota mensual")
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      if (totalPaid >= (Number(client.monthlyFee) || 0)) {
        lastPaymentMonth = ym;
      }
    }

    await supabaseAdmin.from("clients").update({ paymentHistory, lastPaymentMonth }).eq("id", clientId);

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("error", { status: 200 }); // 200 para que MP no reintente en loop
  }
});
