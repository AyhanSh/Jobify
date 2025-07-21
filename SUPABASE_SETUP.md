# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: `jobify-app`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
6. Click "Create new project"

## 2. Get Project Credentials

1. Go to Settings → API
2. Copy the following values:
   - Project URL
   - Anon public key

## 3. Set Environment Variables

Create a `.env.local` file in your project root:

```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Enable Google OAuth

1. Go to Authentication → Providers
2. Find Google and click "Enable"
3. You'll need to create OAuth credentials in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
   - Application type: Web application
   - Authorized redirect URIs: `https://your-project-ref.supabase.co/auth/v1/callback`
4. Copy the Client ID and Client Secret to Supabase Google provider settings

## 5. Deploy Edge Function

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Deploy the function:
   ```bash
   supabase functions deploy analyze-cv
   ```

## 6. Set OpenAI API Key in Supabase

1. Go to Settings → Edge Functions
2. Find the `analyze-cv` function
3. Add environment variable:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-your-openai-api-key-here`

## 7. Database Schema (Optional)

Create tables for storing user data:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create CVs table
CREATE TABLE cvs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  filename TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analyses table
CREATE TABLE analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
  preferences JSONB,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own CVs" ON cvs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own CVs" ON cvs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own CVs" ON cvs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analyses" ON analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own analyses" ON analyses FOR DELETE USING (auth.uid() = user_id);
```

## 8. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try signing in with Google
3. Test CV analysis functionality

## 9. Production Deployment

1. Deploy your frontend to Vercel/Netlify
2. Update Google OAuth redirect URIs to include your production domain
3. Set environment variables in your hosting platform
4. Deploy Supabase Edge Functions to production

## Troubleshooting

- **Google OAuth not working**: Check redirect URIs in Google Cloud Console
- **Edge Function errors**: Check Supabase logs in Dashboard → Edge Functions
- **CORS errors**: Edge function includes CORS headers, should work automatically
- **Authentication issues**: Check Supabase Auth settings and policies

## Security Notes

✅ OpenAI API key is now secure in Supabase Edge Functions
✅ User authentication with Google OAuth
✅ Row Level Security enabled on database tables
✅ Environment variables properly configured 