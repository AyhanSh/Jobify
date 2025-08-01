import React from 'react';

interface MemePopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const MemePopup: React.FC<MemePopupProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
            {/* Blurred background overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />

            {/* Popup content */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-xs sm:max-w-md mx-2 sm:mx-4 transform animate-slideIn">

                {/* Title */}
                <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
                    Nah, stay unemployed Amina🥀
                </h2>

                {/* Message */}
                <p className="text-gray-700 text-center leading-relaxed">
                    System detected toxic interference by the name Amina. Our policy code states to eliminate this "subject" from the data base.
                </p>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 italic">
                        That's a joke, don't cry. Close this popup and get ur results ngga
                    </p>
                </div>

                {/* Close button at bottom */}
                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-medium text-base sm:text-lg"
                    >
                        Close & Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemePopup; 