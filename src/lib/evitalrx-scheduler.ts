// eVitalRx Scheduled Sync Service for OneMedi Healthcare Platform
// Handles automatic synchronization based on configured intervals

import { supabase } from '@/integrations/supabase/client';
import { createSyncService } from './evitalrx-integration';

export interface SchedulerConfig {
  isEnabled: boolean;
  syncInterval: number; // in minutes
  syncTypes: ('products' | 'stock' | 'orders')[];
  maxRetries: number;
  retryDelay: number; // in minutes
}

export interface ScheduledJob {
  id: string;
  job_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  retry_count: number;
  max_retries: number;
  error_message?: string;
  config: any;
  created_at: string;
}

export class eVitalRxScheduler {
  private config: SchedulerConfig;
  private supabase: any;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(supabaseClient: any, config?: Partial<SchedulerConfig>) {
    this.supabase = supabaseClient;
    this.config = {
      isEnabled: false,
      syncInterval: 60, // 1 hour default
      syncTypes: ['products', 'stock'],
      maxRetries: 3,
      retryDelay: 15, // 15 minutes
      ...config
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('eVitalRx Scheduler is already running');
      return;
    }

    console.log('Starting eVitalRx Scheduler...');
    this.isRunning = true;

    // Load configuration from database
    await this.loadConfig();

    if (!this.config.isEnabled) {
      console.log('eVitalRx Scheduler is disabled');
      return;
    }

    // Start the scheduler
    this.intervalId = setInterval(
      () => this.runScheduledSync(),
      this.config.syncInterval * 60 * 1000 // Convert minutes to milliseconds
    );

    // Run initial sync if needed
    await this.checkAndRunInitialSync();

    console.log(`eVitalRx Scheduler started with ${this.config.syncInterval} minute interval`);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('eVitalRx Scheduler is not running');
      return;
    }

    console.log('Stopping eVitalRx Scheduler...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('eVitalRx Scheduler stopped');
  }

  async updateConfig(newConfig: Partial<SchedulerConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };

    // Save to database
    await this.supabase
      .from('evitalrx_settings')
      .update({
        auto_sync_enabled: this.config.isEnabled,
        sync_interval: this.config.syncInterval,
        updated_at: new Date().toISOString()
      })
      .eq('environment', 'staging'); // or get from current config

    // Restart scheduler with new config
    if (this.isRunning) {
      await this.stop();
      await this.start();
    }
  }

  private async loadConfig(): Promise<void> {
    try {
      const { data: settings } = await this.supabase
        .from('evitalrx_settings')
        .select('auto_sync_enabled, sync_interval, is_active')
        .single();

      if (settings) {
        this.config.isEnabled = settings.auto_sync_enabled && settings.is_active;
        this.config.syncInterval = settings.sync_interval || 60;
      }
    } catch (error) {
      console.error('Failed to load scheduler config:', error);
    }
  }

  private async checkAndRunInitialSync(): Promise<void> {
    try {
      // Check if we need to run an initial sync
      const { data: lastSync } = await this.supabase
        .from('evitalrx_sync_logs')
        .select('completed_at')
        .eq('status', 'success')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      const now = new Date();
      const lastSyncTime = lastSync ? new Date(lastSync.completed_at) : null;
      const timeSinceLastSync = lastSyncTime 
        ? (now.getTime() - lastSyncTime.getTime()) / (1000 * 60) // minutes
        : Infinity;

      // Run initial sync if last sync was more than 2x the interval ago
      if (timeSinceLastSync > this.config.syncInterval * 2) {
        console.log('Running initial sync due to stale data');
        await this.runScheduledSync();
      }
    } catch (error) {
      console.error('Failed to check initial sync:', error);
    }
  }

  private async runScheduledSync(): Promise<void> {
    if (!this.config.isEnabled) {
      return;
    }

    console.log('Running scheduled eVitalRx sync...');

    try {
      const syncService = createSyncService(this.supabase);

      // Run each configured sync type
      for (const syncType of this.config.syncTypes) {
        await this.scheduleJob(syncType, {
          syncType,
          fullSync: false,
          scheduledSync: true
        });
      }
    } catch (error) {
      console.error('Scheduled sync failed:', error);
    }
  }

  async scheduleJob(
    jobType: string,
    config: any,
    scheduledAt?: Date
  ): Promise<string> {
    const job: Partial<ScheduledJob> = {
      job_type: jobType,
      status: 'pending',
      scheduled_at: (scheduledAt || new Date()).toISOString(),
      retry_count: 0,
      max_retries: this.config.maxRetries,
      config,
      created_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('evitalrx_scheduled_jobs')
      .insert([job])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to schedule job: ${error.message}`);
    }

    // Execute job immediately if scheduled for now or past
    const scheduledTime = new Date(job.scheduled_at!);
    if (scheduledTime <= new Date()) {
      this.executeJob(data.id);
    }

    return data.id;
  }

  private async executeJob(jobId: string): Promise<void> {
    try {
      // Get job details
      const { data: job, error } = await this.supabase
        .from('evitalrx_scheduled_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error || !job) {
        throw new Error(`Job ${jobId} not found`);
      }

      if (job.status !== 'pending') {
        console.log(`Job ${jobId} is not pending, skipping`);
        return;
      }

      // Mark job as running
      await this.supabase
        .from('evitalrx_scheduled_jobs')
        .update({
          status: 'running',
          started_at: new Date().toISOString()
        })
        .eq('id', jobId);

      // Execute the job
      const syncService = createSyncService(this.supabase);
      let result;

      switch (job.job_type) {
        case 'products':
          result = await syncService.syncProducts(job.config);
          break;
        case 'stock':
          result = await syncService.syncStockLevels();
          break;
        default:
          throw new Error(`Unknown job type: ${job.job_type}`);
      }

      // Mark job as completed
      await this.supabase
        .from('evitalrx_scheduled_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId);

      console.log(`Job ${jobId} completed successfully`);

    } catch (error: any) {
      console.error(`Job ${jobId} failed:`, error);

      // Get current job to check retry count
      const { data: currentJob } = await this.supabase
        .from('evitalrx_scheduled_jobs')
        .select('retry_count, max_retries')
        .eq('id', jobId)
        .single();

      if (currentJob && currentJob.retry_count < currentJob.max_retries) {
        // Schedule retry
        const retryDelay = this.config.retryDelay * (currentJob.retry_count + 1); // Exponential backoff
        const retryTime = new Date(Date.now() + retryDelay * 60 * 1000);

        await this.supabase
          .from('evitalrx_scheduled_jobs')
          .update({
            status: 'pending',
            scheduled_at: retryTime.toISOString(),
            retry_count: currentJob.retry_count + 1,
            error_message: error.message
          })
          .eq('id', jobId);

        console.log(`Job ${jobId} scheduled for retry in ${retryDelay} minutes`);
      } else {
        // Mark as failed
        await this.supabase
          .from('evitalrx_scheduled_jobs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error.message
          })
          .eq('id', jobId);

        console.log(`Job ${jobId} failed permanently after ${currentJob?.retry_count || 0} retries`);
      }
    }
  }

  async getJobStatus(jobId: string): Promise<ScheduledJob | null> {
    const { data, error } = await this.supabase
      .from('evitalrx_scheduled_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Failed to get job status:', error);
      return null;
    }

    return data as ScheduledJob;
  }

  async getJobHistory(limit: number = 50): Promise<ScheduledJob[]> {
    const { data, error } = await this.supabase
      .from('evitalrx_scheduled_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get job history:', error);
      return [];
    }

    return data as ScheduledJob[];
  }

  async cancelJob(jobId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('evitalrx_scheduled_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: 'Cancelled by user'
        })
        .eq('id', jobId)
        .eq('status', 'pending'); // Only cancel pending jobs

      return !error;
    } catch (error) {
      console.error('Failed to cancel job:', error);
      return false;
    }
  }

  async cleanupOldJobs(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await this.supabase
        .from('evitalrx_scheduled_jobs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

      if (error) {
        throw error;
      }

      const deletedCount = data?.length || 0;
      console.log(`Cleaned up ${deletedCount} old jobs`);
      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup old jobs:', error);
      return 0;
    }
  }

  getStatus(): {
    isRunning: boolean;
    config: SchedulerConfig;
    nextSync?: Date;
  } {
    const nextSync = this.intervalId 
      ? new Date(Date.now() + this.config.syncInterval * 60 * 1000)
      : undefined;

    return {
      isRunning: this.isRunning,
      config: this.config,
      nextSync
    };
  }
}

// Create scheduler instance
export const createScheduler = (supabaseClient: any, config?: Partial<SchedulerConfig>) =>
  new eVitalRxScheduler(supabaseClient, config);

// Global scheduler instance (to be initialized in app startup)
let globalScheduler: eVitalRxScheduler | null = null;

export const initializeScheduler = async (supabaseClient: any): Promise<eVitalRxScheduler> => {
  if (!globalScheduler) {
    globalScheduler = createScheduler(supabaseClient);
    await globalScheduler.start();
  }
  return globalScheduler;
};

export const getScheduler = (): eVitalRxScheduler | null => globalScheduler;
