
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CategoryType = 'medicine' | 'lab_test' | 'scan' | 'home_care' | 'physiotherapy' | 'diabetes';

const CATEGORY_TABLES = {
  medicine: 'medicine_categories',
  lab_test: 'lab_test_categories',
  scan: 'scan_categories',
  home_care: 'home_care_categories',
  physiotherapy: 'physiotherapy_categories',
  diabetes: 'diabetes_categories'
};

export interface Category {
  id: string;
  name_en: string;
  name_te: string;
  description_en?: string;
  description_te?: string;
  image_url?: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  parent_category_id?: string;
}

export const useCategories = (type: CategoryType) => {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      const tableName = CATEGORY_TABLES[type];
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Categories fetch error:', error);
        throw error;
      }

      return data as Category[];
    },
    enabled: !!type
  });
};

export const useAllCategories = () => {
  return useQuery({
    queryKey: ['all-categories'],
    queryFn: async () => {
      const results = await Promise.all(
        Object.entries(CATEGORY_TABLES).map(async ([type, table]) => {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

          if (error) throw error;
          
          return {
            type: type as CategoryType,
            categories: data as Category[]
          };
        })
      );

      return results.reduce((acc, { type, categories }) => {
        acc[type] = categories;
        return acc;
      }, {} as Record<CategoryType, Category[]>);
    }
  });
};
