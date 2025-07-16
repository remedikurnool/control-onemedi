// Utility to verify demo users are properly set up
import { supabase } from '@/integrations/supabase/client';

export interface DemoUser {
  email: string;
  password: string;
  role: string;
  full_name: string;
  expected_permissions: string[];
}

export const DEMO_USERS: DemoUser[] = [
  {
    email: 'superadmin@onemedi.com',
    password: 'SuperAdmin@123',
    role: 'super_admin',
    full_name: 'Dr. Rajesh Kumar (Super Admin)',
    expected_permissions: ['users.create', 'users.read', 'users.update', 'users.delete', 'system.configure']
  },
  {
    email: 'admin@onemedi.com',
    password: 'Admin@123',
    role: 'admin',
    full_name: 'Dr. Priya Sharma (Admin)',
    expected_permissions: ['users.create', 'users.read', 'users.update', 'inventory.manage']
  },
  {
    email: 'manager@onemedi.com',
    password: 'Manager@123',
    role: 'manager',
    full_name: 'Mr. Amit Patel (Manager)',
    expected_permissions: ['orders.read', 'orders.update', 'inventory.read']
  },
  {
    email: 'doctor@onemedi.com',
    password: 'Doctor@123',
    role: 'doctor',
    full_name: 'Dr. Sunita Reddy (Doctor)',
    expected_permissions: ['consultations.create', 'prescriptions.create', 'patients.read']
  },
  {
    email: 'pharmacist@onemedi.com',
    password: 'Pharma@123',
    role: 'pharmacist',
    full_name: 'Mr. Ravi Kumar (Pharmacist)',
    expected_permissions: ['medicines.read', 'medicines.update', 'inventory.read']
  },
  {
    email: 'labtech@onemedi.com',
    password: 'LabTech@123',
    role: 'lab_technician',
    full_name: 'Ms. Kavya Nair (Lab Technician)',
    expected_permissions: ['lab_tests.read', 'lab_tests.update', 'reports.create']
  },
  {
    email: 'frontdesk@onemedi.com',
    password: 'FrontDesk@123',
    role: 'front_desk',
    full_name: 'Ms. Meera Singh (Front Desk)',
    expected_permissions: ['appointments.create', 'patients.create', 'pos.create']
  },
  {
    email: 'nurse@onemedi.com',
    password: 'Nurse@123',
    role: 'nurse',
    full_name: 'Ms. Anjali Gupta (Nurse)',
    expected_permissions: ['patients.read', 'patients.update', 'consultations.read']
  },
  {
    email: 'customer@onemedi.com',
    password: 'Customer@123',
    role: 'customer',
    full_name: 'Mr. Vikram Joshi (Customer)',
    expected_permissions: ['profile.read', 'profile.update', 'orders.create']
  }
];

export interface VerificationResult {
  email: string;
  exists: boolean;
  canLogin: boolean;
  hasCorrectRole: boolean;
  isActive: boolean;
  error?: string;
}

export class DemoUserVerifier {
  async verifyAllUsers(): Promise<VerificationResult[]> {
    const results: VerificationResult[] = [];
    
    for (const user of DEMO_USERS) {
      const result = await this.verifyUser(user);
      results.push(result);
    }
    
    return results;
  }

  async verifyUser(user: DemoUser): Promise<VerificationResult> {
    const result: VerificationResult = {
      email: user.email,
      exists: false,
      canLogin: false,
      hasCorrectRole: false,
      isActive: false
    };

    try {
      // Check if user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', user.email)
        .single();

      if (profileError || !profile) {
        result.error = 'User profile not found';
        return result;
      }

      result.exists = true;
      result.isActive = profile.is_active;
      result.hasCorrectRole = profile.role === user.role;

      // Test login
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.password
        });

        if (authError) {
          result.error = `Login failed: ${authError.message}`;
        } else if (authData.user) {
          result.canLogin = true;
          // Sign out immediately after test
          await supabase.auth.signOut();
        }
      } catch (loginError: any) {
        result.error = `Login test failed: ${loginError.message}`;
      }

    } catch (error: any) {
      result.error = `Verification failed: ${error.message}`;
    }

    return result;
  }

  async createMissingUsers(): Promise<void> {
    console.log('Creating missing demo users...');
    
    // This would typically run the SQL script
    // For now, we'll just log the instruction
    console.log('Please run the SQL script: src/database/demo-users-setup.sql');
  }

  generateReport(results: VerificationResult[]): string {
    let report = '=== DEMO USERS VERIFICATION REPORT ===\n\n';
    
    const working = results.filter(r => r.canLogin && r.hasCorrectRole && r.isActive);
    const total = results.length;
    
    report += `Status: ${working.length}/${total} users working\n\n`;
    
    results.forEach(result => {
      const status = result.canLogin && result.hasCorrectRole && result.isActive ? '✅' : '❌';
      report += `${status} ${result.email}\n`;
      report += `   Exists: ${result.exists ? '✅' : '❌'}\n`;
      report += `   Can Login: ${result.canLogin ? '✅' : '❌'}\n`;
      report += `   Correct Role: ${result.hasCorrectRole ? '✅' : '❌'}\n`;
      report += `   Active: ${result.isActive ? '✅' : '❌'}\n`;
      if (result.error) {
        report += `   Error: ${result.error}\n`;
      }
      report += '\n';
    });
    
    if (working.length === total) {
      report += '🎉 ALL DEMO USERS ARE WORKING!\n';
    } else {
      report += '⚠️  Some demo users need attention.\n';
      report += 'Run: src/database/demo-users-setup.sql in Supabase SQL Editor\n';
    }
    
    return report;
  }
}

// Quick verification function
export async function quickVerifyDemoUsers(): Promise<void> {
  const verifier = new DemoUserVerifier();
  
  console.log('🔍 Verifying demo users...');
  
  const results = await verifier.verifyAllUsers();
  const report = verifier.generateReport(results);
  
  console.log(report);
  
  // Also check if we can access the login page
  try {
    const response = await fetch('/login');
    if (response.ok) {
      console.log('✅ Login page is accessible');
    } else {
      console.log('❌ Login page is not accessible');
    }
  } catch (error) {
    console.log('❌ Cannot access login page:', error);
  }
}

// Test a specific user login
export async function testUserLogin(email: string, password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login failed:', error.message);
      return false;
    }

    if (data.user) {
      console.log('✅ Login successful for:', email);
      
      // Check user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        console.log('✅ User profile found:', profile.full_name, '- Role:', profile.role);
      }

      // Sign out
      await supabase.auth.signOut();
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('Login test failed:', error.message);
    return false;
  }
}

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).verifyDemoUsers = quickVerifyDemoUsers;
  (window as any).testUserLogin = testUserLogin;
  (window as any).DEMO_USERS = DEMO_USERS;
}
