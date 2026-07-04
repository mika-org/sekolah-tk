-- Supabase Migration: Uncompleted Features (Chats, Materials, Schedules)

-- 1. CHATS_TK TABLE
create table if not exists public.chats_tk (
    id uuid primary key default gen_random_uuid(),
    sender_id uuid references public.users_tk(id) on delete cascade,
    receiver_id uuid references public.users_tk(id) on delete cascade,
    message text not null,
    created_at timestamptz not null default now()
);

alter table public.chats_tk enable row level security;

-- 2. MATERIALS_TK TABLE
create table if not exists public.materials_tk (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    file_url text not null,
    class_id uuid references public.classes_tk(id) on delete cascade,
    teacher_id uuid references public.teachers_tk(id) on delete set null,
    created_at timestamptz not null default now()
);

alter table public.materials_tk enable row level security;

-- 3. SCHEDULES_TK TABLE
create table if not exists public.schedules_tk (
    id uuid primary key default gen_random_uuid(),
    class_id uuid references public.classes_tk(id) on delete cascade,
    day text not null check (day in ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu')),
    subject text not null,
    start_time time not null,
    end_time time not null
);

alter table public.schedules_tk enable row level security;


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- CHATS_TK POLICIES
create policy "Allow participants to read chats"
    on public.chats_tk for select
    using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Allow participants to insert chats"
    on public.chats_tk for insert
    with check (auth.uid() = sender_id);

-- MATERIALS_TK POLICIES
create policy "Allow authenticated to view materials"
    on public.materials_tk for select
    using (auth.role() = 'authenticated');

create policy "Allow teachers and admins to manage materials"
    on public.materials_tk for all
    using (public.get_user_role(auth.uid()) in ('super_admin', 'admin', 'guru'));

-- SCHEDULES_TK POLICIES
create policy "Allow authenticated to view schedules"
    on public.schedules_tk for select
    using (auth.role() = 'authenticated');

create policy "Allow admins to manage schedules"
    on public.schedules_tk for all
    using (public.get_user_role(auth.uid()) in ('super_admin', 'admin'));
