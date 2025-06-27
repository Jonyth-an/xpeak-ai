# Supabase Email Templates Configuration

## Overview

Configure branded email templates in Supabase Dashboard to match Xpeak AI's design and messaging.

## Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your Xpeak AI project
4. Navigate to **Authentication** → **Email Templates**

## Email Templates to Configure

### 1. Confirm Signup Template

**Template Name**: `Confirm signup`

**Subject Line**: `Confirm your Xpeak AI account`

**HTML Template**:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm your Xpeak AI account</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            color: #6366f1;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h2 {
            color: #1f2937;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 10px 0;
        }
        .header p {
            color: #6b7280;
            font-size: 16px;
            margin: 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-1px);
        }
        .content {
            margin: 30px 0;
        }
        .content p {
            color: #4b5563;
            font-size: 16px;
            margin-bottom: 15px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            color: #9ca3af;
            font-size: 14px;
            margin: 5px 0;
        }
        .features {
            background: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .features h3 {
            color: #1f2937;
            font-size: 18px;
            margin: 0 0 15px 0;
        }
        .features ul {
            margin: 0;
            padding-left: 20px;
        }
        .features li {
            color: #4b5563;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>Xpeak AI</h1>
        </div>
        
        <div class="header">
            <h2>Welcome to Xpeak AI! 🎉</h2>
            <p>Your AI-powered language learning journey starts now</p>
        </div>
        
        <div class="content">
            <p>Hi there!</p>
            <p>Thank you for joining Xpeak AI! We're excited to help you master new languages with personalized AI coaching.</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Confirm Your Email Address</a>
            </div>
            
            <p>This link will expire in 24 hours. If you didn't create an account with Xpeak AI, you can safely ignore this email.</p>
            
            <div class="features">
                <h3>What you'll get with Xpeak AI:</h3>
                <ul>
                    <li>🎯 Personalized learning plans tailored to your goals</li>
                    <li>🤖 AI-powered conversation practice with native speakers</li>
                    <li>📊 Real-time progress tracking and analytics</li>
                    <li>🌍 Access to 50+ languages and dialects</li>
                    <li>💬 Smart matching with expert tutors</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>Best regards,<br>The Xpeak AI Team</p>
            <p>Questions? Contact us at support@xpeak.ai</p>
            <p>© 2024 Xpeak AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

### 2. Magic Link Template

**Template Name**: `Magic Link`

**Subject Line**: `Sign in to Xpeak AI`

**HTML Template**:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in to Xpeak AI</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            color: #6366f1;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h2 {
            color: #1f2937;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 10px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-1px);
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            color: #9ca3af;
            font-size: 14px;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>Xpeak AI</h1>
        </div>
        
        <div class="header">
            <h2>Welcome back! 👋</h2>
            <p>Click the button below to sign in to your Xpeak AI account</p>
        </div>
        
        <div style="text-align: center;">
            <a href="{{ .TokenHash }}" class="button">Sign In to Xpeak AI</a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; text-align: center;">
            This link will expire in 1 hour. If you didn't request this sign-in link, you can safely ignore this email.
        </p>
        
        <div class="footer">
            <p>© 2024 Xpeak AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

### 3. Reset Password Template

**Template Name**: `Reset password`

**Subject Line**: `Reset your Xpeak AI password`

**HTML Template**:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your Xpeak AI password</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            color: #6366f1;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h2 {
            color: #1f2937;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 10px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-1px);
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            color: #9ca3af;
            font-size: 14px;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>Xpeak AI</h1>
        </div>
        
        <div class="header">
            <h2>Reset Your Password 🔐</h2>
            <p>We received a request to reset your Xpeak AI password</p>
        </div>
        
        <p>Hi there,</p>
        <p>Someone requested to reset the password for your Xpeak AI account. If this was you, click the button below to create a new password:</p>
        
        <div style="text-align: center;">
            <a href="{{ .TokenHash }}" class="button">Reset Password</a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email and your password will remain unchanged.
        </p>
        
        <div class="footer">
            <p>© 2024 Xpeak AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

## Configuration Steps

1. **Navigate to Email Templates**:
   - Go to Supabase Dashboard → Authentication → Email Templates

2. **Update Each Template**:
   - Click on each template name
   - Replace the default HTML with the branded version above
   - Update the subject line
   - Click "Save" to apply changes

3. **Test the Templates**:
   - Use the "Send test email" feature to preview
   - Test with different email clients (Gmail, Outlook, etc.)

## Customization Options

### Colors
- Primary: `#6366f1` (Indigo)
- Secondary: `#8b5cf6` (Purple)
- Text: `#1f2937` (Dark gray)
- Background: `#f8fafc` (Light gray)

### Logo
- Replace the text logo with an actual image logo
- Upload logo to a CDN and replace the `<h1>Xpeak AI</h1>` with an `<img>` tag

### Content
- Update the feature list in the signup template
- Modify the copy to match your brand voice
- Add social media links in the footer

## Best Practices

1. **Mobile Responsive**: All templates are mobile-friendly
2. **Accessibility**: High contrast colors and readable fonts
3. **Brand Consistency**: Matches your website design
4. **Clear CTAs**: Prominent buttons with clear action text
5. **Security Messaging**: Clear expiration times and security notices 