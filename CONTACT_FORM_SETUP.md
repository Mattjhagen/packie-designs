# Contact Form Email Setup Guide

## Current Status
Your contact form is currently set up with EmailJS integration but needs configuration.

## Option 1: EmailJS Setup (Recommended - Easiest)

### Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Add Email Service
1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider:
   - **Gmail**: Connect your Gmail account
   - **Outlook**: Connect your Outlook account
   - **Custom SMTP**: For other email providers
4. Note down your **Service ID**

### Step 3: Create Email Template
1. Go to "Email Templates"
2. Click "Create New Template"
3. Use this template:

```
Subject: New Contact Form Message: {{subject}}

From: {{from_name}} ({{from_email}})

Message:
{{message}}

---
This message was sent from your website contact form.
```

4. Note down your **Template ID**

### Step 4: Get Public Key
1. Go to "Account" → "General"
2. Copy your **Public Key**

### Step 5: Update Your Code
Replace these values in `script.js`:

```javascript
// Line 236: Replace with your public key
emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");

// Line 251: Replace with your service ID and template ID
emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
```

### Step 6: Test
1. Save and deploy your changes
2. Test the contact form
3. Check your email for the message

---

## Option 2: Backend API (More Control)

### Using Your Existing Node.js Backend

Add this endpoint to your `server.js`:

```javascript
const nodemailer = require('nodemailer');

// Add to your existing server.js
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Create transporter (configure for your email provider)
        const transporter = nodemailer.createTransporter({
            service: 'gmail', // or your email service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        // Email options
        const mailOptions = {
            from: email,
            to: 'matty@pacmacmobile.com',
            subject: `Contact Form: ${subject}`,
            html: `
                <h3>New Contact Form Message</h3>
                <p><strong>From:</strong> ${name} (${email})</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Email sent successfully' });
        
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
});
```

Then update the contact form JavaScript to call this endpoint.

---

## Option 3: Third-Party Services

### Formspree
1. Go to [Formspree.io](https://formspree.io/)
2. Create account and form
3. Get form endpoint
4. Update form action in HTML

### Netlify Forms
1. Add `netlify` attribute to form
2. Deploy to Netlify
3. Forms automatically work

### Getform
1. Go to [Getform.io](https://getform.io/)
2. Create form endpoint
3. Update form action

---

## Environment Variables (for Backend Option)

Add to your `.env` file:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## Testing Your Setup

1. **Fill out the contact form**
2. **Submit the form**
3. **Check your email inbox**
4. **Verify the message content**

---

## Troubleshooting

### EmailJS Issues
- Check browser console for errors
- Verify all IDs are correct
- Ensure email service is connected
- Check spam folder

### Backend Issues
- Check server logs
- Verify environment variables
- Test email credentials
- Check CORS settings

---

## Security Notes

- Never expose email credentials in frontend code
- Use environment variables for sensitive data
- Consider rate limiting for contact forms
- Validate and sanitize form inputs

---

## Next Steps

1. Choose your preferred option
2. Follow the setup steps
3. Test thoroughly
4. Deploy to production
5. Monitor for issues

The EmailJS option is recommended for simplicity and doesn't require backend changes.
