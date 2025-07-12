import { serverSupabase } from '@/lib/serverSupabaseClient';

interface TutorNotificationData {
  tutorName: string;
  tutorEmail: string;
  applicationId: string;
  dashboardUrl: string;
}

export class TutorNotificationService {
  
  /**
   * Send welcome email to newly approved tutor
   */
  static async sendApprovalWelcomeEmail(data: TutorNotificationData): Promise<boolean> {
    try {
      // For now, we'll log the email content
      // In production, this would integrate with an email service like SendGrid, Resend, etc.
      
      const emailContent = this.generateWelcomeEmailContent(data);
      
      console.log('🎉 TUTOR APPROVAL EMAIL TO SEND:');
      console.log('To:', data.tutorEmail);
      console.log('Subject:', emailContent.subject);
      console.log('Content:', emailContent.html);
      
      // TODO: Integrate with actual email service
      // await sendEmail({
      //   to: data.tutorEmail,
      //   subject: emailContent.subject,
      //   html: emailContent.html
      // });
      
      // For now, return true to simulate successful email sending
      return true;
      
    } catch (error) {
      console.error('Error sending tutor approval email:', error);
      return false;
    }
  }

  /**
   * Generate welcome email content for approved tutor
   */
  private static generateWelcomeEmailContent(data: TutorNotificationData) {
    const subject = '🎉 Welcome to Xpeak! Your Tutor Application Has Been Approved';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Xpeak Tutors</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .highlight { background: #f8f9ff; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations, ${data.tutorName}!</h1>
            <p>Your tutor application has been approved</p>
          </div>
          
          <div class="content">
            <h2>Welcome to the Xpeak Tutor Community!</h2>
            
            <p>We're thrilled to have you join our team of exceptional language tutors. After careful review of your application, we're excited to welcome you to the Xpeak family.</p>
            
            <div class="highlight">
              <h3>🚀 Your Tutor Dashboard is Ready!</h3>
              <p>You now have access to your personalized tutor dashboard where you can:</p>
              <ul>
                <li>📅 Set your availability and manage your schedule</li>
                <li>👥 Connect with students and view lesson history</li>
                <li>💰 Track your earnings and manage payouts</li>
                <li>📊 Monitor your performance and student feedback</li>
                <li>🛠️ Access teaching tools and resources</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${data.dashboardUrl}" class="cta-button">Access Your Tutor Dashboard</a>
            </div>
            
            <h3>🎯 Next Steps:</h3>
            <ol>
              <li><strong>Complete your profile:</strong> Add your bio, profile photo, and teaching specializations</li>
              <li><strong>Set your availability:</strong> Open time slots for students to book lessons</li>
              <li><strong>Review platform guidelines:</strong> Familiarize yourself with our teaching standards</li>
              <li><strong>Test your setup:</strong> Ensure your camera, microphone, and internet connection are ready</li>
            </ol>
            
            <div class="highlight">
              <h3>💡 Pro Tips for Success:</h3>
              <ul>
                <li>Maintain a consistent schedule to build student trust</li>
                <li>Prepare engaging lesson materials</li>
                <li>Provide constructive feedback to help students improve</li>
                <li>Keep your profile updated with your latest achievements</li>
              </ul>
            </div>
            
            <h3>🆘 Need Help?</h3>
            <p>Our support team is here to help you succeed:</p>
            <ul>
              <li>📚 <a href="${data.dashboardUrl}/tools">Visit our Teaching Resources</a></li>
              <li>💬 <a href="${data.dashboardUrl}/safety">Contact Support</a></li>
              <li>📧 Email us at tutors@xpeak.ai</li>
            </ul>
            
            <p>We're excited to see the positive impact you'll have on our students' language learning journey. Welcome aboard!</p>
            
            <p>Best regards,<br>
            <strong>The Xpeak Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2024 Xpeak. All rights reserved.</p>
            <p>This email was sent because your tutor application was approved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return { subject, html };
  }

  /**
   * Send timezone update reminder email
   */
  static async sendTimezoneUpdateReminder(tutorEmail: string, tutorName: string, detectedTimezone: string, profileTimezone: string): Promise<boolean> {
    try {
      const subject = '🌍 Please Update Your Timezone - Xpeak Tutor';
      
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Hi ${tutorName},</h2>
          
          <p>We noticed that your current timezone (${detectedTimezone}) is different from what's set in your profile (${profileTimezone}).</p>
          
          <p>To ensure students can book lessons at the correct times, please update your timezone in your dashboard settings.</p>
          
          <div style="background: #f8f9ff; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p><strong>Why this matters:</strong></p>
            <ul>
              <li>Students see lesson times in their local timezone</li>
              <li>Accurate scheduling prevents confusion and missed lessons</li>
              <li>Your availability will be displayed correctly</li>
            </ul>
          </div>
          
          <p><a href="/tutor/settings" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Update Timezone Settings</a></p>
          
          <p>Thanks for keeping your profile accurate!</p>
          
          <p>Best regards,<br>The Xpeak Team</p>
        </div>
      `;
      
      console.log('🌍 TIMEZONE UPDATE EMAIL TO SEND:');
      console.log('To:', tutorEmail);
      console.log('Subject:', subject);
      console.log('Content:', html);
      
      // TODO: Integrate with actual email service
      return true;
      
    } catch (error) {
      console.error('Error sending timezone update reminder:', error);
      return false;
    }
  }

  /**
   * Log tutor notification in database for audit trail
   */
  static async logNotification(tutorId: string, notificationType: string, success: boolean, details?: any): Promise<void> {
    try {
      await serverSupabase
        .from('tutor_notifications')
        .insert({
          tutor_id: tutorId,
          notification_type: notificationType,
          success,
          details,
          sent_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging tutor notification:', error);
    }
  }
}

// Enhanced tutor approval trigger function
export async function handleTutorApproval(applicationId: string, tutorData: any): Promise<void> {
  try {
    // Send welcome email
    const emailSuccess = await TutorNotificationService.sendApprovalWelcomeEmail({
      tutorName: tutorData.display_name || tutorData.full_name,
      tutorEmail: tutorData.user_email,
      applicationId,
      dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/tutor`
    });

    // Log the notification
    await TutorNotificationService.logNotification(
      tutorData.user_id,
      'approval_welcome',
      emailSuccess,
      { applicationId, email: tutorData.user_email }
    );

    console.log(`✅ Tutor approval process completed for ${tutorData.user_email}`);
    
  } catch (error) {
    console.error('Error in tutor approval process:', error);
  }
} 