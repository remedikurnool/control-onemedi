// Mock Authentication System for OneMedi Healthcare Platform
// This provides demo login credentials for different user roles

export interface MockUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: 'super_admin' | 'admin' | 'manager' | 'pharmacist' | 'frontdesk' | 'doctor' | 'nurse' | 'lab_technician' | 'customer';
  is_active: boolean;
  permissions: Record<string, boolean>;
  department?: string;
  avatar_url?: string;
  location?: any;
  preferences?: any;
}

// Mock user database with demo credentials
export const MOCK_USERS: MockUser[] = [
  // Super Admin - Full system access
  {
    id: 'super-admin-001',
    email: 'superadmin@onemedi.com',
    password: 'SuperAdmin@123',
    full_name: 'Dr. Rajesh Kumar',
    phone: '+91-9876543210',
    role: 'super_admin',
    is_active: true,
    department: 'Administration',
    avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150',
    permissions: {
      'users.create': true,
      'users.read': true,
      'users.update': true,
      'users.delete': true,
      'inventory.manage': true,
      'orders.manage': true,
      'analytics.view': true,
      'settings.manage': true,
      'pos.access': true,
      'reports.generate': true,
      'system.configure': true
    }
  },

  // Admin - High-level management access
  {
    id: 'admin-001',
    email: 'admin@onemedi.com',
    password: 'Admin@123',
    full_name: 'Priya Sharma',
    phone: '+91-9876543211',
    role: 'admin',
    is_active: true,
    department: 'Operations',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b9c5e8e1?w=150',
    permissions: {
      'users.create': true,
      'users.read': true,
      'users.update': true,
      'users.delete': false,
      'inventory.manage': true,
      'orders.manage': true,
      'analytics.view': true,
      'settings.manage': false,
      'pos.access': true,
      'reports.generate': true
    }
  },

  // Manager - Department management access
  {
    id: 'manager-001',
    email: 'manager@onemedi.com',
    password: 'Manager@123',
    full_name: 'Amit Patel',
    phone: '+91-9876543212',
    role: 'manager',
    is_active: true,
    department: 'Healthcare Services',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    permissions: {
      'users.create': false,
      'users.read': true,
      'users.update': true,
      'users.delete': false,
      'inventory.manage': true,
      'orders.manage': true,
      'analytics.view': true,
      'pos.access': true,
      'reports.generate': false
    }
  },

  // Pharmacist - Pharmacy operations
  {
    id: 'pharmacist-001',
    email: 'pharmacist@onemedi.com',
    password: 'Pharma@123',
    full_name: 'Dr. Sunita Reddy',
    phone: '+91-9876543213',
    role: 'pharmacist',
    is_active: true,
    department: 'Pharmacy',
    avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
    permissions: {
      'users.read': true,
      'inventory.manage': true,
      'orders.manage': true,
      'medicines.dispense': true,
      'pos.access': true,
      'prescriptions.verify': true
    }
  },

  // Front Desk - POS and customer service
  {
    id: 'frontdesk-001',
    email: 'frontdesk@onemedi.com',
    password: 'FrontDesk@123',
    full_name: 'Kavya Nair',
    phone: '+91-9876543214',
    role: 'frontdesk',
    is_active: true,
    department: 'Customer Service',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    permissions: {
      'users.read': true,
      'orders.create': true,
      'orders.read': true,
      'pos.access': true,
      'customers.manage': true,
      'appointments.schedule': true
    }
  },

  // Doctor - Medical services
  {
    id: 'doctor-001',
    email: 'doctor@onemedi.com',
    password: 'Doctor@123',
    full_name: 'Dr. Arjun Singh',
    phone: '+91-9876543215',
    role: 'doctor',
    is_active: true,
    department: 'Medical',
    avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150',
    permissions: {
      'patients.read': true,
      'patients.update': true,
      'prescriptions.create': true,
      'appointments.manage': true,
      'medical_records.access': true
    }
  },

  // Nurse - Patient care
  {
    id: 'nurse-001',
    email: 'nurse@onemedi.com',
    password: 'Nurse@123',
    full_name: 'Sister Mary Joseph',
    phone: '+91-9876543216',
    role: 'nurse',
    is_active: true,
    department: 'Nursing',
    avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
    permissions: {
      'patients.read': true,
      'patients.update': true,
      'vitals.record': true,
      'medications.administer': true
    }
  },

  // Lab Technician - Laboratory operations
  {
    id: 'lab-tech-001',
    email: 'labtech@onemedi.com',
    password: 'LabTech@123',
    full_name: 'Ravi Kumar',
    phone: '+91-9876543217',
    role: 'lab_technician',
    is_active: true,
    department: 'Laboratory',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    permissions: {
      'lab_tests.process': true,
      'lab_tests.report': true,
      'samples.manage': true,
      'equipment.operate': true
    }
  }
];

// Mock authentication functions
export const mockLogin = async (email: string, password: string): Promise<MockUser | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = MOCK_USERS.find(u => u.email === email && u.password === password && u.is_active);
  
  if (user) {
    // Store in localStorage for persistence
    localStorage.setItem('mock_auth_user', JSON.stringify(user));
    localStorage.setItem('mock_auth_session', JSON.stringify({
      access_token: `mock_token_${user.id}`,
      refresh_token: `mock_refresh_${user.id}`,
      expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.full_name,
          role: user.role
        }
      }
    }));
    
    return user;
  }
  
  return null;
};

export const mockLogout = async (): Promise<void> => {
  localStorage.removeItem('mock_auth_user');
  localStorage.removeItem('mock_auth_session');
};

export const getCurrentMockUser = (): MockUser | null => {
  const userStr = localStorage.getItem('mock_auth_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const getCurrentMockSession = (): any | null => {
  const sessionStr = localStorage.getItem('mock_auth_session');
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      // Check if session is expired
      if (session.expires_at > Date.now()) {
        return session;
      } else {
        // Clean up expired session
        mockLogout();
        return null;
      }
    } catch {
      return null;
    }
  }
  return null;
};

// Role-based access control helpers
export const hasPermission = (user: MockUser | null, permission: string): boolean => {
  if (!user || !user.is_active) return false;
  return user.permissions[permission] === true;
};

export const isAdmin = (user: MockUser | null): boolean => {
  if (!user) return false;
  return ['super_admin', 'admin', 'manager'].includes(user.role);
};

export const canAccessPOS = (user: MockUser | null): boolean => {
  if (!user) return false;
  return hasPermission(user, 'pos.access');
};

export const canManageInventory = (user: MockUser | null): boolean => {
  if (!user) return false;
  return hasPermission(user, 'inventory.manage');
};

// Demo credentials for easy reference
export const DEMO_CREDENTIALS = {
  'Super Admin': { email: 'superadmin@onemedi.com', password: 'SuperAdmin@123' },
  'Admin': { email: 'admin@onemedi.com', password: 'Admin@123' },
  'Manager': { email: 'manager@onemedi.com', password: 'Manager@123' },
  'Pharmacist': { email: 'pharmacist@onemedi.com', password: 'Pharma@123' },
  'Front Desk': { email: 'frontdesk@onemedi.com', password: 'FrontDesk@123' },
  'Doctor': { email: 'doctor@onemedi.com', password: 'Doctor@123' },
  'Nurse': { email: 'nurse@onemedi.com', password: 'Nurse@123' },
  'Lab Technician': { email: 'labtech@onemedi.com', password: 'LabTech@123' }
};
