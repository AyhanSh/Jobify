import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import profilePic from '/profile.jpeg';

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

const AccountPage: React.FC = () => {
    const { user, signOut } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: '',
        phone: '',
        address: '',
        bio: '',
        website: ''
    });
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            // First try to get profile from profiles table
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                throw profileError;
            }

            // If profile doesn't exist, create one with auth user data
            if (!profileData) {
                const newProfile = {
                    id: user?.id,
                    full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
                    avatar_url: user?.user_metadata?.avatar_url || '',
                    phone: '',
                    address: '',
                    bio: '',
                    website: '',
                };

                const { data: createdProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert([newProfile])
                    .select()
                    .single();

                if (createError) throw createError;
                setProfile(createdProfile);
            } else {
                setProfile(profileData);
                setEditForm({
                    full_name: profileData.full_name || '',
                    phone: profileData.phone || '',
                    address: profileData.address || '',
                    bio: profileData.bio || '',
                    website: profileData.website || ''
                });
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editForm.full_name,
                    phone: editForm.phone,
                    address: editForm.address,
                    bio: editForm.bio,
                    website: editForm.website,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user?.id);

            if (error) throw error;

            // Refresh profile data
            await fetchProfile();
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
    };

    // Handle image upload
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setUploading(true);
        setUploadError(null);
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${Date.now()}.${fileExt}`;
            // Upload to Supabase Storage
            let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
                upsert: true,
                contentType: file.type,
            });
            if (uploadError) throw uploadError;
            // Get public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const publicUrl = data.publicUrl;
            // Update profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
                .eq('id', user.id);
            if (updateError) throw updateError;
            // Refresh profile
            await fetchProfile();
        } catch (err: any) {
            setUploadError('Failed to upload image');
            console.error('Image upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchProfile}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!user || !profile) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Please sign in to view your profile</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Profile</h1>
            <p className="text-gray-500 mb-8">Manage your personal information and preferences</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personal Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.full_name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Address</label>
                                    <textarea
                                        value={editForm.address}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Bio</label>
                                    <textarea
                                        value={editForm.bio}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Website</label>
                                    <input
                                        type="url"
                                        value={editForm.website}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </span>
                                    <div>
                                        <div className="text-sm text-gray-500">Full Name</div>
                                        <div className="font-medium text-gray-900">{profile.full_name || 'Not set'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm0 0v1a4 4 0 01-8 0v-1" /></svg>
                                    </span>
                                    <div>
                                        <div className="text-sm text-gray-500">Email</div>
                                        <div className="font-medium text-gray-900">{user.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.48 19h9.04a2 2 0 001.83-1.3L17 13M7 13V6h10v7" /></svg>
                                    </span>
                                    <div>
                                        <div className="text-sm text-gray-500">Phone</div>
                                        <div className="font-medium text-gray-900">{profile.phone || 'Not set'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </span>
                                    <div>
                                        <div className="text-sm text-gray-500">Address</div>
                                        <div className="font-medium text-gray-900">{profile.address || 'Not set'}</div>
                                    </div>
                                </div>
                                {profile.bio && (
                                    <div className="flex items-start space-x-3">
                                        <span className="text-gray-400 mt-1">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                        </span>
                                        <div>
                                            <div className="text-sm text-gray-500">Bio</div>
                                            <div className="font-medium text-gray-900">{profile.bio}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-8">
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
                        <img
                            src={profile.avatar_url || profilePic}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-pink-100"
                        />
                        <div className="font-semibold text-lg text-gray-900">{profile.full_name}</div>
                        <div className="text-gray-500 text-sm mb-4">{user.email}</div>
                        <label className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer">
                            {uploading ? 'Uploading...' : 'Change Photo'}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                                disabled={uploading}
                            />
                        </label>
                        {uploadError && <div className="text-xs text-red-500 mt-2">{uploadError}</div>}
                    </div>

                    {/* Security Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
                        <div className="space-y-2 mb-4">
                            <button className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                                <span className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.104.896-2 2-2s2 .896 2 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2c0-1.104.896-2 2-2z" />
                                    </svg>
                                    Change Password
                                </span>
                                <span className="text-gray-400">&gt;</span>
                            </button>
                            <button className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                                <span className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm0 0v1a4 4 0 01-8 0v-1" />
                                    </svg>
                                    Two-Factor Authentication
                                </span>
                                <span className="text-gray-400">&gt;</span>
                            </button>
                        </div>
                        <div className="text-xs text-gray-400 mb-4">
                            Last login: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Unknown'}
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="w-full py-2 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPage; 