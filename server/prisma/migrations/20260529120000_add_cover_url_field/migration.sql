-- Добавляет cover_url, если колонки ещё нет (prod Supabase без migrate deploy)
ALTER TABLE "packages" ADD COLUMN IF NOT EXISTS "cover_url" TEXT;
