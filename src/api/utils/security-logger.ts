// Security Logger Utility for OneMedi API
// Comprehensive security event logging and monitoring

import { supabase } from '@/integrations/supabase/client';

export type SecurityEventType = 
  | 'auth_login_success'
  | 'auth_login_failed'
  | 'auth_logout'
  | 'auth_token_expired'
  | 'auth_token_invalid'
  | 'auth_missing_token'
  | 'auth_user_not_found'
  | 'auth_user_inactive'
  | 'auth_insufficient_role'
  | 'auth_insufficient_permission'
  | 'rate_limit_exceeded'
  | 'api_key_invalid'
  | 'suspicious_activity'
  | 'data_access_violation'
  | 'file_upload_blocked'
  | 'sql_injection_attempt'
  | 'xss_attempt'
  | 'csrf_token_invalid'
  | 'webhook_signature_invalid'
  | 'payment_fraud_detected'
  | 'bulk_operation_abuse'
  | 'admin_action_performed'
  | 'sensitive_data_accessed'
  | 'system_error'
  | 'integration_failure';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  id?: string;
  event_type: SecurityEventType;
  severity: SecuritySeverity;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  endpoint?: string;
  method?: string;
  details: Record<string, any>;
  timestamp: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

export class SecurityLogger {
  private static instance: SecurityLogger;
  private eventQueue: SecurityEvent[] = [];
  private flushInterval: NodeJS.Timeout;
  private readonly BATCH_SIZE = 50;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds

  constructor() {
    // Batch process events every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, this.FLUSH_INTERVAL);
  }

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  /**
   * Log a security event
   */
  async logEvent(
    eventType: SecurityEventType,
    severity: SecuritySeverity,
    details: Record<string, any>,
    userId?: string,
    request?: {
      ip?: string;
      userAgent?: string;
      endpoint?: string;
      method?: string;
    }
  ): Promise<void> {
    const event: SecurityEvent = {
      event_type: eventType,
      severity,
      user_id: userId,
      ip_address: request?.ip,
      user_agent: request?.userAgent,
      endpoint: request?.endpoint,
      method: request?.method,
      details,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    // Add to queue for batch processing
    this.eventQueue.push(event);

    // If critical event or queue is full, flush immediately
    if (severity === 'critical' || this.eventQueue.length >= this.BATCH_SIZE) {
      await this.flushEvents();
    }

    // Also log to console for immediate visibility
    this.logToConsole(event);

    // Send alerts for high/critical events
    if (severity === 'high' || severity === 'critical') {
      await this.sendAlert(event);
    }
  }

  /**
   * Flush queued events to database
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { error } = await supabase
        .from('security_logs')
        .insert(eventsToFlush);

      if (error) {
        console.error('Failed to flush security events:', error);
        // Re-queue events on failure
        this.eventQueue.unshift(...eventsToFlush);
      }
    } catch (error) {
      console.error('Error flushing security events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...eventsToFlush);
    }
  }

  /**
   * Log event to console with formatting
   */
  private logToConsole(event: SecurityEvent): void {
    const timestamp = new Date(event.timestamp).toISOString();
    const severityIcon = this.getSeverityIcon(event.severity);
    
    console.log(
      `${severityIcon} [${timestamp}] ${event.event_type.toUpperCase()}`,
      {
        severity: event.severity,
        userId: event.user_id,
        ip: event.ip_address,
        endpoint: event.endpoint,
        details: event.details
      }
    );
  }

  /**
   * Get severity icon for console logging
   */
  private getSeverityIcon(severity: SecuritySeverity): string {
    switch (severity) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🟠';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  }

  /**
   * Send alert for high/critical events
   */
  private async sendAlert(event: SecurityEvent): Promise<void> {
    try {
      // In a real implementation, this would send notifications via:
      // - Email to security team
      // - Slack/Teams webhook
      // - SMS for critical events
      // - Push notifications to admin app
      
      console.warn(`🚨 SECURITY ALERT: ${event.event_type}`, {
        severity: event.severity,
        details: event.details,
        timestamp: event.timestamp
      });

      // Log the alert attempt
      await supabase
        .from('security_alerts')
        .insert({
          event_id: event.id,
          alert_type: 'security_event',
          severity: event.severity,
          message: `Security event: ${event.event_type}`,
          details: event.details,
          sent_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  /**
   * Get security events with filtering
   */
  async getEvents(filters: {
    eventType?: SecurityEventType;
    severity?: SecuritySeverity;
    userId?: string;
    startDate?: string;
    endDate?: string;
    resolved?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ events: SecurityEvent[]; total: number }> {
    try {
      let query = supabase
        .from('security_logs')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }
      if (filters.resolved !== undefined) {
        query = query.eq('resolved', filters.resolved);
      }

      // Apply pagination
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Order by timestamp descending
      query = query.order('timestamp', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        events: data || [],
        total: count || 0
      };

    } catch (error) {
      console.error('Error fetching security events:', error);
      return { events: [], total: 0 };
    }
  }

  /**
   * Get security statistics
   */
  async getStatistics(timeframe: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<{
    totalEvents: number;
    eventsBySeverity: Record<SecuritySeverity, number>;
    eventsByType: Record<string, number>;
    topUsers: Array<{ userId: string; eventCount: number }>;
    topIPs: Array<{ ip: string; eventCount: number }>;
  }> {
    try {
      const timeframeHours = {
        '1h': 1,
        '24h': 24,
        '7d': 24 * 7,
        '30d': 24 * 30
      };

      const startTime = new Date();
      startTime.setHours(startTime.getHours() - timeframeHours[timeframe]);

      const { data: events } = await supabase
        .from('security_logs')
        .select('event_type, severity, user_id, ip_address')
        .gte('timestamp', startTime.toISOString());

      if (!events) {
        return {
          totalEvents: 0,
          eventsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
          eventsByType: {},
          topUsers: [],
          topIPs: []
        };
      }

      // Calculate statistics
      const totalEvents = events.length;
      
      const eventsBySeverity = events.reduce((acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1;
        return acc;
      }, {} as Record<SecuritySeverity, number>);

      const eventsByType = events.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const userCounts = events.reduce((acc, event) => {
        if (event.user_id) {
          acc[event.user_id] = (acc[event.user_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const ipCounts = events.reduce((acc, event) => {
        if (event.ip_address) {
          acc[event.ip_address] = (acc[event.ip_address] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topUsers = Object.entries(userCounts)
        .map(([userId, eventCount]) => ({ userId, eventCount }))
        .sort((a, b) => b.eventCount - a.eventCount)
        .slice(0, 10);

      const topIPs = Object.entries(ipCounts)
        .map(([ip, eventCount]) => ({ ip, eventCount }))
        .sort((a, b) => b.eventCount - a.eventCount)
        .slice(0, 10);

      return {
        totalEvents,
        eventsBySeverity: {
          low: eventsBySeverity.low || 0,
          medium: eventsBySeverity.medium || 0,
          high: eventsBySeverity.high || 0,
          critical: eventsBySeverity.critical || 0
        },
        eventsByType,
        topUsers,
        topIPs
      };

    } catch (error) {
      console.error('Error getting security statistics:', error);
      return {
        totalEvents: 0,
        eventsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
        eventsByType: {},
        topUsers: [],
        topIPs: []
      };
    }
  }

  /**
   * Mark security event as resolved
   */
  async resolveEvent(eventId: string, resolvedBy: string): Promise<void> {
    try {
      await supabase
        .from('security_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy
        })
        .eq('id', eventId);
    } catch (error) {
      console.error('Error resolving security event:', error);
    }
  }

  /**
   * Clean up old security logs
   */
  async cleanup(retentionDays: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      await supabase
        .from('security_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());

    } catch (error) {
      console.error('Error cleaning up security logs:', error);
    }
  }

  /**
   * Destroy the logger and clean up resources
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    // Flush any remaining events
    this.flushEvents();
  }
}

// Singleton instance
const securityLogger = SecurityLogger.getInstance();

// Convenience function for logging security events
export const logSecurityEvent = (
  eventType: SecurityEventType,
  severity: SecuritySeverity,
  details: Record<string, any>,
  userId?: string,
  request?: {
    ip?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
  }
): Promise<void> => {
  return securityLogger.logEvent(eventType, severity, details, userId, request);
};

export { securityLogger };
export default SecurityLogger;
