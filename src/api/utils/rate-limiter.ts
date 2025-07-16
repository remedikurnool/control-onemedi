// Rate Limiter Utility for OneMedi API
// Implements sliding window rate limiting with Redis-like functionality

import { supabase } from '@/integrations/supabase/client';

interface RateLimitRecord {
  identifier: string;
  requests: number;
  window_start: string;
  expires_at: string;
}

export class RateLimiter {
  private memoryStore: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired records every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if request is within rate limit
   * @param identifier - User ID or IP address
   * @param maxRequests - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Promise<boolean> - true if allowed, false if rate limited
   */
  async checkLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): Promise<boolean> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);
    const expiresAt = new Date(now.getTime() + windowMs);

    try {
      // Try to get from database first
      const { data: existingRecord } = await supabase
        .from('api_rate_limits')
        .select('*')
        .eq('identifier', identifier)
        .gte('expires_at', now.toISOString())
        .single();

      if (existingRecord) {
        const recordWindowStart = new Date(existingRecord.window_start);
        
        // If the record is within the current window
        if (recordWindowStart >= windowStart) {
          if (existingRecord.requests >= maxRequests) {
            return false; // Rate limited
          }
          
          // Increment request count
          await supabase
            .from('api_rate_limits')
            .update({
              requests: existingRecord.requests + 1,
              expires_at: expiresAt.toISOString()
            })
            .eq('identifier', identifier);
          
          return true;
        }
      }

      // Create new record or reset existing one
      await supabase
        .from('api_rate_limits')
        .upsert({
          identifier,
          requests: 1,
          window_start: windowStart.toISOString(),
          expires_at: expiresAt.toISOString()
        });

      return true;

    } catch (error) {
      console.error('Rate limiter database error, falling back to memory:', error);
      return this.checkLimitMemory(identifier, maxRequests, windowMs);
    }
  }

  /**
   * Memory-based rate limiting fallback
   */
  private checkLimitMemory(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): boolean {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);
    const expiresAt = new Date(now.getTime() + windowMs);

    const existing = this.memoryStore.get(identifier);

    if (existing) {
      const recordWindowStart = new Date(existing.window_start);
      
      // If the record is within the current window
      if (recordWindowStart >= windowStart) {
        if (existing.requests >= maxRequests) {
          return false; // Rate limited
        }
        
        // Increment request count
        existing.requests++;
        existing.expires_at = expiresAt.toISOString();
        return true;
      }
    }

    // Create new record
    this.memoryStore.set(identifier, {
      identifier,
      requests: 1,
      window_start: windowStart.toISOString(),
      expires_at: expiresAt.toISOString()
    });

    return true;
  }

  /**
   * Get current rate limit status for an identifier
   */
  async getRateLimitStatus(identifier: string): Promise<{
    requests: number;
    limit: number;
    remaining: number;
    resetTime: Date;
  } | null> {
    try {
      const { data } = await supabase
        .from('api_rate_limits')
        .select('*')
        .eq('identifier', identifier)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (!data) return null;

      const limit = 1000; // Default limit, should be configurable
      return {
        requests: data.requests,
        limit,
        remaining: Math.max(0, limit - data.requests),
        resetTime: new Date(data.expires_at)
      };

    } catch (error) {
      return null;
    }
  }

  /**
   * Reset rate limit for an identifier
   */
  async resetRateLimit(identifier: string): Promise<void> {
    try {
      await supabase
        .from('api_rate_limits')
        .delete()
        .eq('identifier', identifier);

      this.memoryStore.delete(identifier);
    } catch (error) {
      console.error('Error resetting rate limit:', error);
    }
  }

  /**
   * Clean up expired records
   */
  private async cleanup(): Promise<void> {
    const now = new Date();

    try {
      // Clean up database records
      await supabase
        .from('api_rate_limits')
        .delete()
        .lt('expires_at', now.toISOString());

      // Clean up memory store
      for (const [key, record] of this.memoryStore.entries()) {
        if (new Date(record.expires_at) < now) {
          this.memoryStore.delete(key);
        }
      }
    } catch (error) {
      console.error('Error during rate limiter cleanup:', error);
    }
  }

  /**
   * Get rate limiting statistics
   */
  async getStatistics(): Promise<{
    totalIdentifiers: number;
    activeWindows: number;
    topConsumers: Array<{ identifier: string; requests: number }>;
  }> {
    try {
      const { data: records } = await supabase
        .from('api_rate_limits')
        .select('identifier, requests')
        .gte('expires_at', new Date().toISOString())
        .order('requests', { ascending: false })
        .limit(10);

      const totalIdentifiers = records?.length || 0;
      const activeWindows = totalIdentifiers;
      const topConsumers = records?.map(r => ({
        identifier: r.identifier,
        requests: r.requests
      })) || [];

      return {
        totalIdentifiers,
        activeWindows,
        topConsumers
      };
    } catch (error) {
      console.error('Error getting rate limiter statistics:', error);
      return {
        totalIdentifiers: 0,
        activeWindows: 0,
        topConsumers: []
      };
    }
  }

  /**
   * Destroy the rate limiter and clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.memoryStore.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Rate limiting configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints - stricter limits
  AUTH: {
    LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    REGISTER: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
    FORGOT_PASSWORD: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  },
  
  // API endpoints - moderate limits
  API: {
    READ: { maxRequests: 1000, windowMs: 15 * 60 * 1000 }, // 1000 requests per 15 minutes
    WRITE: { maxRequests: 200, windowMs: 15 * 60 * 1000 }, // 200 requests per 15 minutes
    UPLOAD: { maxRequests: 50, windowMs: 15 * 60 * 1000 }, // 50 uploads per 15 minutes
  },
  
  // Webhook endpoints - higher limits for automated systems
  WEBHOOK: {
    PAYMENT: { maxRequests: 500, windowMs: 15 * 60 * 1000 }, // 500 requests per 15 minutes
    EVITALRX: { maxRequests: 1000, windowMs: 15 * 60 * 1000 }, // 1000 requests per 15 minutes
  },
  
  // Search endpoints - moderate limits
  SEARCH: {
    GENERAL: { maxRequests: 100, windowMs: 15 * 60 * 1000 }, // 100 searches per 15 minutes
    AUTOCOMPLETE: { maxRequests: 500, windowMs: 15 * 60 * 1000 }, // 500 requests per 15 minutes
  },
  
  // Export/Report endpoints - lower limits due to resource intensity
  EXPORT: {
    REPORT: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 exports per hour
    BULK_EXPORT: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 bulk exports per hour
  }
};

export default RateLimiter;
