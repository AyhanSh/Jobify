-- Test RLS Policies
-- Run this after running fix-profiles-rls.sql

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check if the current user can access their profile
-- This should return the current user's profile if they exist
SELECT * FROM public.profiles WHERE id = auth.uid();

-- Check all profiles (this should only show the current user's profile due to RLS)
SELECT id, full_name, created_at FROM public.profiles;

-- Test inserting a profile for the current user
INSERT INTO public.profiles (id, full_name, avatar_url, phone, address, bio, website)
VALUES (
    auth.uid(),
    'Test User ' || auth.uid(),
    'https://via.placeholder.com/150',
    '+1234567890',
    '123 Test St, Test City',
    'This is a test bio',
    'https://example.com'
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    bio = EXCLUDED.bio,
    website = EXCLUDED.website,
    updated_at = NOW();

-- Verify the insert/update worked
SELECT * FROM public.profiles WHERE id = auth.uid(); 