
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  email: string;
  password: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'pharmacist' | 'doctor' | 'lab_technician' | 'user';
}

const adminUsers: AdminUser[] = [
  {
    email: 'remedikurnool@gmail.com',
    password: 'AdmiN456!',
    full_name: 'Remedi Kurnool Admin',
    role: 'super_admin'
  },
  {
    email: 'superadmin@onemedi.com',
    password: 'SecurePass123!',
    full_name: 'Super Admin',
    role: 'super_admin'
  },
  {
    email: 'admin@onemedi.com',
    password: 'SecurePass123!',
    full_name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'manager@onemedi.com',
    password: 'SecurePass123!',
    full_name: 'Manager User',
    role: 'manager'
  },
  {
    email: 'pharmacist@onemedi.com',
    password: 'SecurePass123!',
    full_name: 'Pharmacist User',
    role: 'pharmacist'
  },
  {
    email: 'frontdesk@onemedi.com',
    password: 'SecurePass123!',
    full_name: 'Front Desk User',
    role: 'user'
  },
  {
    email: 'customer@onemedi.com',
    password: 'SecurePass123!',
    full_name: 'Customer User',
    role: 'user'
  }
];

export const seedAdminUsers = async (): Promise<void> => {
  console.log('Starting user seeding process...');
  
  for (const user of adminUsers) {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', user.email)
        .single();
      
      if (existingUser) {
        console.log(`User ${user.email} already exists, skipping...`);
        continue;
      }
      
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.full_name,
            role: user.role
          },
          emailRedirectTo: `${window.location.origin}/admin`
        }
      });
      
      if (authError) {
        console.error(`Failed to create user ${user.email}:`, authError);
        continue;
      }
      
      if (authData.user) {
        console.log(`Successfully created user: ${user.email}`);
        
        // The user profile will be created automatically by the trigger
        // But we need to confirm the user since we're in development
        if (authData.user.email_confirmed_at === null) {
          console.log(`User ${user.email} needs email confirmation`);
        }
      }
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }
  
  console.log('User seeding process completed');
};
