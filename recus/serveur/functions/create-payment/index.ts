// Edge Function « create-payment » (FedaPay)
// L'application (utilisateur connecté) demande un lien de paiement.
// Le PRIX est fixé ici, côté serveur : l'application ne peut pas le modifier.
// FedaPay encaisse en FCFA (XOF) : les autres devises sont converties ci-dessous.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
// Prix en FCFA selon la devise du pays de l'école (modifiables ici).
function priceXof(cur: string): number {
  if (cur === "XOF" || cur === "XAF") return 50000;
  if (cur === "EUR") return 65600;   // 100 € (parité fixe 655,957)
  return 60000;                      // ≈ 100 $ et autres devises
}
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
    const amount = priceXof(String(body.currency ?? "XOF").toUpperCase());

    const base = Deno.env.get("FEDAPAY_ENV") === "live" ? "https://api.fedapay.com/v1" : "https://sandbox-api.fedapay.com/v1";
    const H = { Authorization: `Bearer ${Deno.env.get("FEDAPAY_SECRET_KEY")}`, "Content-Type": "application/json" };

    const r1 = await fetch(`${base}/transactions`, {
      method: "POST", headers: H,
      body: JSON.stringify({
        description: "Reçus Scolaires : licence 1 an",
        amount,
        currency: { iso: "XOF" },
        callback_url: Deno.env.get("REDIRECT_URL") ?? "https://obedhounon-sudo.github.io/Une-vie/recus/",
        customer: { email: user.email },
      }),
    });
    const j1 = await r1.json().catch(() => ({}));
    const tx = j1["v1/transaction"] ?? j1.transaction ?? j1;
    const id = tx?.id;
    if (!r1.ok || !id) return json({ error: j1?.message ?? "Paiement indisponible" }, 502);

    const r2 = await fetch(`${base}/transactions/${id}/token`, { method: "POST", headers: H });
    const j2 = await r2.json().catch(() => ({}));
    const url = j2.url ?? j2?.["v1/token"]?.url;
    if (!r2.ok || !url) return json({ error: j2?.message ?? "Lien de paiement indisponible" }, 502);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const ins = await admin.from("licence_commandes").insert({ fedapay_id: id, user_id: user.id, amount, currency: "XOF" });
    if (ins.error) return json({ error: "Enregistrement impossible" }, 500);

    return json({ link: url });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
