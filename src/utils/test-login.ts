// Test login functionality with demo credentials
import { supabase } from '@/integrations/supabase/client';

export const DEMO_CREDENTIALS = [
  { email: 'admin@onemedi.com', password: 'Admin@123', role: 'Admin' },
  { email: 'dr.kumar@onemedi.com', password: 'Doctor@123', role: 'Dr. Kumar' },
  { email: 'dr.priya@onemedi.com', password: 'Doctor@123', role: 'Dr. Priya' },
  { email: 'dr.anitha@onemedi.com', password: 'Doctor@123', role: 'Dr. Anitha' },
  { email: 'dr.sharma@onemedi.com', password: 'Doctor@123', role: 'Dr. Sharma' }
];

export async function testLogin(email: string, password: string): Promise<{
  success: boolean;
  user?: any;
  profile?: any;
  error?: string;
}> {
  try {
    console.log(`🔍 Testing login for: ${email}`);
    
    // Sign out first to ensure clean state
    await supabase.auth.signOut();
    
    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) {
      console.error(`❌ Login failed for ${email}:`, error.message);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      console.error(`❌ No user data returned for ${email}`);
      return { success: false, error: 'No user data returned' };
    }

    console.log(`✅ Auth successful for ${email}`);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error(`❌ Profile fetch failed for ${email}:`, profileError.message);
      return { 
        success: false, 
        error: `Profile not found: ${profileError.message}`,
        user: data.user 
      };
    }

    if (!profile.is_active) {
      console.error(`❌ Account inactive for ${email}`);
      return { 
        success: false, 
        error: 'Account is inactive',
        user: data.user,
        profile 
      };
    }

    console.log(`✅ Login successful for ${email} - Role: ${profile.role}`);
    
    // Sign out after test
    await supabase.auth.signOut();
    
    return { 
      success: true, 
      user: data.user, 
      profile 
    };

  } catch (error: any) {
    console.error(`❌ Login test failed for ${email}:`, error.message);
    return { success: false, error: error.message };
  }
}

export async function testAllDemoCredentials(): Promise<void> {
  console.log('🚀 Testing all demo credentials...\n');
  
  const results = [];
  
  for (const cred of DEMO_CREDENTIALS) {
    const result = await testLogin(cred.email, cred.password);
    results.push({
      ...cred,
      success: result.success,
      error: result.error,
      profile: result.profile
    });
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful logins: ${successful.length}/${results.length}`);
  console.log(`❌ Failed logins: ${failed.length}/${results.length}\n`);
  
  if (successful.length > 0) {
    console.log('✅ Working Credentials:');
    successful.forEach(r => {
      console.log(`   ${r.role}: ${r.email} / ${r.password}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed Credentials:');
    failed.forEach(r => {
      console.log(`   ${r.role}: ${r.email} - Error: ${r.error}`);
    });
  }
  
  console.log('\n🔗 Login URL: http://localhost:8080/login');
  
  if (successful.length === results.length) {
    console.log('\n🎉 All demo credentials are working!');
  } else {
    console.log('\n⚠️  Some credentials need attention. Please run the setup-demo-users.sql script.');
  }
}

// Quick test function for a single user
export async function quickTest(email: string = 'admin@onemedi.com', password: string = 'Admin@123'): Promise<void> {
  console.log(`🔍 Quick test for: ${email}`);
  const result = await testLogin(email, password);
  
  if (result.success) {
    console.log(`✅ Login successful! Role: ${result.profile?.role}`);
    console.log(`👤 User: ${result.profile?.full_name}`);
  } else {
    console.log(`❌ Login failed: ${result.error}`);
    console.log('💡 Please run the setup-demo-users.sql script in Supabase SQL Editor');
  }
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testLogin = testLogin;
  (window as any).testAllDemoCredentials = testAllDemoCredentials;
  (window as any).quickTest = quickTest;
  (window as any).DEMO_CREDENTIALS = DEMO_CREDENTIALS;
}
