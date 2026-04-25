-- ============================================================
-- Kindergarten Planner — full schema + RLS
-- Paste this into Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ── Tables ──────────────────────────────────────────────────

create table households (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  child_name       text,
  child_age        int,
  kindergarten_name text,
  created_at       timestamptz default now()
);

create table memberships (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete cascade,
  role         text check (role in ('parent', 'viewer')) default 'parent',
  display_name text,
  avatar_color text,
  created_at   timestamptz default now(),
  unique(household_id, user_id)
);

create table invite_codes (
  code         text primary key,
  household_id uuid references households(id) on delete cascade,
  role         text default 'parent',
  created_by   uuid references auth.users(id),
  expires_at   timestamptz default (now() + interval '7 days'),
  used_at      timestamptz
);

create table events (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  type         text check (type in ('closure','vacation','absence','event','note')),
  title        text not null,
  starts_on    date not null,
  ends_on      date,
  notes        text,
  checklist_id uuid,
  created_at   timestamptz default now()
);

create table checklists (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  kind         text check (kind in ('daily','event','weather')),
  name         text not null,
  description  text,
  created_at   timestamptz default now()
);

create table checklist_items (
  id           uuid primary key default gen_random_uuid(),
  checklist_id uuid references checklists(id) on delete cascade,
  emoji        text,
  title        text not null,
  notes        text,
  critical     boolean default false,
  position     int default 0
);

create table check_states (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  item_id      uuid references checklist_items(id) on delete cascade,
  on_date      date not null,
  checked_by   uuid references auth.users(id),
  checked_at   timestamptz default now(),
  unique(item_id, on_date)
);

create table inventory_items (
  id                uuid primary key default gen_random_uuid(),
  household_id      uuid references households(id) on delete cascade,
  name              text not null,
  emoji             text,
  bg_color          text,
  category          text,
  quantity          int default 0,
  min_quantity      int default 1,
  notes             text,
  photo_url         text,
  last_verified_by  uuid references auth.users(id),
  last_verified_at  timestamptz default now()
);

-- ── Helper: get the caller's household_id ───────────────────
-- security definer so it can read memberships without a
-- recursive policy loop.

create or replace function public.get_my_household_id()
returns uuid
language sql
security definer
stable
as $$
  select household_id
  from   memberships
  where  user_id = auth.uid()
  limit  1
$$;

-- ── Enable RLS on every table ────────────────────────────────

alter table households      enable row level security;
alter table memberships     enable row level security;
alter table invite_codes    enable row level security;
alter table events          enable row level security;
alter table checklists      enable row level security;
alter table checklist_items enable row level security;
alter table check_states    enable row level security;
alter table inventory_items enable row level security;

-- ── households ───────────────────────────────────────────────

create policy "members can view their household"
  on households for select
  using (id = get_my_household_id());

create policy "authenticated users can create a household"
  on households for insert
  with check (auth.uid() is not null);

create policy "parents can update household"
  on households for update
  using (
    id = get_my_household_id()
    and exists (
      select 1 from memberships
      where household_id = households.id
        and user_id = auth.uid()
        and role = 'parent'
    )
  );

-- ── memberships ──────────────────────────────────────────────

create policy "users can view memberships in their household"
  on memberships for select
  using (
    user_id = auth.uid()
    or household_id = get_my_household_id()
  );

create policy "users can insert their own membership"
  on memberships for insert
  with check (user_id = auth.uid());

create policy "users can update their own membership"
  on memberships for update
  using (user_id = auth.uid());

-- ── invite_codes ─────────────────────────────────────────────

-- Any logged-in user can look up a code (needed to redeem it
-- before they have a membership).
create policy "authenticated users can read invite codes"
  on invite_codes for select
  using (auth.uid() is not null);

create policy "parents can create invite codes"
  on invite_codes for insert
  with check (
    auth.uid() = created_by
    and household_id = get_my_household_id()
  );

-- Anyone authenticated can mark a code used
create policy "authenticated users can use invite codes"
  on invite_codes for update
  using (auth.uid() is not null);

-- ── events ───────────────────────────────────────────────────

create policy "members can view events"
  on events for select
  using (household_id = get_my_household_id());

create policy "parents can manage events"
  on events for all
  using (
    household_id = get_my_household_id()
    and exists (
      select 1 from memberships
      where household_id = events.household_id
        and user_id = auth.uid()
        and role = 'parent'
    )
  );

-- ── checklists ───────────────────────────────────────────────

create policy "members can view checklists"
  on checklists for select
  using (household_id = get_my_household_id());

create policy "parents can manage checklists"
  on checklists for all
  using (
    household_id = get_my_household_id()
    and exists (
      select 1 from memberships
      where household_id = checklists.household_id
        and user_id = auth.uid()
        and role = 'parent'
    )
  );

-- ── checklist_items ──────────────────────────────────────────

create policy "members can view checklist items"
  on checklist_items for select
  using (
    exists (
      select 1 from checklists
      where checklists.id = checklist_items.checklist_id
        and checklists.household_id = get_my_household_id()
    )
  );

create policy "parents can manage checklist items"
  on checklist_items for all
  using (
    exists (
      select 1
      from   checklists
      join   memberships on memberships.household_id = checklists.household_id
      where  checklists.id = checklist_items.checklist_id
        and  memberships.user_id = auth.uid()
        and  memberships.role = 'parent'
    )
  );

-- ── check_states ─────────────────────────────────────────────

create policy "members can view check states"
  on check_states for select
  using (household_id = get_my_household_id());

create policy "members can insert check states"
  on check_states for insert
  with check (
    household_id = get_my_household_id()
    and checked_by = auth.uid()
  );

create policy "members can delete their own check states"
  on check_states for delete
  using (
    household_id = get_my_household_id()
    and checked_by = auth.uid()
  );

-- ── inventory_items ──────────────────────────────────────────

create policy "members can view inventory"
  on inventory_items for select
  using (household_id = get_my_household_id());

create policy "parents can manage inventory"
  on inventory_items for all
  using (
    household_id = get_my_household_id()
    and exists (
      select 1 from memberships
      where household_id = inventory_items.household_id
        and user_id = auth.uid()
        and role = 'parent'
    )
  );

-- ── Realtime ─────────────────────────────────────────────────
-- Enable realtime for the two tables that need live sync.

alter publication supabase_realtime add table check_states;
alter publication supabase_realtime add table inventory_items;
