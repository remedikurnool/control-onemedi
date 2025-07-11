
import { useRealtimeData } from './useRealtimeData';

export interface GlobalSettings {
  id: string;
  app_name: string;
  contact_email?: string;
  support_phone?: string;
  whatsapp_link?: string;
  site_open_close_toggle: boolean;
  maintenance_mode: boolean;
  chat_config?: any;
  seo_config?: any;
  created_at: string;
  updated_at: string;
}

export function useGlobalSettings() {
  return useRealtimeData<GlobalSettings>({
    table: 'global_settings',
    queryKey: ['global_settings'],
    orderBy: 'created_at',
    orderDirection: 'desc',
    enableRealtime: true,
    onInsert: (settings) => {
      console.log('Global settings added:', settings.app_name);
    },
    onUpdate: (settings) => {
      console.log('Global settings updated:', settings.app_name);
    },
    onDelete: (settings) => {
      console.log('Global settings deleted:', settings.id);
    }
  });
}
