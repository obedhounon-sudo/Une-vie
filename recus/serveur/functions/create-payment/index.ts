// Edge Function « create-payment »
// L'application (utilisateur connecté) demande un lien de paiement Flutterwave.
// Le PRIX est fixé ici, côté serveur : l'application ne peut pas le modifier.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const PRICE: Record<string, number> = { XOF: 50000, XAF: 50000, EUR: 100, USD: 100 };
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user }, error } = await sb.auth.getUser();
    if (error || !user) return json({ error: "Non connecté" }, 401);

    const body = await req.json().catch(() => ({}));
    let cur = String(body.currency ?? "USD").toUpperCase();
    if (!PRICE[cur]) cur = "USD";

    const txRef = `rs_${user.id}_${Date.now()}`;
    const r = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("FLW_SECRET_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: PRICE[cur],
        currency: cur,
        redirect_url: Deno.env.get("REDIRECT_URL") ?? "https://obedhounon-sudo.github.io/Une-vie/recus/",
        customer: { email: user.email },
        customizations: { title: "Reçus Scolaires", description: "Licence 1 an, élèves illimités" },
      }),
    });
    const j = await r.json();
    if (!r.ok || j.status !== "success") return json({ error: j.message ?? "Paiement indisponible" }, 502);
    return json({ link: j.data.link, tx_ref: txRef });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
