import React from 'react';

interface WelcomePopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
            {/* Blurred background overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />

            {/* Popup content */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-xs sm:max-w-lg mx-2 sm:mx-4 transform animate-slideIn overflow-y-auto max-h-[90vh]">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 sm:p-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ touchAction: 'manipulation' }}
                >
                    <svg className="w-7 h-7 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content with left alignment */}
                <div className="text-left">
                    {/* Title */}
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                        Welcome to Jobify Beta
                    </h2>

                    {/* Date and Version */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4">
                        <span>5th July 2025</span>
                        <span>•</span>
                        <span>🚀 v0.1.0</span>
                    </div>

                    {/* Message */}
                    <div className="space-y-3 sm:space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
                        <p>
                            Welcome to Jobify Beta! This is your AI-powered companion
                            that transforms your CV analysis experience.
                        </p>

                        <p>
                            Our intelligent system evaluates your resume against job requirements standards,
                            provides ATS compatibility scores, and offers personalized improvement suggestions
                            to maximize your chances of landing your dream job.
                        </p>

                        <p>
                            Ready to optimize your career path? Let's get started! 🚀
                        </p>
                    </div>

                    {/* Messenger */}
                    <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0">
                                <img
                                    src="/profile.jpeg"
                                    alt="Aykhan Shahbazov"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 text-sm sm:text-base">Aykhan Shahbazov</p>
                                <p className="text-xs sm:text-sm text-gray-600">Experience Specialist at Kyriba</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Close button at bottom */}
                <div className="mt-4 sm:mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="bg-black text-white w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium text-base sm:text-lg"
                        style={{ touchAction: 'manipulation' }}
                    >
                        Let's Get Started!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomePopup; 