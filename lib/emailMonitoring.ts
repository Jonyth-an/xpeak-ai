import { supabase } from './supabaseClient';

export interface EmailEvent {
  id: string;
  email: string;
  type: 'signup' | 'magic_link' | 'reset_password' | 'resend';
  status: 'sent' | 'delivered' | 'bounced' | 'failed' | 'opened' | 'clicked';
  timestamp: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

export interface EmailStats {
  total_sent: number;
  delivered: number;
  bounced: number;
  failed: number;
  opened: number;
  clicked: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  period: '24h' | '7d' | '30d' | 'all';
}

class EmailMonitoring {
  private static instance: EmailMonitoring;

  private constructor() {}

  static getInstance(): EmailMonitoring {
    if (!EmailMonitoring.instance) {
      EmailMonitoring.instance = new EmailMonitoring();
    }
    return EmailMonitoring.instance;
  }

  /**
   * Track email event
   */
  async trackEmailEvent(event: Omit<EmailEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('email_events')
        .insert({
          email: event.email,
          type: event.type,
          status: event.status,
          user_id: event.user_id,
          metadata: event.metadata,
          timestamp: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to track email event:', error);
      }
    } catch (error) {
      console.error('Error tracking email event:', error);
    }
  }

  /**
   * Get email statistics for a given period
   */
  async getEmailStats(period: '24h' | '7d' | '30d' | 'all' = '7d'): Promise<EmailStats> {
    try {
      let timeFilter = '';
      const now = new Date();

      switch (period) {
        case '24h':
          timeFilter = `timestamp >= '${new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()}'`;
          break;
        case '7d':
          timeFilter = `timestamp >= '${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()}'`;
          break;
        case '30d':
          timeFilter = `timestamp >= '${new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()}'`;
          break;
        case 'all':
          timeFilter = '';
          break;
      }

      const { data, error } = await supabase
        .from('email_events')
        .select('status')
        .filter(timeFilter ? timeFilter : 'id', 'neq', '');

      if (error) {
        console.error('Failed to get email stats:', error);
        return this.getDefaultStats(period);
      }

      const stats = this.calculateStats(data || []);
      return { ...stats, period };
    } catch (error) {
      console.error('Error getting email stats:', error);
      return this.getDefaultStats(period);
    }
  }

  /**
   * Get email events for a specific user
   */
  async getUserEmailEvents(userId: string, limit: number = 10): Promise<EmailEvent[]> {
    try {
      const { data, error } = await supabase
        .from('email_events')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to get user email events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user email events:', error);
      return [];
    }
  }

  /**
   * Get recent email events for monitoring
   */
  async getRecentEmailEvents(limit: number = 50): Promise<EmailEvent[]> {
    try {
      const { data, error } = await supabase
        .from('email_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to get recent email events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting recent email events:', error);
      return [];
    }
  }

  /**
   * Track email sent event
   */
  async trackEmailSent(email: string, type: EmailEvent['type'], userId?: string): Promise<void> {
    await this.trackEmailEvent({
      email,
      type,
      status: 'sent',
      user_id: userId,
    });
  }

  /**
   * Track email delivered event
   */
  async trackEmailDelivered(email: string, type: EmailEvent['type'], userId?: string): Promise<void> {
    await this.trackEmailEvent({
      email,
      type,
      status: 'delivered',
      user_id: userId,
    });
  }

  /**
   * Track email bounced event
   */
  async trackEmailBounced(email: string, type: EmailEvent['type'], userId?: string, reason?: string): Promise<void> {
    await this.trackEmailEvent({
      email,
      type,
      status: 'bounced',
      user_id: userId,
      metadata: { reason },
    });
  }

  /**
   * Track email opened event
   */
  async trackEmailOpened(email: string, type: EmailEvent['type'], userId?: string): Promise<void> {
    await this.trackEmailEvent({
      email,
      type,
      status: 'opened',
      user_id: userId,
    });
  }

  /**
   * Track email clicked event
   */
  async trackEmailClicked(email: string, type: EmailEvent['type'], userId?: string, link?: string): Promise<void> {
    await this.trackEmailEvent({
      email,
      type,
      status: 'clicked',
      user_id: userId,
      metadata: { link },
    });
  }

  /**
   * Calculate statistics from email events
   */
  private calculateStats(events: any[]): Omit<EmailStats, 'period'> {
    const total_sent = events.filter(e => e.status === 'sent').length;
    const delivered = events.filter(e => e.status === 'delivered').length;
    const bounced = events.filter(e => e.status === 'bounced').length;
    const failed = events.filter(e => e.status === 'failed').length;
    const opened = events.filter(e => e.status === 'opened').length;
    const clicked = events.filter(e => e.status === 'clicked').length;

    return {
      total_sent,
      delivered,
      bounced,
      failed,
      opened,
      clicked,
      delivery_rate: total_sent > 0 ? (delivered / total_sent) * 100 : 0,
      open_rate: delivered > 0 ? (opened / delivered) * 100 : 0,
      click_rate: opened > 0 ? (clicked / opened) * 100 : 0,
    };
  }

  /**
   * Get default stats when data is unavailable
   */
  private getDefaultStats(period: '24h' | '7d' | '30d' | 'all'): EmailStats {
    return {
      total_sent: 0,
      delivered: 0,
      bounced: 0,
      failed: 0,
      opened: 0,
      clicked: 0,
      delivery_rate: 0,
      open_rate: 0,
      click_rate: 0,
      period,
    };
  }

  /**
   * Check if email delivery rate is healthy
   */
  isDeliveryRateHealthy(stats: EmailStats): boolean {
    return stats.delivery_rate >= 95; // 95% delivery rate threshold
  }

  /**
   * Get email health status
   */
  getEmailHealthStatus(stats: EmailStats): 'healthy' | 'warning' | 'critical' {
    if (stats.delivery_rate >= 95) return 'healthy';
    if (stats.delivery_rate >= 85) return 'warning';
    return 'critical';
  }
}

export const emailMonitoring = EmailMonitoring.getInstance();

// Webhook handler for email events (to be called by Supabase webhooks)
export async function handleEmailWebhook(payload: any): Promise<void> {
  const { email, type, event, user_id } = payload;

  switch (event) {
    case 'email.sent':
      await emailMonitoring.trackEmailSent(email, type, user_id);
      break;
    case 'email.delivered':
      await emailMonitoring.trackEmailDelivered(email, type, user_id);
      break;
    case 'email.bounced':
      await emailMonitoring.trackEmailBounced(email, type, user_id, payload.reason);
      break;
    case 'email.opened':
      await emailMonitoring.trackEmailOpened(email, type, user_id);
      break;
    case 'email.clicked':
      await emailMonitoring.trackEmailClicked(email, type, user_id, payload.link);
      break;
  }
} 