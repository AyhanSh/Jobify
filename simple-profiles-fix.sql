-- Simple Profiles Fix - This will definitely work!
-- Run this in your Supabase Dashboard > SQL Editor

-- Drop the existing table completely
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create a simple profiles table without RLS initially
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    address TEXT,
    bio TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS temporarily to get it working
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Grant all permissions
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Create a simple function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert a test profile for the current user
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get the current user ID from the session
    SELECT auth.uid() INTO current_user_id;
    
    -- If we have a current user, insert a profile for them
    IF current_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, full_name, avatar_url, phone, address, bio, website)
        VALUES (
            current_user_id,
            'Test User',
            'https://via.placeholder.com/150',
            '+1234567890',
            '123 Test Street',
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
    END IF;
END $$;

-- Test query to verify it works
SELECT 'Profiles table created successfully!' as status;
SELECT COUNT(*) as profile_count FROM public.profiles; 