import React, { useState } from 'react';
import { sendFeedbackEmail } from '../services/email';
import { useAuth } from '../contexts/AuthContext';

const categories = [
    'Feedback',
    'Feature',
    'Bug',
    'UI/UX',
    'Other',
];

interface FeedbackFormProps {
    onClose: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onClose }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [category, setCategory] = useState(categories[0]);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const { user, signInWithGoogle, loading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const success = await sendFeedbackEmail({
                rating,
                category,
                title,
                text,
            });

            if (success) {
                setSubmitStatus('success');
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getSubmitButtonText = () => {
        if (isSubmitting) return 'Sending...';
        if (submitStatus === 'success') return 'Sent! ✓';
        return 'Submit';
    };

    const getSubmitButtonClass = () => {
        if (submitStatus === 'success') {
            return 'px-4 py-2 rounded bg-green-600 text-white cursor-not-allowed';
        }
        if (submitStatus === 'error') {
            return 'px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700';
        }
        return 'px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700';
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Improve the app 💡</h2>

                {/* Sign in prompt for non-authenticated users */}
                {!user && (
                    <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-blue-800 text-sm mb-2">
                            Sign in to get personalized recommendations and save your progress
                        </p>
                        <button
                            onClick={signInWithGoogle}
                            disabled={loading}
                            className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {loading ? 'Signing in...' : 'Continue with Google'}
                        </button>
                    </div>
                )}

                {submitStatus === 'success' && (
                    <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
                        Thank you for your feedback! We'll review it soon.
                    </div>
                )}

                {submitStatus === 'error' && (
                    <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
                        Failed to send feedback. Please try again.
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Your rating:</label>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    className={`text-2xl focus:outline-none ${(hover || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                    disabled={isSubmitting}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Category:</label>
                        <select
                            className="w-full border rounded px-2 py-1"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={isSubmitting}
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Title:</label>
                        <input
                            className="w-full border rounded px-2 py-1"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={60}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Details:</label>
                        <textarea
                            className="w-full border rounded px-2 py-1"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={4}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={getSubmitButtonClass()}
                            disabled={isSubmitting || submitStatus === 'success'}
                        >
                            {getSubmitButtonText()}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm; 