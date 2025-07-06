# Email Setup for Feedback Feature

This guide explains how to set up email functionality to receive feedback from users.

## Option 1: EmailJS (Recommended for Frontend-only Apps)

1. **Sign up for EmailJS**
   - Go to https://www.emailjs.com/
   - Create a free account

2. **Create an Email Service**
   - Add your email provider (Gmail, Outlook, etc.)
   - Note down your Service ID

3. **Create an Email Template**
   - Create a new template
   - Use variables: `{{rating}}`, `{{category}}`, `{{title}}`, `{{text}}`, `{{timestamp}}`, `{{user_agent}}`
   - Note down your Template ID

4. **Get your Public Key**
   - Find your Public Key in the EmailJS dashboard

5. **Configure Environment Variables**
   Create a `.env` file in your project root:
   ```env
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   VITE_FEEDBACK_EMAIL=your-email@example.com
   ```

6. **Install EmailJS Package**
   ```bash
   npm install @emailjs/browser
   ```

7. **Uncomment EmailJS Code**
   - Open `src/services/email.ts`
   - Uncomment the EmailJS code in the `sendViaEmailJS` function

## Option 2: Custom Backend API

If you have a backend server:

1. **Set up your backend endpoint**
   - Create an API endpoint that accepts POST requests
   - Configure it to send emails (using nodemailer, SendGrid, etc.)

2. **Configure Environment Variables**
   ```env
   VITE_EMAIL_SERVICE_URL=https://your-backend.com/api/send-feedback
   VITE_FEEDBACK_EMAIL=your-email@example.com
   ```

## Option 3: Fallback (Current Setup)

Currently, the app logs feedback to the console and shows a success message. This is useful for testing.

## Testing

1. Start your development server
2. Fill out the feedback form
3. Check your email (if configured) or browser console (if using fallback)

## Email Template Example

Here's a sample email template for EmailJS:

```
Subject: App Feedback: {{category}} - {{title}}

📧 New App Feedback

⭐ Rating: {{rating}}/5
📂 Category: {{category}}
📝 Title: {{title}}
📄 Details: {{text}}

⏰ Timestamp: {{timestamp}}
🌐 User Agent: {{user_agent}}
```

## Troubleshooting

- **EmailJS errors**: Check your service ID, template ID, and public key
- **CORS issues**: Make sure your backend allows requests from your frontend domain
- **Environment variables**: Ensure they start with `VITE_` for Vite to expose them 