-- Supabase Migration: Web Settings Table

create table if not exists public.settings_tk (
    key text primary key,
    value text not null,
    updated_at timestamptz not null default now()
);

alter table public.settings_tk enable row level security;

create policy "Allow read settings to all"
    on public.settings_tk for select
    using (true);

create policy "Allow write settings to super_admin and admin"
    on public.settings_tk for all
    using (public.get_user_role(auth.uid()) in ('super_admin', 'admin'));

-- Seed default settings
insert into public.settings_tk (key, value) values
('school_name', 'KB & TK Istiqamah'),
('school_tagline', 'Membangun Generasi Islami yang Cerdas dan Berakhlak'),
('school_address', 'Jl. Taman Citarum, Kec. Bandung Wetan, Kota Bandung'),
('school_phone', '022 - 4241799 / 0811 2198 853'),
('school_email', 'info@tkistiqamah.sch.id'),
('social_instagram', '@kbtkistiqamah'),
('social_facebook', 'TK Istiqamah Bandung'),
('academic_year', '2026/2027'),
('ppdb_fee', '250000'),
('payment_bank_name', 'Bank Mandiri'),
('payment_account_number', '131-00-1234567-8'),
('payment_account_name', 'Yayasan Istiqamah Bandung')
on conflict (key) do update set value = excluded.value;
