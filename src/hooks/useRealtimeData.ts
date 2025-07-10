import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseService, QueryOptions } from '@/lib/supabase-service';
import { toast } from 'sonner';

// Types
interface RealtimeConfig {
  table: string;
  queryKey: string[];
  select?: string;
  filters?: Record<string, any>;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  enableRealtime?: boolean;
  onInsert?: (record: any) => void;
  onUpdate?: (record: any) => void;
  onDelete?: (record: any) => void;
}

interface UseRealtimeDataResult<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  count: number;
  refetch: () => void;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// Custom hook for real-time data management
export function useRealtimeData<T = any>(config: RealtimeConfig): UseRealtimeDataResult<T> {
  const queryClient = useQueryClient();
  const [count, setCount] = useState(0);
  const serviceRef = useRef(new SupabaseService(config.table));
  const subscriptionRef = useRef<any>(null);

  // Query for fetching data
  const { 
    data: queryResult, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: config.queryKey,
    queryFn: async () => {
      const options: QueryOptions = {
        filters: config.filters,
        orderBy: config.orderBy,
        orderDirection: config.orderDirection
      };

      const result = await serviceRef.current.getAll<T>(options, config.select);
      setCount(result.count);
      return result.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<T>) => {
      return await serviceRef.current.create<T>(data);
    },
    onSuccess: (newRecord) => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
      toast.success('Record created successfully');
      config.onInsert?.(newRecord);
    },
    onError: (error) => {
      toast.error('Failed to create record');
      console.error('Create error:', error);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      return await serviceRef.current.update<T>(id, data);
    },
    onSuccess: (updatedRecord) => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
      toast.success('Record updated successfully');
      config.onUpdate?.(updatedRecord);
    },
    onError: (error) => {
      toast.error('Failed to update record');
      console.error('Update error:', error);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await serviceRef.current.delete(id);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
      toast.success('Record deleted successfully');
      config.onDelete?.({ id: deletedId });
    },
    onError: (error) => {
      toast.error('Failed to delete record');
      console.error('Delete error:', error);
    }
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!config.enableRealtime) return;

    const channel = supabase
      .channel(`${config.table}_realtime`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: config.table
        },
        (payload) => {
          console.log('Real-time update:', payload);

          switch (payload.eventType) {
            case 'INSERT':
              queryClient.invalidateQueries({ queryKey: config.queryKey });
              config.onInsert?.(payload.new);
              toast.success('New record added');
              break;

            case 'UPDATE':
              queryClient.invalidateQueries({ queryKey: config.queryKey });
              config.onUpdate?.(payload.new);
              break;

            case 'DELETE':
              queryClient.invalidateQueries({ queryKey: config.queryKey });
              config.onDelete?.(payload.old);
              toast.info('Record deleted');
              break;
          }
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [config.table, config.enableRealtime, queryClient]);

  // Wrapper functions for mutations
  const create = useCallback(async (data: Partial<T>): Promise<T> => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  const update = useCallback(async (id: string, data: Partial<T>): Promise<T> => {
    return updateMutation.mutateAsync({ id, data });
  }, [updateMutation]);

  const remove = useCallback(async (id: string): Promise<void> => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    data: queryResult || [],
    isLoading,
    error: error as Error | null,
    count,
    refetch,
    create,
    update,
    remove,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}

// Specialized hooks for common entities
export function usePatients(filters?: Record<string, any>) {
  return useRealtimeData({
    table: 'users',
    queryKey: ['patients', filters],
    filters: { role: 'patient', ...filters },
    orderBy: 'created_at',
    orderDirection: 'desc',
    enableRealtime: true,
    onInsert: (patient) => {
      toast.success(`New patient registered: ${patient.first_name} ${patient.last_name}`);
    }
  });
}

export function useAppointments(filters?: Record<string, any>) {
  return useRealtimeData({
    table: 'appointments',
    queryKey: ['appointments', filters],
    select: `
      *,
      patient:users!patient_id(first_name, last_name, phone, email),
      doctor:doctors!doctor_id(user:users(first_name, last_name), specializations)
    `,
    filters,
    orderBy: 'appointment_date',
    orderDirection: 'asc',
    enableRealtime: true,
    onInsert: (appointment) => {
      toast.success('New appointment scheduled');
    },
    onUpdate: (appointment) => {
      if (appointment.status === 'confirmed') {
        toast.success('Appointment confirmed');
      } else if (appointment.status === 'cancelled') {
        toast.info('Appointment cancelled');
      }
    }
  });
}

export function useInventory(filters?: Record<string, any>) {
  return useRealtimeData({
    table: 'inventory',
    queryKey: ['inventory', filters],
    select: `
      *,
      product:products(name, generic_name, brand_name, manufacturer)
    `,
    filters,
    orderBy: 'updated_at',
    orderDirection: 'desc',
    enableRealtime: true,
    onUpdate: (inventory) => {
      if (inventory.available_stock <= inventory.reorder_level) {
        toast.warning(`Low stock alert: ${inventory.product?.name}`);
      }
    }
  });
}

export function useEmergencyCalls(filters?: Record<string, any>) {
  return useRealtimeData({
    table: 'emergency_calls',
    queryKey: ['emergency_calls', filters],
    select: `
      *,
      ambulance:ambulances(vehicle_number, vehicle_type),
      responder:users(first_name, last_name)
    `,
    filters,
    orderBy: 'created_at',
    orderDirection: 'desc',
    enableRealtime: true,
    onInsert: (call) => {
      toast.error(`🚨 Emergency Call: ${call.emergency_type} - ${call.severity}`, {
        duration: 10000,
        action: {
          label: 'View',
          onClick: () => {
            // Navigate to emergency call details
            window.location.href = `/admin/emergency/${call.id}`;
          }
        }
      });
    },
    onUpdate: (call) => {
      if (call.status === 'dispatched') {
        toast.info(`Ambulance dispatched for emergency call ${call.call_number}`);
      } else if (call.status === 'resolved') {
        toast.success(`Emergency call ${call.call_number} resolved`);
      }
    }
  });
}

export function useInvoices(filters?: Record<string, any>) {
  return useRealtimeData({
    table: 'invoices',
    queryKey: ['invoices', filters],
    select: `
      *,
      patient:users!patient_id(first_name, last_name, phone, email)
    `,
    filters,
    orderBy: 'invoice_date',
    orderDirection: 'desc',
    enableRealtime: true,
    onInsert: (invoice) => {
      toast.success(`New invoice generated: ${invoice.invoice_number}`);
    },
    onUpdate: (invoice) => {
      if (invoice.status === 'paid') {
        toast.success(`Payment received for invoice ${invoice.invoice_number}`);
      } else if (invoice.status === 'overdue') {
        toast.warning(`Invoice ${invoice.invoice_number} is overdue`);
      }
    }
  });
}

export function useLabBookings(filters?: Record<string, any>) {
  return useRealtimeData({
    table: 'lab_bookings',
    queryKey: ['lab_bookings', filters],
    select: `
      *,
      patient:users!patient_id(first_name, last_name, phone),
      doctor:doctors!doctor_id(user:users(first_name, last_name))
    `,
    filters,
    orderBy: 'booking_date',
    orderDirection: 'desc',
    enableRealtime: true,
    onInsert: (booking) => {
      toast.success(`New lab test booked: ${booking.booking_number}`);
    },
    onUpdate: (booking) => {
      if (booking.status === 'completed') {
        toast.success(`Lab test completed: ${booking.booking_number}`);
      }
    }
  });
}

export function useStaff(filters?: Record<string, any>) {
  return useRealtimeData({
    table: 'staff',
    queryKey: ['staff', filters],
    select: `
      *,
      user:users(first_name, last_name, email, phone, profile_image_url),
      department:departments(name)
    `,
    filters,
    orderBy: 'hire_date',
    orderDirection: 'desc',
    enableRealtime: true
  });
}

export function useAnalytics(filters?: Record<string, any>) {
  return useRealtimeData({
    table: 'business_metrics',
    queryKey: ['analytics', filters],
    filters,
    orderBy: 'metric_date',
    orderDirection: 'desc',
    enableRealtime: true
  });
}

// Hook for real-time dashboard stats
export function useDashboardStats() {
  const { data: patients } = usePatients();
  const { data: appointments } = useAppointments({ 
    appointment_date: new Date().toISOString().split('T')[0] 
  });
  const { data: emergencyCalls } = useEmergencyCalls({ 
    status: 'new' 
  });
  const { data: inventory } = useInventory();

  const stats = {
    totalPatients: patients.length,
    todayAppointments: appointments.length,
    activeEmergencies: emergencyCalls.length,
    lowStockItems: inventory.filter(item => 
      item.available_stock <= item.reorder_level
    ).length
  };

  return stats;
}
