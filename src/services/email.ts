interface FeedbackData {
    rating: number;
    category: string;
    title: string;
    text: string;
    timestamp: string;
    userAgent: string;
}

// You can replace this with your preferred email service
// Options: EmailJS, SendGrid, AWS SES, or your own backend API
const EMAIL_SERVICE_URL = import.meta.env.VITE_EMAIL_SERVICE_URL || 'https://your-email-service.com/api/send';
const RECIPIENT_EMAIL = import.meta.env.VITE_FEEDBACK_EMAIL || 'your-email@example.com';

export const sendFeedbackEmail = async (feedbackData: Omit<FeedbackData, 'timestamp' | 'userAgent'>): Promise<boolean> => {
    const fullFeedbackData: FeedbackData = {
        ...feedbackData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
    };

    try {
        // Option 1: Using EmailJS (you'll need to set up an EmailJS account)
        if (import.meta.env.VITE_EMAILJS_SERVICE_ID) {
            return await sendViaEmailJS(fullFeedbackData);
        }

        // Option 2: Using a custom backend API
        if (EMAIL_SERVICE_URL !== 'https://your-email-service.com/api/send') {
            return await sendViaCustomAPI(fullFeedbackData);
        }

        // Option 3: Fallback - log to console and show success message
        console.log('Feedback received:', fullFeedbackData);
        return true;

    } catch (error) {
        console.error('Failed to send feedback email:', error);
        return false;
    }
};

const sendViaEmailJS = async (feedbackData: FeedbackData): Promise<boolean> => {
    // This requires EmailJS setup
    // You'll need to install: npm install @emailjs/browser
    // And configure your EmailJS service
    try {
        // Uncomment and configure when you set up EmailJS

        const { send } = await import('@emailjs/browser');

        const templateParams = {
            rating: feedbackData.rating,
            category: feedbackData.category,
            title: feedbackData.title,
            text: feedbackData.text,
            timestamp: feedbackData.timestamp,
            useragent: feedbackData.userAgent, // <-- must be 'useragent'
        };

        await send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID!,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID!,
            templateParams,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY!
        );

        // For now, just log the data
        console.log('EmailJS would send:', feedbackData);
        return true;
    } catch (error) {
        console.error('EmailJS error:', error);
        return false;
    }
};

const sendViaCustomAPI = async (feedbackData: FeedbackData): Promise<boolean> => {
    const response = await fetch(EMAIL_SERVICE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            to: RECIPIENT_EMAIL,
            subject: `App Feedback: ${feedbackData.category} - ${feedbackData.title}`,
            feedback: feedbackData,
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
};

// Helper function to format feedback for display
export const formatFeedbackForEmail = (feedbackData: FeedbackData): string => {
    const stars = '★'.repeat(feedbackData.rating) + '☆'.repeat(5 - feedbackData.rating);

    return `
📧 New App Feedback

⭐ Rating: ${stars} (${feedbackData.rating}/5)
📂 Category: ${feedbackData.category}
📝 Title: ${feedbackData.title}
📄 Details: ${feedbackData.text}

⏰ Timestamp: ${new Date(feedbackData.timestamp).toLocaleString()}
🌐 User Agent: ${feedbackData.userAgent}
  `.trim();
}; 