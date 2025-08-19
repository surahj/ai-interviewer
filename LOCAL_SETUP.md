# AI Interviewer - Local Development Setup

This guide will help you set up the AI Interviewer project for local development with Supabase and OpenAI Realtime API.

## 🚀 Quick Start

Your local development environment is now ready! Here's what's running:

- **Next.js App**: http://localhost:3000
- **Supabase API**: http://127.0.0.1:54321
- **Supabase Studio**: http://127.0.0.1:54323
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase CLI (already installed)
- Docker (for local Supabase)
- **OpenAI API key with Realtime API access**

## 🔧 Environment Setup

The `.env.local` file has been configured with local Supabase credentials:

```env
# Supabase Configuration (Local Development)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# AI Service APIs
OPENAI_API_KEY=your_openai_api_key_here  # Required for Realtime API

# Application Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Database (Local Supabase)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### 🔑 OpenAI API Setup

1. **Get OpenAI API Key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys) to create an API key
2. **Enable Realtime API**: Ensure your OpenAI account has access to the Realtime API (currently in preview)
3. **Add to Environment**: Replace `your_openai_api_key_here` in `.env.local` with your actual API key

## 🗄️ Database Schema

The database has been set up with the following tables:

- **interviews**: Stores interview sessions and metadata (includes OpenAI Realtime session fields)
- **questions**: Pre-populated with sample questions for different roles and levels
- **user_profiles**: User profile information
- **interview_sessions**: Active interview sessions

### New OpenAI Realtime Fields

The `interviews` table now includes:
- `openai_session_id`: OpenAI Realtime session identifier
- `openai_session_token`: Session token for WebRTC connection
- `openai_session_expires_at`: Session expiration timestamp

### Sample Data

The database is seeded with:
- 50+ sample questions for Software Engineer, Frontend Developer, and Data Scientist roles
- Questions for Junior, Mid-level, and Senior experience levels
- Technical, behavioral, and problem-solving question categories

## 🛠️ Available Commands

### Development
```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server
```

### Database Management
```bash
supabase start       # Start local Supabase services
supabase stop        # Stop local Supabase services
supabase status      # Check service status
supabase db reset    # Reset database with migrations and seed data
supabase db push     # Push local migrations to remote
```

### TypeScript
```bash
npm run type-check   # Check TypeScript types
supabase gen types typescript --local > src/types/database.ts  # Generate DB types
```

### Testing
```bash
npm run test         # Run Playwright tests
npm run test:ui      # Run tests with UI
npm run test:headed  # Run tests in headed mode
```

## 🔍 Exploring the Application

### 1. Landing Page
Visit http://localhost:3000 to see the main landing page with:
- Feature overview
- Call-to-action buttons
- Modern UI with Tailwind CSS

### 2. Authentication
- **Register**: http://localhost:3000/register
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard (requires authentication)

### 3. Interview Flow
- **Setup Interview**: http://localhost:3000/setup-interview
- **Live Interview**: http://localhost:3000/interview/live (now uses OpenAI Realtime API)
- **Interview Summary**: http://localhost:3000/interview/summary

### 4. Supabase Studio
Visit http://127.0.0.1:54323 to:
- View and edit database tables
- Test authentication
- Monitor real-time subscriptions
- Manage storage buckets

## 🔐 Authentication

The app uses Supabase Auth with:
- Email/password authentication
- Row Level Security (RLS) policies
- JWT tokens for session management

### Test Users
You can create test users through the registration page or directly in Supabase Studio.

## 🎯 Key Features

### 1. OpenAI Realtime API Integration
- **Real-time voice conversation** with AI interviewer
- **WebRTC-based audio streaming** for low-latency communication
- **Automatic speech-to-text and text-to-speech** handled by OpenAI
- **Natural conversation flow** with barge-in support

### 2. AI-Powered Analysis
- OpenAI GPT integration for question generation and feedback
- Sentiment analysis and response evaluation
- Real-time conversation memory and context

### 3. Interview Management
- Create and manage interview sessions
- Track progress and performance
- Generate detailed feedback reports
- Store conversation transcripts

### 4. Question Bank
- Pre-populated with industry-standard questions
- Categorized by role, level, and type
- Difficulty ratings and tags

## 🎤 How Realtime Works

1. **Session Creation**: When starting an interview, the backend creates an OpenAI Realtime session
2. **WebRTC Connection**: Frontend establishes WebRTC connection to OpenAI's servers
3. **Audio Streaming**: User's microphone audio streams to OpenAI in real-time
4. **AI Processing**: OpenAI handles speech-to-text, conversation logic, and text-to-speech
5. **Audio Response**: AI's voice streams back to the user's browser
6. **Natural Flow**: Both directions run continuously for a natural conversation experience

## 🐛 Troubleshooting

### Common Issues

1. **Supabase services not starting**
   ```bash
   supabase stop
   supabase start
   ```

2. **Database connection issues**
   ```bash
   supabase db reset
   ```

3. **OpenAI API errors**
   - Verify your API key is correct
   - Ensure you have access to the Realtime API
   - Check your OpenAI account billing status

4. **WebRTC connection issues**
   - Ensure you're using a supported browser (Chrome, Edge, Safari)
   - Check microphone permissions
   - Verify your internet connection is stable

5. **TypeScript errors**
   ```bash
   npm run type-check
   supabase gen types typescript --local > src/types/database.ts
   ```

6. **Port conflicts**
   - Check if ports 54321-54324 are available
   - Stop other services using these ports

### Logs
- **Supabase logs**: `supabase logs`
- **Next.js logs**: Check terminal where `npm run dev` is running

## 📁 Project Structure

```
ai-interviewer/
├── src/
│   ├── app/                 # Next.js 13+ app directory
│   ├── components/          # React components
│   ├── lib/                 # Utility libraries
│   │   ├── realtime.ts      # OpenAI Realtime API manager
│   │   └── speech.ts        # Legacy speech utilities
│   └── types/               # TypeScript type definitions
├── supabase/
│   ├── migrations/          # Database migrations
│   │   └── 20240817000001_add_openai_realtime_fields.sql
│   ├── seed/               # Seed data
│   └── config.toml         # Supabase configuration
├── tests/                  # Playwright tests
└── scripts/                # Setup and utility scripts
```

## 🚀 Next Steps

1. **Add your OpenAI API key** to `.env.local`
2. **Create a test account** through the registration page
3. **Try the interview flow** by setting up a mock interview
4. **Experience real-time voice conversation** with the AI interviewer
5. **Explore the dashboard** to see analytics and progress tracking
6. **Check Supabase Studio** to understand the data structure

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/realtime)
- [WebRTC Documentation](https://webrtc.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Playwright Testing](https://playwright.dev)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test`
4. Submit a pull request

---

**Happy coding! 🎉**

Your AI Interviewer local development environment is ready to use with OpenAI Realtime API integration.
