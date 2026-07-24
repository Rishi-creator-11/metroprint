-- Grant admin access to a user (run in Supabase SQL Editor)
-- Replace the email with your admin account

UPDATE auth.users
SET raw_app_meta_data =
  COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'priyanshudalla9@gmail.com';

-- Verify it worked:
-- SELECT email, raw_app_meta_data FROM auth.users WHERE email = 'priyanshudalla9@gmail.com';
