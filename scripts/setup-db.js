#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up AI Interviewer Database...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('Please create a .env.local file with your Supabase credentials:');
  console.log(`
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
  `);
  process.exit(1);
}

// Check if Supabase CLI is installed
try {
  execSync('npx supabase --version', { stdio: 'pipe' });
} catch (error) {
  console.log('❌ Supabase CLI not found!');
  console.log('Installing Supabase CLI...');
  try {
    execSync('npm install -g supabase', { stdio: 'inherit' });
  } catch (installError) {
    console.log('❌ Failed to install Supabase CLI');
    console.log('Please install it manually: npm install -g supabase');
    process.exit(1);
  }
}

// Function to run commands with error handling
function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.message);
    return false;
  }
}

// Check if project is linked
console.log('🔗 Checking Supabase project link...');
try {
  execSync('npx supabase status', { stdio: 'pipe' });
  console.log('✅ Project is already linked\n');
} catch (error) {
  console.log('❌ Project not linked. Please link your Supabase project:');
  console.log('npx supabase link --project-ref your-project-ref\n');
  process.exit(1);
}

// Start local Supabase (optional)
const startLocal = process.argv.includes('--local');
if (startLocal) {
  if (!runCommand('npx supabase start', 'Starting local Supabase')) {
    console.log('⚠️  Local Supabase failed to start, continuing with remote...');
  }
}

// Push database schema
if (!runCommand('npx supabase db push', 'Pushing database schema')) {
  console.log('❌ Failed to push database schema');
  process.exit(1);
}

// Seed database
if (!runCommand('npx supabase db reset --seed', 'Seeding database with initial data')) {
  console.log('❌ Failed to seed database');
  process.exit(1);
}

// Generate TypeScript types
if (!runCommand('npx supabase gen types typescript --local > src/types/database.ts', 'Generating TypeScript types')) {
  console.log('⚠️  Failed to generate TypeScript types');
  console.log('You can generate them manually later with: npm run db:generate-types');
}

console.log('🎉 Database setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Start the development server: npm run dev');
console.log('2. Open http://localhost:3000');
console.log('3. Create an account and start practicing interviews!');
console.log('\n📚 For more information, see SUPABASE_SETUP.md');
