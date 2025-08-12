import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Grid, User, CreditCard, Info, History, LogOut, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthPopup from './AuthPopup';
import logo from '/logo.png';
import { AppStep } from '../types';
import profilePic from '/profile.jpeg';

interface SidebarProps {
    currentStep?: AppStep;
}

type MenuItem = {
    key: string;
    label: string;
    icon: React.ReactNode;
    to: string;
};

const menuItems: MenuItem[] = [
    {
        key: 'analyze',
        label: 'analyze',
        icon: <FileText className="w-4 h-4 mr-2" />,
        to: '/',
    },
    {
        key: 'dashboard',
        label: 'dashboard',
        icon: <History className="w-4 h-4 mr-2" />,
        to: '/Dashboard', // Updated route
    },
    {
        key: 'account',
        label: 'account',
        icon: <User className="w-4 h-4 mr-2" />,
        to: '/account',
    },
    {
        key: 'subscription',
        label: 'subscription',
        icon: <CreditCard className="w-4 h-4 mr-2" />,
        to: '#', // Placeholder for future route
    },
];

const moreItems: MenuItem[] = [
    {
        key: 'about',
        label: 'about jobify',
        icon: <Info className="w-4 h-4 mr-2" />,
        to: '/about', // Updated route
    },
];

const Sidebar: React.FC<SidebarProps> = () => {
    const location = useLocation();
    const { user, signOut, profile } = useAuth();
    const [showAuthPopup, setShowAuthPopup] = useState(false);

    const getItemClasses = (to: string) => {
        const isActive = to !== '#' && location.pathname === to;
        if (isActive) {
            return 'flex items-center px-3 py-2 rounded-lg text-sm font-medium text-purple-700 bg-purple-100';
        }
        return 'flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200';
    };

    const handleSignOut = async () => {
        await signOut();
    };

    const handleAccountClick = (e: React.MouseEvent, item: MenuItem) => {
        if (item.key === 'account' && !user) {
            e.preventDefault();
            setShowAuthPopup(true);
        }
    };

    return (
        <>
            <aside className="h-screen w-56 bg-white border-r border-gray-200 flex flex-col justify-between py-8 px-5 fixed left-0 top-0 z-40">
                <div>
                    {/* Logo */}
                    <div className="flex items-center mb-10">
                        <img src={logo} alt="Jobify Logo" className="rounded-lg w-8 h-8 mr-3" />
                        <span className="text-2xl font-bold text-gray-900 font-raleway">Jobify</span>
                    </div>
                    {/* Menu */}
                    <nav className="mb-8">
                        <p className="text-xs font-bold text-gray-500 mb-2 ml-2">Menu</p>
                        <ul className="space-y-1">
                            {menuItems.map((item) => (
                                <li key={item.key}>
                                    {item.to === '#' ? (
                                        <span className={getItemClasses(item.to)}>{item.icon}{item.label}</span>
                                    ) : (
                                        <Link
                                            to={item.to}
                                            className={getItemClasses(item.to)}
                                            onClick={(e) => handleAccountClick(e, item)}
                                        >
                                            {item.icon}{item.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>
                    {/* More */}
                    <nav>
                        <p className="text-xs font-bold text-gray-500 mb-2 ml-2">More</p>
                        <ul className="space-y-1">
                            {moreItems.map((item) => (
                                <li key={item.key}>
                                    {item.to === '#' ? (
                                        <span className={getItemClasses(item.to)}>{item.icon}{item.label}</span>
                                    ) : (
                                        <Link to={item.to} className={getItemClasses(item.to)}>{item.icon}{item.label}</Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* User Profile Section - Only show if authenticated */}
                {user && (
                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-purple-100 overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="avatar"
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                                    <img
                                        src={user.user_metadata.avatar_url || user.user_metadata.picture}
                                        alt="avatar"
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm font-medium text-purple-700">
                                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.user_metadata?.full_name || user?.email || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-200"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign out
                        </button>
                    </div>
                )}
            </aside>

            {/* Auth Popup */}
            <AuthPopup
                isOpen={showAuthPopup}
                onClose={() => setShowAuthPopup(false)}
                title="Sign in to access your account"
                message="To view your profile and manage your account, please sign in with your Google account."
            />
        </>
    );
};

export default Sidebar; 