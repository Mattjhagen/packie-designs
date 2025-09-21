// EmailJS Configuration
// Replace these values with your actual EmailJS credentials

const EMAILJS_CONFIG = {
    // Get this from EmailJS Dashboard → Account → General
    PUBLIC_KEY: "YOUR_EMAILJS_PUBLIC_KEY",
    
    // Get this from EmailJS Dashboard → Email Services
    SERVICE_ID: "YOUR_SERVICE_ID",
    
    // Get this from EmailJS Dashboard → Email Templates
    TEMPLATE_ID: "YOUR_TEMPLATE_ID",
    
    // Your email address where contact form messages will be sent
    TO_EMAIL: "matty@pacmacmobile.com"
};

// Instructions:
// 1. Go to https://www.emailjs.com/
// 2. Sign up and create an account
// 3. Add an email service (Gmail recommended over iCloud)
// 4. Create an email template
// 5. Copy the values above and replace the placeholders
// 6. Save this file
// 7. Test your contact form

// For iCloud email issues:
// - iCloud doesn't work well with EmailJS
// - Use Gmail or Outlook instead
// - If you must use iCloud, try Custom SMTP with these settings:
//   SMTP Server: smtp.mail.me.com
//   Port: 587
//   Security: STARTTLS
//   Username: your-full-icloud-email@icloud.com
//   Password: your-app-specific-password
