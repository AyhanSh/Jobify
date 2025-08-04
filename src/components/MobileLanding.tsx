import React from 'react';
import logo from '/logo.png';

interface MobileLandingProps {
    onContinue: () => void;
}

const MobileLanding: React.FC<MobileLandingProps> = ({ onContinue }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center text-center">
                {/* Logo */}
                <img
                    src={logo}
                    alt="Jobify Logo"
                    className="w-20 h-20 mb-6 rounded-2xl shadow-lg"
                />

                {/* Title */}
                <h1 className="text-3xl font-extrabold text-purple-700 mb-4 tracking-tight">
                    Jobify
                </h1>

                {/* Subtitle */}
                <p className="text-lg text-gray-600 mb-6">
                    AI-powered CV analysis and career guidance
                </p>

                {/* Message */}
                <div className="bg-blue-50 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-center mb-3">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Desktop Version Only
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Jobify is currently optimized for desktop and tablet devices.
                        Please visit us on a larger screen for the best experience.
                    </p>
                </div>

                {/* Features Preview */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        AI-powered CV analysis
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Personalized feedback
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Career guidance
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-gray-400 text-xs mt-8">
                    &copy; {new Date().getFullYear()} Jobify. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default MobileLanding; 