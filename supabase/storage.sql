-- ============================================================
-- Supabase Storage Setup
-- Run these in the Supabase SQL editor AFTER schema.sql
-- ============================================================

-- Create the photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public reads on the photos bucket
CREATE POLICY "Public read photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

-- Allow authenticated/anon inserts
CREATE POLICY "Anon upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos');

-- ============================================================
-- NOTE: If using Supabase Dashboard:
-- 1. Go to Storage → New Bucket
-- 2. Name: photos
-- 3. Check "Public bucket"
-- 4. Save
-- ============================================================
