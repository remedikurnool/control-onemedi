// Test script to verify login credentials are working
// Run this in browser console on the login page

async function testAllLogins() {
  console.log('🔍 Testing all demo login credentials...\n');
  
  const credentials = [
    { email: 'admin@onemedi.com', password: 'Admin@123', role: 'Admin' },
    { email: 'dr.kumar@onemedi.com', password: 'Doctor@123', role: 'Dr. Kumar' },
    { email: 'dr.priya@onemedi.com', password: 'Doctor@123', role: 'Dr. Priya' },
    { email: 'dr.anitha@onemedi.com', password: 'Doctor@123', role: 'Dr. Anitha' },
    { email: 'dr.sharma@onemedi.com', password: 'Doctor@123', role: 'Dr. Sharma' }
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  for (const cred of credentials) {
    try {
      console.log(`Testing ${cred.role}: ${cred.email}`);
      
      // Import Supabase client
      const { supabase } = await import('/src/integrations/supabase/client.ts');
      
      // Sign out first
      await supabase.auth.signOut();
      
      // Test login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });
      
      if (error) {
        console.log(`❌ ${cred.role}: ${error.message}`);
        failCount++;
      } else if (data.user) {
        // Check user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError || !profile) {
          console.log(`❌ ${cred.role}: Profile not found`);
          failCount++;
        } else if (!profile.is_active) {
          console.log(`❌ ${cred.role}: Account inactive`);
          failCount++;
        } else {
          console.log(`✅ ${cred.role}: Login successful - ${profile.full_name} (${profile.role})`);
          successCount++;
        }
        
        // Sign out immediately
        await supabase.auth.signOut();
      }
      
    } catch (err) {
      console.log(`❌ ${cred.role}: ${err.message}`);
      failCount++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n📊 Test Results:`);
  console.log(`✅ Successful logins: ${successCount}`);
  console.log(`❌ Failed logins: ${failCount}`);
  console.log(`📈 Success rate: ${((successCount / credentials.length) * 100).toFixed(1)}%`);
  
  if (successCount === credentials.length) {
    console.log('\n🎉 ALL DEMO CREDENTIALS ARE WORKING!');
    console.log('You can now log in with any of the demo accounts.');
  } else if (successCount > 0) {
    console.log('\n⚠️ SOME CREDENTIALS ARE WORKING');
    console.log('Try using the working credentials to log in.');
  } else {
    console.log('\n🚨 NO CREDENTIALS ARE WORKING');
    console.log('Please check the database setup.');
  }
  
  console.log('\n🔗 Login URL: http://localhost:8080/login');
  console.log('📋 Use the demo credential buttons on the login page for easy access.');
}

// Auto-run the test
testAllLogins();
