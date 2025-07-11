
import { useRealtimeData } from './useRealtimeData';

export interface LayoutConfig {
  id: string;
  homepage_sections_order: string[];
  section_visibility: Record<string, boolean>;
  featured_categories: string[];
  banner_urls: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useLayoutConfig() {
  return useRealtimeData<LayoutConfig>({
    table: 'layout_config',
    queryKey: ['layout_config'],
    orderBy: 'created_at',
    orderDirection: 'desc',
    enableRealtime: true,
    onInsert: (config) => {
      console.log('Layout config added:', config.id);
    },
    onUpdate: (config) => {
      console.log('Layout config updated:', config.id);
    },
    onDelete: (config) => {
      console.log('Layout config deleted:', config.id);
    }
  });
}
