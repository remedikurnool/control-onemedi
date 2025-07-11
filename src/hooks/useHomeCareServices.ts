
import { useRealtimeData } from './useRealtimeData';

export interface HomeCareService {
  id: string;
  service_name: string;
  description?: string;
  price: number;
  duration?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useHomeCareServices() {
  return useRealtimeData<HomeCareService>({
    table: 'home_care_services',
    queryKey: ['home_care_services'],
    orderBy: 'created_at',
    orderDirection: 'desc',
    enableRealtime: true,
    onInsert: (service) => {
      console.log('New home care service added:', service.service_name);
    },
    onUpdate: (service) => {
      console.log('Home care service updated:', service.service_name);
    },
    onDelete: (service) => {
      console.log('Home care service deleted:', service.id);
    }
  });
}
