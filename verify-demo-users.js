// Quick verification script for demo users
// Run this in browser console on the login page

async function verifyDemoUsers() {
  console.log('🔍 Verifying demo users...\n');
  
  const credentials = [
    { email: 'superadmin@onemedi.com', password: 'SuperAdmin@123', role: 'Super Admin' },
    { email: 'admin@onemedi.com', password: 'Admin@123', role: 'Admin' },
    { email: 'manager@onemedi.com', password: 'Manager@123', role: 'Manager' },
    { email: 'doctor@onemedi.com', password: 'Doctor@123', role: 'Doctor' },
    { email: 'pharmacist@onemedi.com', password: 'Pharma@123', role: 'Pharmacist' }
  ];
  
  let successCount = 0;
  
  for (const cred of credentials) {
    try {
      console.log(`Testing ${cred.role}: ${cred.email}`);
      
      // Import Supabase client
      const { supabase } = await import('/src/integrations/supabase/client.ts');
      
      // Test login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });
      
      if (error) {
        console.log(`❌ ${cred.role}: ${error.message}`);
      } else if (data.user) {
        console.log(`✅ ${cred.role}: Login successful`);
        successCount++;
        
        // Sign out immediately
        await supabase.auth.signOut();
      }
      
    } catch (err) {
      console.log(`❌ ${cred.role}: ${err.message}`);
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n📊 Results: ${successCount}/${credentials.length} working`);
  
  if (successCount === 0) {
    console.log('\n🚨 NO DEMO USERS WORKING!');
    console.log('Please run the setup-demo-users.sql script in Supabase SQL Editor');
    console.log('Instructions: See SETUP_DEMO_USERS_INSTRUCTIONS.md');
  } else if (successCount === credentials.length) {
    console.log('\n🎉 ALL DEMO USERS WORKING!');
    console.log('You can now log in with any of the demo credentials');
  } else {
    console.log('\n⚠️ SOME DEMO USERS NOT WORKING');
    console.log('Please run the setup-demo-users.sql script to fix all users');
  }
}

// Auto-run verification
verifyDemoUsers();
