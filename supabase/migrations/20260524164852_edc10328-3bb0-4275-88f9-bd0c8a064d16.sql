
-- Fix function search_path and lock down SECURITY DEFINER functions

ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

-- These pgmq helpers are only meant to be called from edge functions running as service_role
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

-- has_role is used inside RLS policies by signed-in users; keep authenticated EXECUTE, revoke from anon/public
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

-- Remove broad SELECT policies that allow listing public buckets.
-- Public files are still served via /storage/v1/object/public/<bucket>/<path> which bypasses RLS.
DROP POLICY IF EXISTS "Book covers are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public can read book covers object" ON storage.objects;
DROP POLICY IF EXISTS "Public can read book audio object" ON storage.objects;
