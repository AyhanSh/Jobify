import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Profile {
    id: string;
    full_name: string;
    avatar_url: string;
    phone: string;
    address: string;
    bio: string;
    website: string;
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
    profile: Profile | null
    profileLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [profileLoading, setProfileLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setProfile(null)
                setProfileLoading(false)
                return
            }
            setProfileLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            if (error) {
                setProfile(null)
            } else {
                setProfile(data)
            }
            setProfileLoading(false)
        }
        fetchProfile()
    }, [user])

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })
        if (error) console.error('Error signing in with Google:', error)
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) console.error('Error signing out:', error)
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut, profile, profileLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
} 