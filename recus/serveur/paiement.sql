-- Reçus Scolaires : licences payées en ligne (Flutterwave)
-- À exécuter une fois dans Supabase › SQL Editor › New query › Run.

create table if not exists public.licences (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  tx_ref      text not null unique,          -- référence unique du paiement (évite les doublons)
  provider    text not null default 'flutterwave',
  amount      numeric,
  currency    text,
  valid_from  date not null,
  valid_until date not null,
  created_at  timestamptz not null default now()
);

create index if not exists licences_user_idx on public.licences (user_id, valid_until desc);

alter table public.licences enable row level security;

-- Chaque école peut LIRE ses propres licences, jamais en écrire :
-- seules les fonctions du serveur (clé "service role") peuvent en créer.
drop policy if exists "licences_lecture_perso" on public.licences;
create policy "licences_lecture_perso" on public.licences
  for select using (auth.uid() = user_id);
