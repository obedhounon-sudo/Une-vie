-- Reçus Scolaires : table de synchronisation (à exécuter une seule fois)
-- Supabase > SQL Editor > New query > coller > Run

create table if not exists public.ecole_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.ecole_saves enable row level security;

drop policy if exists "ecole_select" on public.ecole_saves;
drop policy if exists "ecole_insert" on public.ecole_saves;
drop policy if exists "ecole_update" on public.ecole_saves;
drop policy if exists "ecole_delete" on public.ecole_saves;

create policy "ecole_select" on public.ecole_saves for select to authenticated using (auth.uid() = user_id);
create policy "ecole_insert" on public.ecole_saves for insert to authenticated with check (auth.uid() = user_id);
create policy "ecole_update" on public.ecole_saves for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ecole_delete" on public.ecole_saves for delete to authenticated using (auth.uid() = user_id);
