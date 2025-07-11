import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

// Valid table names from the database schema
const VALID_TABLES = [
  'user_profiles', 'locations', 'products', 'customer_orders', 'consultations',
  'ambulance_bookings', 'ambulance_services', 'blood_banks', 'blood_inventory',
  'analytics_events', 'coupons', 'hospitals', 'doctors', 'caregivers'
];

// Generic CRUD Service
export class SupabaseService {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  private isValidTable(tableName: string): boolean {
    return VALID_TABLES.includes(tableName);
  }

  // Create
  async create<T>(data: Partial<T>): Promise<T> {
    try {
      if (!this.isValidTable(this.tableName)) {
        throw new Error(`Table ${this.tableName} does not exist in the database`);
      }

      const { data: result, error } = await supabase
        .from(this.tableName as any)
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result as T;
    } catch (error) {
      this.handleError('create', error);
      throw error;
    }
  }

  // Read (single)
  async getById<T>(id: string, select?: string): Promise<T | null> {
    try {
      if (!this.isValidTable(this.tableName)) {
        console.warn(`Table ${this.tableName} does not exist, returning null`);
        return null;
      }

      const query = supabase
        .from(this.tableName as any)
        .select(select || '*')
        .eq('id', id)
        .single();

      const { data, error } = await query;

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data as T;
    } catch (error) {
      this.handleError('getById', error);
      throw error;
    }
  }

  // Read (multiple)
  async getAll<T>(options: QueryOptions = {}, select?: string): Promise<{ data: T[]; count: number }> {
    try {
      if (!this.isValidTable(this.tableName)) {
        console.warn(`Table ${this.tableName} does not exist, returning empty array`);
        return { data: [], count: 0 };
      }

      let query = supabase
        .from(this.tableName as any)
        .select(select || '*', { count: 'exact' });

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'string' && value.includes('%')) {
              query = query.ilike(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.orderDirection === 'asc' 
        });
      }

      // Apply pagination
      if (options.page && options.limit) {
        const from = (options.page - 1) * options.limit;
        const to = from + options.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { 
        data: (data || []) as T[], 
        count: count || 0 
      };
    } catch (error) {
      this.handleError('getAll', error);
      return { data: [], count: 0 };
    }
  }

  // Update
  async update<T>(id: string, data: Partial<T>): Promise<T> {
    try {
      if (!this.isValidTable(this.tableName)) {
        throw new Error(`Table ${this.tableName} does not exist in the database`);
      }

      const { data: result, error } = await supabase
        .from(this.tableName as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as T;
    } catch (error) {
      this.handleError('update', error);
      throw error;
    }
  }

  // Delete
  async delete(id: string): Promise<void> {
    try {
      if (!this.isValidTable(this.tableName)) {
        throw new Error(`Table ${this.tableName} does not exist in the database`);
      }

      const { error } = await supabase
        .from(this.tableName as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      this.handleError('delete', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkCreate<T>(data: Partial<T>[]): Promise<T[]> {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select();

      if (error) throw error;
      return result as T[];
    } catch (error) {
      this.handleError('bulkCreate', error);
      throw error;
    }
  }

  async bulkUpdate<T>(updates: { id: string; data: Partial<T> }[]): Promise<T[]> {
    try {
      const promises = updates.map(({ id, data }) => this.update<T>(id, data));
      return await Promise.all(promises);
    } catch (error) {
      this.handleError('bulkUpdate', error);
      throw error;
    }
  }

  async bulkDelete(ids: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .in('id', ids);

      if (error) throw error;
    } catch (error) {
      this.handleError('bulkDelete', error);
      throw error;
    }
  }

  // Search
  async search<T>(
    searchTerm: string, 
    searchFields: string[], 
    options: QueryOptions = {}
  ): Promise<{ data: T[]; count: number }> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact' });

      // Build search query
      if (searchTerm && searchFields.length > 0) {
        const searchConditions = searchFields
          .map(field => `${field}.ilike.%${searchTerm}%`)
          .join(',');
        query = query.or(searchConditions);
      }

      // Apply additional filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            query = query.eq(key, value);
          }
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.orderDirection === 'asc' 
        });
      }

      // Apply pagination
      if (options.page && options.limit) {
        const from = (options.page - 1) * options.limit;
        const to = from + options.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { 
        data: (data || []) as T[], 
        count: count || 0 
      };
    } catch (error) {
      this.handleError('search', error);
      throw error;
    }
  }

  // Real-time subscriptions
  subscribeToChanges<T>(
    callback: (payload: { 
      eventType: 'INSERT' | 'UPDATE' | 'DELETE'; 
      new?: T; 
      old?: T; 
    }) => void,
    filter?: string
  ): RealtimeSubscription {
    let channel = supabase
      .channel(`${this.tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: filter
        },
        (payload) => {
          callback({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as T,
            old: payload.old as T
          });
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  }

  // Custom queries
  async executeQuery<T>(query: string, params?: any[]): Promise<T[]> {
    try {
      const { data, error } = await supabase.rpc('execute_query', {
        query_text: query,
        query_params: params || []
      });

      if (error) throw error;
      return data as T[];
    } catch (error) {
      this.handleError('executeQuery', error);
      throw error;
    }
  }

  // Analytics and aggregations
  async getCount(filters?: Record<string, any>): Promise<number> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            query = query.eq(key, value);
          }
        });
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    } catch (error) {
      this.handleError('getCount', error);
      throw error;
    }
  }

  async getStats(
    groupBy: string,
    aggregateField?: string,
    aggregateFunction: 'count' | 'sum' | 'avg' | 'min' | 'max' = 'count'
  ): Promise<Record<string, number>> {
    try {
      // This would require a custom RPC function in Supabase
      const { data, error } = await supabase.rpc('get_table_stats', {
        table_name: this.tableName,
        group_by_field: groupBy,
        aggregate_field: aggregateField,
        aggregate_function: aggregateFunction
      });

      if (error) throw error;
      return data || {};
    } catch (error) {
      this.handleError('getStats', error);
      throw error;
    }
  }

  // Error handling
  private handleError(operation: string, error: any): void {
    const errorMessage = error?.message || 'An unknown error occurred';
    const errorCode = error?.code || 'UNKNOWN';
    
    console.error(`SupabaseService [${this.tableName}] ${operation} error:`, {
      message: errorMessage,
      code: errorCode,
      details: error?.details,
      hint: error?.hint
    });

    // Show user-friendly error messages
    if (errorCode === 'PGRST301') {
      toast.error('Permission denied. Please check your access rights.');
    } else if (errorCode === '23505') {
      toast.error('This record already exists.');
    } else if (errorCode === '23503') {
      toast.error('Cannot delete this record as it is referenced by other data.');
    } else if (errorCode === '42P01') {
      toast.error('Database table not found. Please contact support.');
    } else {
      toast.error(`Operation failed: ${errorMessage}`);
    }
  }
}

// Storage Service
export class SupabaseStorageService {
  private bucketName: string;

  constructor(bucketName: string) {
    this.bucketName = bucketName;
  }

  async uploadFile(
    file: File, 
    path: string, 
    options?: { 
      cacheControl?: string; 
      upsert?: boolean;
      onProgress?: (progress: number) => void;
    }
  ): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(path, file, {
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert || false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('File delete error:', error);
      throw error;
    }
  }

  async listFiles(folder?: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(folder);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('File list error:', error);
      throw error;
    }
  }

  getPublicUrl(path: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return publicUrl;
  }
}

// Service instances for common tables
export const usersService = new SupabaseService('user_profiles');
export const locationsService = new SupabaseService('locations');
export const appointmentsService = new SupabaseService('consultations');
export const prescriptionsService = new SupabaseService('prescriptions');
export const productsService = new SupabaseService('products');
export const inventoryService = new SupabaseService('inventory');
export const labBookingsService = new SupabaseService('lab_bookings');
export const invoicesService = new SupabaseService('invoices');
export const paymentsService = new SupabaseService('payments');
export const emergencyCallsService = new SupabaseService('emergency_calls');
export const staffService = new SupabaseService('staff');
export const doctorsService = new SupabaseService('doctors');
export const marketingCampaignsService = new SupabaseService('marketing_campaigns');
export const analyticsService = new SupabaseService('business_metrics');

// Storage service instances
export const avatarsStorage = new SupabaseStorageService('avatars');
export const productsStorage = new SupabaseStorageService('products');
export const documentsStorage = new SupabaseStorageService('documents');
export const labReportsStorage = new SupabaseStorageService('lab-reports');
export const prescriptionsStorage = new SupabaseStorageService('prescriptions');
export const medicalScansStorage = new SupabaseStorageService('medical-scans');
