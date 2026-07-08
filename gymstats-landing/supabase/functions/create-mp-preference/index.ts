// Supabase Edge Function: create-mp-preference
// Recibe { gymId, clientId, clientName, amount, concept } y devuelve la URL de
// checkout de Mercado Pago (init_point) para mandarle al cliente por WhatsApp.
//
// Deploy: supabase functions deploy create-mp-preference
// Secrets necesarios (una sola vez): supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_URL=...

import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { gymId, clientId, clientName, amount, concept, currency } = await req.json();

    if (!gymId || !clientId || !amount) {
      return new Response(JSON.stringify({ error: "Faltan datos (gymId, clientId, amount)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cliente con permisos de administrador para leer el token del gimnasio
    // (la tabla gyms está protegida por RLS, esto lo esquiva de forma segura
    // porque corre en el servidor, nunca en el navegador del usuario).
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    const { data: gym, error: gymError } = await supabaseAdmin
      .from("gyms")
      .select("mp_access_token, name")
      .eq("id", gymId)
      .single();

    if (gymError || !gym?.mp_access_token) {
      return new Response(
        JSON.stringify({ error: "Este gimnasio todavía no configuró Mercado Pago en Ajustes." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // external_reference guarda quién es quién para que el webhook sepa a qué
    // cliente acreditarle el pago cuando Mercado Pago avise que se aprobó.
    const externalReference = JSON.stringify({ gymId, clientId, concept: concept || "Cuota mensual" });

    const preferenceRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${gym.mp_access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title: `${concept || "Cuota mensual"} — ${clientName || "Cliente"} — ${gym.name}`,
            quantity: 1,
            currency_id: currency || "ARS",
            unit_price: Number(amount),
          },
        ],
        external_reference: externalReference,
        notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mp-webhook`,
        back_urls: {
          success: "https://www.mercadopago.com.ar",
          pending: "https://www.mercadopago.com.ar",
          failure: "https://www.mercadopago.com.ar",
        },
      }),
    });

    const preference = await preferenceRes.json();

    if (!preferenceRes.ok) {
      return new Response(JSON.stringify({ error: preference.message || "Error de Mercado Pago" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ checkoutUrl: preference.init_point }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
