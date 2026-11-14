// Edge Function « flw-webhook »  (à déployer SANS vérification JWT : c'est Flutterwave qui l'appelle)
// 1) vérifie le secret du webhook, 2) revérifie le paiement auprès de Flutterwave,
// 3) ajoute 1 an de licence à l'école. Un même paiement ne compte qu'une fois.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const PRICE: Record<string, number> = { XOF: 50000, XAF: 50000, EUR: 100, USD: 100 };
const ok = () => new Response("ok", { status: 200 });

Deno.serve(async (req) => {
  if (req.headers.get("verif-hash") !== Deno.env.get("FLW_WEBHOOK_HASH")) {
    return new Response("forbidden", { status: 401 });
  }
  const ev = await req.json().catch(() => null);
  const d = ev?.data;
  if (!d?.id || d.status !== "successful") return ok();

  // Ne jamais croire le contenu du webhook : on demande à Flutterwave.
  const v = await fetch(`https://api.flutterwave.com/v3/transactions/${d.id}/verify`, {
    headers: { Authorization: `Bearer ${Deno.env.get("FLW_SECRET_KEY")}` },
  }).then((r) => r.json()).catch(() => null);
  const t = v?.data;
  if (v?.status !== "success" || t?.status !== "successful") return ok();

  const m = /^rs_([0-9a-f-]{36})_\d+$/.exec(String(t.tx_ref ?? ""));
  if (!m) return ok();
  const userId = m[1];
  const need = PRICE[String(t.currency)];
  if (!need || Number(t.amount) < need) return ok();

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const dup = await sb.from("licences").select("id").eq("tx_ref", t.tx_ref).maybeSingle();
  if (dup.data) return ok(); // déjà traité

  const last = await sb.from("licences").select("valid_until").eq("user_id", userId)
    .order("valid_until", { ascending: false }).limit(1).maybeSingle();
  const today = new Date().toISOString().slice(0, 10);
  const start = last.data?.valid_until && last.data.valid_until > today ? last.data.valid_until : today;
  const end = new Date(start + "T12:00:00Z");
  end.setUTCFullYear(end.getUTCFullYear() + 1);

  const ins = await sb.from("licences").insert({
    user_id: userId, tx_ref: t.tx_ref, amount: t.amount, currency: t.currency,
    valid_from: start, valid_until: end.toISOString().slice(0, 10),
  });
  if (ins.error && ins.error.code !== "23505") return new Response("db error", { status: 500 }); // Flutterwave réessaiera
  return ok();
});
