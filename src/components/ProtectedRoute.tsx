import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthPopup from './AuthPopup';

interface ProtectedRouteProps {
    children: React.ReactNode;
    title?: string;
    message?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    title = "Sign in required",
    message = "Please sign in to access this page."
}) => {
    const { user } = useAuth();
    const [showAuthPopup, setShowAuthPopup] = React.useState(false);

    React.useEffect(() => {
        if (!user) {
            setShowAuthPopup(true);
        }
    }, [user]);

    if (!user) {
        return (
            <>
                <div className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Authentication Required</h1>
                        <p className="text-gray-600">{message}</p>
                    </div>
                </div>
                <AuthPopup
                    isOpen={showAuthPopup}
                    onClose={() => setShowAuthPopup(false)}
                    title={title}
                    message={message}
                    closable={false}
                />
            </>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute; 