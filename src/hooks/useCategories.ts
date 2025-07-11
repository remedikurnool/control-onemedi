
import { useQuery } from '@tanstack/react-query';

export type CategoryType = 'medicine' | 'lab_test' | 'scan' | 'home_care' | 'physiotherapy' | 'diabetes';

// Mock data since category tables don't exist in the current schema
const MOCK_CATEGORIES = {
  medicine: [
    { id: '1', name_en: 'Pain Relief', name_te: 'నొప్పి ఎపట్టిల్లేందాయ', description_en: 'Pain relief medications', description_te: 'నొప్పి ఎపట్టిల్లేందాయ', image_url: '', icon: 'pill', display_order: 1, is_active: true, parent_category_id: null },
    { id: '2', name_en: 'Antibiotics', name_te: 'యాంటీబయాటిక్స్', description_en: 'Antibiotic medications', description_te: 'యాంటీబయాటిక్ ఔషధాలు', image_url: '', icon: 'shield', display_order: 2, is_active: true, parent_category_id: null }
  ],
  lab_test: [
    { id: '1', name_en: 'Blood Tests', name_te: 'రక్త పరీక్షలు', description_en: 'Blood testing services', description_te: 'రక్త పరీక్ష సేవలు', image_url: '', icon: 'test-tube', display_order: 1, is_active: true, parent_category_id: null },
    { id: '2', name_en: 'Urine Tests', name_te: 'మూత్ర పరీక్షలు', description_en: 'Urine testing services', description_te: 'మూత్ર పరీక్ష సేవలు', image_url: '', icon: 'beaker', display_order: 2, is_active: true, parent_category_id: null }
  ],
  scan: [
    { id: '1', name_en: 'X-Ray', name_te: 'ఎక్స్-రే', description_en: 'X-Ray scanning services', description_te: 'ఎక్స్-రే స్కాన్ సేవలు', image_url: '', icon: 'scan', display_order: 1, is_active: true, parent_category_id: null },
    { id: '2', name_en: 'CT Scan', name_te: 'సిటి స్కాన్', description_en: 'CT scanning services', description_te: 'సిటి స్కాన్ సేవలు', image_url: '', icon: 'scan-line', display_order: 2, is_active: true, parent_category_id: null }
  ],
  home_care: [
    { id: '1', name_en: 'Nursing Care', name_te: 'నర్సింగ్ కేర్', description_en: 'Professional nursing care at home', description_te: 'ఇంట్లో వృత్తిపరమైన నర్సింగ్ కేర్', image_url: '', icon: 'heart', display_order: 1, is_active: true, parent_category_id: null },
    { id: '2', name_en: 'Physiotherapy', name_te: 'ఫిజియోథెరపీ', description_en: 'Home physiotherapy services', description_te: 'ఇంటి ఫిజియోథెరపీ సేవలు', image_url: '', icon: 'activity', display_order: 2, is_active: true, parent_category_id: null }
  ],
  physiotherapy: [
    { id: '1', name_en: 'Joint Pain', name_te: 'కీళ్ల నొప్పులు', description_en: 'Joint pain physiotherapy', description_te: 'కీళ్ల నొప్పుల ఫిజియోథెరపీ', image_url: '', icon: 'bone', display_order: 1, is_active: true, parent_category_id: null },
    { id: '2', name_en: 'Sports Injury', name_te: 'క్రీడా గాయాలు', description_en: 'Sports injury treatment', description_te: 'క్రీడా గాయాల చికిత్స', image_url: '', icon: 'dumbbell', display_order: 2, is_active: true, parent_category_id: null }
  ],
  diabetes: [
    { id: '1', name_en: 'Blood Sugar Test', name_te: 'రక్తంలో చక్కెర పరీక్ష', description_en: 'Blood sugar testing', description_te: 'రక్తంలో చక్కెర పరీక్ష', image_url: '', icon: 'droplet', display_order: 1, is_active: true, parent_category_id: null },
    { id: '2', name_en: 'HbA1c Test', name_te: 'HbA1c పరీక్ష', description_en: 'HbA1c testing service', description_te: 'HbA1c పరీక్ష సేవ', image_url: '', icon: 'chart-line', display_order: 2, is_active: true, parent_category_id: null }
  ]
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
      // Return mock data since category tables don't exist
      console.log(`Fetching categories for type: ${type}`);
      const categories = MOCK_CATEGORIES[type] || [];
      return categories as Category[];
    },
    enabled: !!type
  });
};

export const useAllCategories = () => {
  return useQuery({
    queryKey: ['all-categories'],
    queryFn: async () => {
      console.log('Fetching all categories');
      return MOCK_CATEGORIES as Record<CategoryType, Category[]>;
    }
  });
};
