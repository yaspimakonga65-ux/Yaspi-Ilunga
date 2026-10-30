-- Stockage par utilisateur. Les opérations bancaires brutes ne sont jamais envoyées.
create table public.workspaces (
 user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
 data jsonb not null default '{"subscriptions":[],"history":[],"demo":false}'::jsonb,
 version bigint not null default 1,
 updated_at timestamptz not null default now(),
 constraint workspace_size check (octet_length(data::text) <= 2097152),
 constraint workspace_shape check (
  jsonb_typeof(data)='object' and data ?& array['subscriptions','history']
  and jsonb_typeof(data->'subscriptions')='array'
  and jsonb_typeof(data->'history')='array'
  and jsonb_array_length(data->'subscriptions')<=10000
  and jsonb_array_length(data->'history')<=50
 )
);
alter table public.workspaces enable row level security;
revoke all on public.workspaces from anon, authenticated;
grant select, insert on public.workspaces to authenticated;
grant update(data) on public.workspaces to authenticated;
create policy workspace_read on public.workspaces for select to authenticated using ((select auth.uid())=user_id);
create policy workspace_create on public.workspaces for insert to authenticated with check ((select auth.uid())=user_id);
create policy workspace_update on public.workspaces for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create function public.stamp_workspace() returns trigger language plpgsql set search_path='' as $$
begin
 if TG_OP='INSERT' then NEW.version:=1; else NEW.version:=OLD.version+1; end if;
 NEW.updated_at:=now();
 return NEW;
end;
$$;
revoke all on function public.stamp_workspace() from public, anon, authenticated;
create trigger workspace_version before insert or update on public.workspaces for each row execute function public.stamp_workspace();
comment on table public.workspaces is 'Abonnements et historique des imports validés par compte. Sans relevé bancaire brut. Version pour contrôle de concurrence.';
