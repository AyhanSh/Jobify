import React, { useState } from 'react';
import { sendFeedbackEmail } from '../services/email';

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