-- Supabase Migration: Database Initialization for sekolah-tk
-- Suffix all tables with _tk

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS_TK TABLE (extends auth.users)
create table if not exists public.users_tk (
    id uuid primary key references auth.users(id) on delete cascade,
    username text unique not null,
    email text unique not null,
    password_hash text not null,
    role text not null check (role in ('super_admin', 'admin', 'guru', 'orang_tua')),
    status text not null default 'active' check (status in ('active', 'inactive')),
    created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.users_tk enable row level security;

-- 2. TEACHERS_TK TABLE
create table if not exists public.teachers_tk (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users_tk(id) on delete set null,
    nama text not null,
    nip varchar(18) unique,
    hp text,
    alamat text
);

alter table public.teachers_tk enable row level security;

-- 3. CLASSES_TK TABLE
create table if not exists public.classes_tk (
    id uuid primary key default gen_random_uuid(),
    nama text not null,
    guru_id uuid references public.teachers_tk(id) on delete set null,
    tahun_ajaran text not null
);

alter table public.classes_tk enable row level security;

-- 4. STUDENTS_TK TABLE
create table if not exists public.students_tk (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users_tk(id) on delete set null,
    nama text not null,
    nik varchar(16) unique,
    nisn varchar(10) unique,
    tempat_lahir text,
    tanggal_lahir date,
    jenis_kelamin text check (jenis_kelamin in ('L', 'P')),
    agama text,
    alamat text,
    kelas_id uuid references public.classes_tk(id) on delete set null,
    status text not null default 'active' check (status in ('active', 'inactive'))
);

alter table public.students_tk enable row level security;

-- 5. PARENTS_TK TABLE
create table if not exists public.parents_tk (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users_tk(id) on delete set null,
    student_id uuid references public.students_tk(id) on delete cascade,
    nama_ayah text,
    nama_ibu text,
    hp text,
    email text,
    alamat text,
    pekerjaan text
);

alter table public.parents_tk enable row level security;

-- 6. PPDB_TK (Pendaftaran Peserta Didik Baru)
create table if not exists public.ppdb_tk (
    id uuid primary key default gen_random_uuid(),
    student_name text not null,
    birth_date date not null,
    status text not null default 'Draft' check (status in ('Draft', 'Submitted', 'Verifikasi Berkas', 'Menunggu Pembayaran', 'Pembayaran Diverifikasi', 'Tes', 'Diterima', 'Ditolak')),
    payment_status text not null default 'Pending' check (payment_status in ('Pending', 'Verified', 'Rejected')),
    created_at timestamptz not null default now()
);

alter table public.ppdb_tk enable row level security;

-- 7. PPDB_DOCUMENTS_TK
create table if not exists public.ppdb_documents_tk (
    id uuid primary key default gen_random_uuid(),
    ppdb_id uuid references public.ppdb_tk(id) on delete cascade,
    type text not null, -- KK, Akta, Foto Anak, KTP Ayah, KTP Ibu, Bukti Pembayaran
    file_url text not null
);

alter table public.ppdb_documents_tk enable row level security;

-- 8. GALLERIES_TK
create table if not exists public.galleries_tk (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    image text not null,
    category text not null, -- Kegiatan, Sarana, Prestasi
    created_at timestamptz not null default now()
);

alter table public.galleries_tk enable row level security;

-- 9. TESTIMONIALS_TK
create table if not exists public.testimonials_tk (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    photo text,
    job text,
    content text not null,
    published boolean not null default false
);

alter table public.testimonials_tk enable row level security;

-- 10. ANNOUNCEMENTS_TK
create table if not exists public.announcements_tk (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    content text not null,
    target text not null check (target in ('Semua', 'Guru', 'Orang Tua')),
    published boolean not null default false
);

alter table public.announcements_tk enable row level security;

-- 11. PAYMENTS_TK
create table if not exists public.payments_tk (
    id uuid primary key default gen_random_uuid(),
    ppdb_id uuid references public.ppdb_tk(id) on delete cascade,
    method text not null check (method in ('Transfer', 'QRIS', 'Cash')),
    amount numeric not null,
    proof text, -- URL file bukti transfer
    status text not null default 'Pending' check (status in ('Pending', 'Verified', 'Rejected'))
);

alter table public.payments_tk enable row level security;

-- 12. ATTENDANCE_TK
create table if not exists public.attendance_tk (
    id uuid primary key default gen_random_uuid(),
    student_id uuid references public.students_tk(id) on delete cascade,
    date date not null default current_date,
    status text not null check (status in ('Hadir', 'Sakit', 'Izin', 'Alfa'))
);

alter table public.attendance_tk enable row level security;

-- 13. GRADES_TK
create table if not exists public.grades_tk (
    id uuid primary key default gen_random_uuid(),
    student_id uuid references public.students_tk(id) on delete cascade,
    teacher_id uuid references public.teachers_tk(id) on delete set null,
    subject text not null,
    score numeric not null,
    description text
);

alter table public.grades_tk enable row level security;

-- 14. ACTIVITY_LOGS_TK
create table if not exists public.activity_logs_tk (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users_tk(id) on delete set null,
    activity text not null,
    created_at timestamptz not null default now()
);

alter table public.activity_logs_tk enable row level security;


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Helper Function to check user role
create or replace function public.get_user_role(user_uuid uuid)
returns text as $$
begin
    return (select role from public.users_tk where id = user_uuid);
end;
$$ language plpgsql security definer;

-- USERS_TK POLICIES
create policy "Allow read access to authenticated users"
    on public.users_tk for select
    using (auth.role() = 'authenticated');

create policy "Allow all actions to super admins and admins"
    on public.users_tk for all
    using (
        public.get_user_role(auth.uid()) in ('super_admin', 'admin')
    );

-- TEACHERS_TK POLICIES
create policy "Allow read access to teachers_tk to all authenticated"
    on public.teachers_tk for select
    using (auth.role() = 'authenticated');

create policy "Allow write access to teachers_tk to admins"
    on public.teachers_tk for all
    using (
        public.get_user_role(auth.uid()) in ('super_admin', 'admin')
    );

-- CLASSES_TK POLICIES
create policy "Allow read access to classes_tk to authenticated"
    on public.classes_tk for select
    using (auth.role() = 'authenticated');

create policy "Allow write access to classes_tk to admins"
    on public.classes_tk for all
    using (
        public.get_user_role(auth.uid()) in ('super_admin', 'admin')
    );

-- STUDENTS_TK POLICIES
create policy "Allow read access to students_tk to authenticated"
    on public.students_tk for select
    using (auth.role() = 'authenticated');

create policy "Allow write access to students_tk to admins"
    on public.students_tk for all
    using (
        public.get_user_role(auth.uid()) in ('super_admin', 'admin')
    );

-- PARENTS_TK POLICIES
create policy "Allow read access to parents_tk to authenticated"
    on public.parents_tk for select
    using (auth.role() = 'authenticated');

create policy "Allow write access to parents_tk to admins"
    on public.parents_tk for all
    using (
        public.get_user_role(auth.uid()) in ('super_admin', 'admin')
    );

-- PPDB_TK POLICIES
create policy "Allow public to create PPDB draft"
    on public.ppdb_tk for insert
    with check (true);

create policy "Allow admins to read/write all PPDB applications"
    on public.ppdb_tk for all
    using (
        public.get_user_role(auth.uid()) in ('super_admin', 'admin')
    );

create policy "Allow parent to view/update their own PPDB applications if logged in"
    on public.ppdb_tk for select
    using (
        auth.role() = 'authenticated'
    );

-- PPDB DOCUMENTS POLICIES
create policy "Allow public to upload PPDB docs"
    on public.ppdb_documents_tk for insert
    with check (true);

create policy "Allow read/write PPDB docs to admins"
    on public.ppdb_documents_tk for all
    using (
        public.get_user_role(auth.uid()) in ('super_admin', 'admin')
    );

-- GALLERIES POLICIES
create policy "Allow public to view galleries_tk"
    on public.galleries_tk for select
    using (true);

create policy "Allow write to galleries_tk to admins"
    on public.galleries_tk for all
    using (
        public.get_user_role(auth.uid()) in ('super_admin', 'admin')
    );

-- TESTIMONIALS POLICIES
create policy "Allow public to view published testimonials_tk"
    on public.testimonials_tk for select
    using (published = true or public.get_user_role(auth.uid()) in ('super_admin', 'admin'));

create policy "Allow write to testimonials_tk to admins"
    on public.testimonials_tk for all
    using (
        public.get_user_role(auth.uid()) in ('super_admin', 'admin')
    );

-- ANNOUNCEMENTS POLICIES
create policy "Allow read to announcements_tk based on target"
    on public.announcements_tk for select
    using (
        published = true and (
            target = 'Semua' or
            (target = 'Guru' and public.get_user_role(auth.uid()) = 'guru') or
            (target = 'Orang Tua' and public.get_user_role(auth.uid()) = 'orang_tua') or
            public.get_user_role(auth.uid()) in ('super_admin', 'admin')
        )
    );

create policy "Allow write to announcements_tk to admins"
    on public.announcements_tk for all
    using (
        public.get_user_role(auth.uid()) in ('super_admin', 'admin')
    );

-- PAYMENTS POLICIES
create policy "Allow public insert for payment proof"
    on public.payments_tk for insert
    with check (true);

create policy "Allow read/write payments_tk to admins"
    on public.payments_tk for all
    using (
        public.get_user_role(auth.uid()) in ('super_admin', 'admin')
    );

create policy "Allow parents to view payments_tk for their PPDB"
    on public.payments_tk for select
    using (auth.role() = 'authenticated');

-- ATTENDANCE_TK POLICIES
create policy "Allow read attendance_tk to authenticated"
    on public.attendance_tk for select
    using (auth.role() = 'authenticated');

create policy "Allow write attendance_tk to gurus and admins"
    on public.attendance_tk for all
    using (
        public.get_user_role(auth.uid()) in ('super_admin', 'admin', 'guru')
    );

-- GRADES POLICIES
create policy "Allow read grades_tk to authenticated"
    on public.grades_tk for select
    using (auth.role() = 'authenticated');

create policy "Allow write grades_tk to gurus and admins"
    on public.grades_tk for all
    using (
        public.get_user_role(auth.uid()) in ('super_admin', 'admin', 'guru')
    );

-- ACTIVITY LOGS POLICIES
create policy "Allow insert to authenticated"
    on public.activity_logs_tk for insert
    with check (auth.role() = 'authenticated');

create policy "Allow view to admins"
    on public.activity_logs_tk for select
    using (
        public.get_user_role(auth.uid()) in ('super_admin', 'admin')
    );
