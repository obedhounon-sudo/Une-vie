-- Une Vie: protect each cloud save so authenticated users can access only their own row.
-- Review the existing table definition before applying this migration in Supabase.
begin;

alter table public.saves enable row level security;

drop policy if exists "saves_select_own" on public.saves;
create policy "saves_select_own"
on public.saves for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "saves_insert_own" on public.saves;
create policy "saves_insert_own"
on public.saves for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "saves_update_own" on public.saves;
create policy "saves_update_own"
on public.saves for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create unique index if not exists saves_user_id_unique on public.saves (user_id);

grant select, insert, update on public.saves to authenticated;

commit;
