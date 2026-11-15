// Edge Function « fedapay-webhook »  (à déployer SANS vérification JWT : c'est FedaPay qui l'appelle)
// On ne croit JAMAIS le contenu de la notification : on retrouve le paiement dans notre table
// des commandes, puis on le redemande à FedaPay avec la clé secrète. Une fausse notification
// ne peut donc rien débloquer. Un même paiement ne compte qu'une fois.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const ok = () => new Response("ok", { status: 200 });

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get("k") !== Deno.env.get("FEDAPAY_WEBHOOK_KEY")) return new Response("forbidden", { status: 401 });

  const ev = await req.json().catch(() => null);
  const raw = ev?.entity?.id ?? ev?.data?.id ?? ev?.object?.id ?? ev?.id;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return ok();

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const cmd = await sb.from("licence_commandes").select("user_id, amount").eq("fedapay_id", id).maybeSingle();
  if (!cmd.data) return ok(); // paiement inconnu

  const dup = await sb.from("licences").select("id").eq("tx_ref", `fedapay_${id}`).maybeSingle();
  if (dup.data) return ok(); // déjà traité

  const base = Deno.env.get("FEDAPAY_ENV") === "live" ? "https://api.fedapay.com/v1" : "https://sandbox-api.fedapay.com/v1";
  const j = await fetch(`${base}/transactions/${id}`, {
    headers: { Authorization: `Bearer ${Deno.env.get("FEDAPAY_SECRET_KEY")}` },
  }).then((r) => r.json()).catch(() => null);
  const t = j?.["v1/transaction"] ?? j?.transaction ?? j;
  if (!t || t.status !== "approved") return ok();
  if (Number(t.amount) < Number(cmd.data.amount)) return ok();

  const last = await sb.from("licences").select("valid_until").eq("user_id", cmd.data.user_id)
    .order("valid_until", { ascending: false }).limit(1).maybeSingle();
  const today = new Date().toISOString().slice(0, 10);
  const start = last.data?.valid_until && last.data.valid_until > today ? last.data.valid_until : today;
  const end = new Date(start + "T12:00:00Z");
  end.setUTCFullYear(end.getUTCFullYear() + 1);

  const ins = await sb.from("licences").insert({
    user_id: cmd.data.user_id, tx_ref: `fedapay_${id}`, provider: "fedapay",
    amount: t.amount, currency: "XOF", valid_from: start, valid_until: end.toISOString().slice(0, 10),
  });
  if (ins.error && ins.error.code !== "23505") return new Response("db error", { status: 500 }); // FedaPay réessaiera
  return ok();
});
