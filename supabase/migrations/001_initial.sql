-- Run once in the Supabase SQL editor, or via supabase db push.
create table public.brands (
 user_id uuid primary key references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 2 and 100),
 category text not null, audience text not null, personality text not null,
 tone text not null, vocabulary text not null default '', restricted text not null default '',
 context text not null default '', updated_at timestamptz not null default now()
);
create table public.campaigns (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(char_length(name) between 2 and 100),
 description text not null default '', created_at timestamptz not null default now(),
 unique(id,user_id)
);
create table public.drafts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 campaign_id uuid,
 title text not null check(char_length(title) between 1 and 150),
 type text not null check(type in ('Social caption','Product description','Ad copy','Video concept','Campaign ideas')),
 content text not null check(char_length(content) between 1 and 12000),
 source text not null check(source in ('demo','claude','edited')),
 updated_at timestamptz not null default now(),
 foreign key(campaign_id,user_id) references public.campaigns(id,user_id) on delete cascade
);
create index campaigns_user on public.campaigns(user_id);
create index drafts_user on public.drafts(user_id);
create index drafts_campaign on public.drafts(campaign_id,user_id);
alter table public.brands enable row level security;
alter table public.campaigns enable row level security;
alter table public.drafts enable row level security;
create policy own_brand on public.brands for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy own_campaigns on public.campaigns for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy own_drafts on public.drafts for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
revoke all on public.brands,public.campaigns,public.drafts from anon;
grant select,insert,update,delete on public.brands,public.campaigns,public.drafts to authenticated;
create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=now(); return new; end; $$;
create trigger touch_brand before update on public.brands for each row execute function public.touch_updated_at();
create trigger touch_draft before update on public.drafts for each row execute function public.touch_updated_at();

-- Daily generation counter: inaccessible directly; no caller-controlled user ID or quota.
create table public.generation_usage (
 user_id uuid not null references auth.users(id) on delete cascade,
 day date not null, count integer not null default 0, primary key(user_id,day)
);
alter table public.generation_usage enable row level security;
revoke all on public.generation_usage from anon,authenticated;
create function public.consume_generation() returns boolean language plpgsql security definer set search_path='' as $$
declare result integer;
begin
 if auth.uid() is null then return false; end if;
 insert into public.generation_usage(user_id,day,count) values(auth.uid(),(now() at time zone 'UTC')::date,1)
 on conflict(user_id,day) do update set count=public.generation_usage.count+1 where public.generation_usage.count<30
 returning count into result;
 return result is not null;
end; $$;
revoke all on function public.consume_generation() from public,anon;
grant execute on function public.consume_generation() to authenticated;
