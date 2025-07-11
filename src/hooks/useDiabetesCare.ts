
import { useRealtimeData } from './useRealtimeData';

export interface DiabetesCarePlan {
  id: string;
  plan_name: string;
  features: string[];
  price: number;
  duration_days: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useDiabetesCare() {
  return useRealtimeData<DiabetesCarePlan>({
    table: 'diabetes_care_plans',
    queryKey: ['diabetes_care_plans'],
    orderBy: 'created_at',
    orderDirection: 'desc',
    enableRealtime: true,
    onInsert: (plan) => {
      console.log('New diabetes care plan added:', plan.plan_name);
    },
    onUpdate: (plan) => {
      console.log('Diabetes care plan updated:', plan.plan_name);
    },
    onDelete: (plan) => {
      console.log('Diabetes care plan deleted:', plan.id);
    }
  });
}
