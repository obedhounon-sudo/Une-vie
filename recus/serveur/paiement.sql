-- Reçus Scolaires : licences payées en ligne (FedaPay)
-- À exécuter une fois dans Supabase › SQL Editor › New query › Run.

-- Licences accordées (1 ligne par paiement validé)
create table if not exists public.licences (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  tx_ref      text not null unique,          -- "fedapay_<id>" : un paiement ne compte qu'une fois
  provider    text not null default 'fedapay',
  amount      numeric,
  currency    text,
  valid_from  date not null,
  valid_until date not null,
  created_at  timestamptz not null default now()
);
create index if not exists licences_user_idx on public.licences (user_id, valid_until desc);
alter table public.licences enable row level security;
drop policy if exists "licences_lecture_perso" on public.licences;
create policy "licences_lecture_perso" on public.licences
  for select using (auth.uid() = user_id);

-- Commandes en attente : relie un paiement FedaPay à l'école qui l'a lancé.
-- Aucune règle d'accès : seules les fonctions serveur (service role) y touchent.
create table if not exists public.licence_commandes (
  fedapay_id bigint primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     numeric not null,
  currency   text not null default 'XOF',
  created_at timestamptz not null default now()
);
alter table public.licence_commandes enable row level security;
