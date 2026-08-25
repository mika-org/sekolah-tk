-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "nama" TEXT NOT NULL,
    "nip" VARCHAR(18),
    "hp" TEXT,
    "alamat" TEXT,

    CONSTRAINT "teachers_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nama" TEXT NOT NULL,
    "guru_id" UUID,
    "tahun_ajaran" TEXT NOT NULL,

    CONSTRAINT "classes_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "nama" TEXT NOT NULL,
    "nik" VARCHAR(16),
    "nisn" VARCHAR(10),
    "tempat_lahir" TEXT,
    "tanggal_lahir" DATE,
    "jenis_kelamin" TEXT,
    "agama" TEXT,
    "alamat" TEXT,
    "kelas_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "students_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parents_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "student_id" UUID,
    "nama_ayah" TEXT,
    "nama_ibu" TEXT,
    "hp" TEXT,
    "email" TEXT,
    "alamat" TEXT,
    "pekerjaan" TEXT,

    CONSTRAINT "parents_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ppdb_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_name" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "payment_status" TEXT NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ppdb_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ppdb_documents_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ppdb_id" UUID,
    "type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,

    CONSTRAINT "ppdb_documents_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "galleries_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "galleries_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "photo" TEXT,
    "job" TEXT,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "testimonials_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "announcements_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ppdb_id" UUID,
    "method" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "proof" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',

    CONSTRAINT "payments_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID,
    "date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "status" TEXT NOT NULL,

    CONSTRAINT "attendance_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grades_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID,
    "teacher_id" UUID,
    "subject" TEXT NOT NULL,
    "score" DECIMAL NOT NULL,
    "description" TEXT,

    CONSTRAINT "grades_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "activity" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sender_id" UUID,
    "receiver_id" UUID,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chats_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "file_url" TEXT NOT NULL,
    "class_id" UUID,
    "teacher_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materials_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules_tk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "class_id" UUID,
    "day" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,

    CONSTRAINT "schedules_tk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings_tk" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_tk_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_tk_username_key" ON "users_tk"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_tk_email_key" ON "users_tk"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_tk_nip_key" ON "teachers_tk"("nip");

-- CreateIndex
CREATE INDEX "teachers_tk_user_id_idx" ON "teachers_tk"("user_id");

-- CreateIndex
CREATE INDEX "classes_tk_guru_id_idx" ON "classes_tk"("guru_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_tk_nik_key" ON "students_tk"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "students_tk_nisn_key" ON "students_tk"("nisn");

-- CreateIndex
CREATE INDEX "students_tk_user_id_idx" ON "students_tk"("user_id");

-- CreateIndex
CREATE INDEX "students_tk_kelas_id_idx" ON "students_tk"("kelas_id");

-- CreateIndex
CREATE INDEX "parents_tk_user_id_idx" ON "parents_tk"("user_id");

-- CreateIndex
CREATE INDEX "parents_tk_student_id_idx" ON "parents_tk"("student_id");

-- CreateIndex
CREATE INDEX "ppdb_documents_tk_ppdb_id_idx" ON "ppdb_documents_tk"("ppdb_id");

-- CreateIndex
CREATE INDEX "payments_tk_ppdb_id_idx" ON "payments_tk"("ppdb_id");

-- CreateIndex
CREATE INDEX "attendance_tk_student_id_idx" ON "attendance_tk"("student_id");

-- CreateIndex
CREATE INDEX "grades_tk_student_id_idx" ON "grades_tk"("student_id");

-- CreateIndex
CREATE INDEX "grades_tk_teacher_id_idx" ON "grades_tk"("teacher_id");

-- CreateIndex
CREATE INDEX "activity_logs_tk_user_id_idx" ON "activity_logs_tk"("user_id");

-- CreateIndex
CREATE INDEX "chats_tk_sender_id_idx" ON "chats_tk"("sender_id");

-- CreateIndex
CREATE INDEX "chats_tk_receiver_id_idx" ON "chats_tk"("receiver_id");

-- CreateIndex
CREATE INDEX "materials_tk_class_id_idx" ON "materials_tk"("class_id");

-- CreateIndex
CREATE INDEX "materials_tk_teacher_id_idx" ON "materials_tk"("teacher_id");

-- CreateIndex
CREATE INDEX "schedules_tk_class_id_idx" ON "schedules_tk"("class_id");

-- AddForeignKey
ALTER TABLE "teachers_tk" ADD CONSTRAINT "teachers_tk_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users_tk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes_tk" ADD CONSTRAINT "classes_tk_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "teachers_tk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students_tk" ADD CONSTRAINT "students_tk_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users_tk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students_tk" ADD CONSTRAINT "students_tk_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "classes_tk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents_tk" ADD CONSTRAINT "parents_tk_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users_tk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents_tk" ADD CONSTRAINT "parents_tk_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students_tk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ppdb_documents_tk" ADD CONSTRAINT "ppdb_documents_tk_ppdb_id_fkey" FOREIGN KEY ("ppdb_id") REFERENCES "ppdb_tk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments_tk" ADD CONSTRAINT "payments_tk_ppdb_id_fkey" FOREIGN KEY ("ppdb_id") REFERENCES "ppdb_tk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_tk" ADD CONSTRAINT "attendance_tk_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students_tk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades_tk" ADD CONSTRAINT "grades_tk_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students_tk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades_tk" ADD CONSTRAINT "grades_tk_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers_tk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs_tk" ADD CONSTRAINT "activity_logs_tk_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users_tk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats_tk" ADD CONSTRAINT "chats_tk_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users_tk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats_tk" ADD CONSTRAINT "chats_tk_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users_tk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials_tk" ADD CONSTRAINT "materials_tk_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes_tk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials_tk" ADD CONSTRAINT "materials_tk_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers_tk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules_tk" ADD CONSTRAINT "schedules_tk_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes_tk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve the validation rules from the Supabase schema.
ALTER TABLE "users_tk" ADD CONSTRAINT "users_tk_role_check" CHECK ("role" IN ('super_admin', 'admin', 'guru', 'orang_tua'));
ALTER TABLE "users_tk" ADD CONSTRAINT "users_tk_status_check" CHECK ("status" IN ('active', 'inactive'));
ALTER TABLE "students_tk" ADD CONSTRAINT "students_tk_gender_check" CHECK ("jenis_kelamin" IS NULL OR "jenis_kelamin" IN ('L', 'P'));
ALTER TABLE "students_tk" ADD CONSTRAINT "students_tk_status_check" CHECK ("status" IN ('active', 'inactive'));
ALTER TABLE "ppdb_tk" ADD CONSTRAINT "ppdb_tk_status_check" CHECK ("status" IN ('Draft', 'Submitted', 'Verifikasi Berkas', 'Menunggu Pembayaran', 'Pembayaran Diverifikasi', 'Tes', 'Diterima', 'Ditolak'));
ALTER TABLE "ppdb_tk" ADD CONSTRAINT "ppdb_tk_payment_status_check" CHECK ("payment_status" IN ('Pending', 'Verified', 'Rejected'));
ALTER TABLE "announcements_tk" ADD CONSTRAINT "announcements_tk_target_check" CHECK ("target" IN ('Semua', 'Guru', 'Orang Tua'));
ALTER TABLE "payments_tk" ADD CONSTRAINT "payments_tk_method_check" CHECK ("method" IN ('Transfer', 'QRIS', 'Cash'));
ALTER TABLE "payments_tk" ADD CONSTRAINT "payments_tk_status_check" CHECK ("status" IN ('Pending', 'Verified', 'Rejected'));
ALTER TABLE "attendance_tk" ADD CONSTRAINT "attendance_tk_status_check" CHECK ("status" IN ('Hadir', 'Sakit', 'Izin', 'Alfa'));
ALTER TABLE "schedules_tk" ADD CONSTRAINT "schedules_tk_day_check" CHECK ("day" IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'));

-- Defaults are safe to insert before the legacy data import because the importer upserts by key.
INSERT INTO "settings_tk" ("key", "value") VALUES
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
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updated_at" = CURRENT_TIMESTAMP;
