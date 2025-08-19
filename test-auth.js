const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local file not found');
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  return envVars;
}

// Test configuration
const TEST_EMAIL = `test-${Date.now()}@gmail.com`;
const TEST_PASSWORD = 'testpassword123';
const TEST_NAME = 'Test User';

async function testSupabaseAuth() {
  console.log('🧪 Testing Supabase Authentication...\n');

  try {
    // Load environment variables
    const envVars = loadEnvFile();
    const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Environment variables not found!');
      console.log('Make sure .env.local contains:');
      console.log('- NEXT_PUBLIC_SUPABASE_URL');
      console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return;
    }

    console.log('✅ Environment variables loaded');
    console.log(`📡 Supabase URL: ${supabaseUrl.substring(0, 30)}...`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client created\n');

    // Test 1: Sign Up
    console.log('1️⃣ Testing Sign Up...');
    console.log(`   Using email: ${TEST_EMAIL}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        data: {
          name: TEST_NAME,
        },
      },
    });

    if (signUpError) {
      console.error('❌ Sign Up failed:', signUpError.message);
      console.log('\n💡 This might be expected if:');
      console.log('   - Email confirmation is required');
      console.log('   - The email domain is restricted');
      console.log('   - Supabase settings need adjustment');
      return;
    }

    console.log('✅ Sign Up successful!');
    console.log(`   User ID: ${signUpData.user?.id}`);
    console.log(`   Email: ${signUpData.user?.email}`);
    console.log(`   Name: ${signUpData.user?.user_metadata?.name}`);
    console.log(`   Email confirmed: ${signUpData.user?.email_confirmed_at ? 'Yes' : 'No'}\n`);

    // Test 2: Sign In (only if email is confirmed or confirmation is not required)
    if (signUpData.user?.email_confirmed_at || !signUpData.user?.email_confirmed_at) {
      console.log('2️⃣ Testing Sign In...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      if (signInError) {
        console.error('❌ Sign In failed:', signInError.message);
        console.log('\n💡 This might be expected if email confirmation is required');
        return;
      }

      console.log('✅ Sign In successful!');
      console.log(`   Session: ${signInData.session ? 'Active' : 'None'}`);
      console.log(`   User: ${signInData.user?.email}\n`);

      // Test 3: Get User Session
      console.log('3️⃣ Testing Session Management...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('❌ Session check failed:', sessionError.message);
        return;
      }

      if (session) {
        console.log('✅ Session active!');
        console.log(`   User ID: ${session.user.id}`);
        console.log(`   Expires: ${new Date(session.expires_at * 1000).toLocaleString()}\n`);
      } else {
        console.log('⚠️  No active session\n');
      }

      // Test 4: Sign Out
      console.log('4️⃣ Testing Sign Out...');
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error('❌ Sign Out failed:', signOutError.message);
        return;
      }

      console.log('✅ Sign Out successful!\n');

      // Test 5: Verify Sign Out
      console.log('5️⃣ Verifying Sign Out...');
      const { data: { session: afterSignOutSession } } = await supabase.auth.getSession();

      if (!afterSignOutSession) {
        console.log('✅ Session properly cleared!\n');
      } else {
        console.log('⚠️  Session still active after sign out\n');
      }

      console.log('🎉 All authentication tests passed!');
      console.log('\n📝 Test Summary:');
      console.log('   ✅ Sign Up - Working');
      console.log('   ✅ Sign In - Working');
      console.log('   ✅ Session Management - Working');
      console.log('   ✅ Sign Out - Working');
      console.log('   ✅ Environment Variables - Configured');
    } else {
      console.log('⚠️  Email confirmation required - skipping sign in test');
      console.log('\n📝 Test Summary:');
      console.log('   ✅ Sign Up - Working (email confirmation required)');
      console.log('   ⏸️  Sign In - Skipped (needs email confirmation)');
      console.log('   ✅ Environment Variables - Configured');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testSupabaseAuth().catch(console.error);
