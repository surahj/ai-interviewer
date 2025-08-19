// Test script for OpenAI Realtime API integration
const fetch = require('node-fetch');

async function testRealtimeAPI() {
  console.log('🧪 Testing OpenAI Realtime API Integration...\n');

  // Test 1: Check if OpenAI API key is configured
  console.log('1. Checking OpenAI API key...');
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OPENAI_API_KEY not found in environment variables');
    console.log('   Please add your OpenAI API key to .env.local');
    return;
  }
  console.log('✅ OpenAI API key found\n');

  // Test 2: Test session creation endpoint
  console.log('2. Testing session creation endpoint...');
  try {
    const response = await fetch('http://localhost:3000/api/interview/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'software-engineer',
        level: 'mid-level',
        type: 'technical',
        duration: '30',
        focusArea: 'backend',
        customRequirements: 'Node.js and microservices'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Session creation successful');
      console.log(`   Session ID: ${data.sessionId}`);
      console.log(`   Realtime Session ID: ${data.realtimeSession?.id || 'N/A'}`);
      console.log(`   Total Questions: ${data.interviewConfig.totalQuestions}`);
    } else {
      const errorText = await response.text();
      console.log(`❌ Session creation failed: ${response.status}`);
      console.log(`   Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Session creation error: ${error.message}`);
  }

  console.log('\n3. Testing database connection...');
  try {
    const response = await fetch('http://localhost:3000/api/ping');
    if (response.ok) {
      console.log('✅ Database connection successful');
    } else {
      console.log('❌ Database connection failed');
    }
  } catch (error) {
    console.log(`❌ Database connection error: ${error.message}`);
  }

  console.log('\n🎯 Test Summary:');
  console.log('- Make sure your OpenAI API key has Realtime API access');
  console.log('- Ensure Supabase is running: supabase start');
  console.log('- Check that the Next.js dev server is running: npm run dev');
  console.log('- Visit http://localhost:3000 to test the full application');
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the test
testRealtimeAPI().catch(console.error);
