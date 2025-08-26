# AI Interviewer

A modern, AI-powered interview practice platform built with Next.js, Supabase, and OpenAI Realtime API.

## 🚀 Features

### 🎤 Real-time Voice Interviews

- **OpenAI Realtime API Integration**: Natural voice conversations with AI interviewers
- **WebRTC Audio Streaming**: Low-latency, high-quality audio communication
- **Automatic Speech Processing**: OpenAI handles speech-to-text and text-to-speech
- **Barge-in Support**: Natural conversation flow with interruption handling
- **Dual Interview Modes**: Choose between standard speech recognition and real-time conversation

### 🎯 Smart Interview System

- **Role-based Questions**: Tailored questions for different job roles and levels
- **Adaptive Conversations**: AI adapts questions based on your responses
- **Real-time Feedback**: Instant analysis and scoring of your answers
- **Progress Tracking**: Monitor your improvement over time

### 🔐 Authentication & User Management

- **Email/Password Authentication**: Traditional sign-up and sign-in
- **Google OAuth Integration**: One-click sign-in with Google accounts
- **User Profiles**: Manage your personal information and preferences
- **Session Management**: Secure, persistent login sessions

### 🏗️ Modern Tech Stack

- **Next.js 14**: React framework with App Router
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **OpenAI Realtime API**: Advanced AI conversation capabilities
- **Tailwind CSS**: Modern, responsive UI design
- **TypeScript**: Type-safe development

## 🎤 How It Works

### Interview Modes

#### 1. Standard Interview Mode

- Uses browser speech recognition and synthesis
- Works on all modern browsers
- Turn-based conversation with AI
- Good for users with limited internet or older browsers

#### 2. Real-time Conversation Mode

- Uses OpenAI's Realtime API for natural conversation
- Requires modern browser with WebRTC support
- Sub-second response times with natural AI voice
- Full conversation context and barge-in support

### 1. Session Creation

When you start an interview, the system:

- Creates an OpenAI Realtime session with your role and level (real-time mode)
- Or initializes speech recognition (standard mode)
- Generates a personalized interview persona
- Establishes connection credentials

### 2. Real-time Conversation

During the interview:

- **Real-time Mode**: Your microphone audio streams to OpenAI via WebRTC
- **Standard Mode**: Browser processes speech and sends text to AI
- OpenAI processes speech-to-text, conversation logic, and text-to-speech
- AI responses stream back to your browser in real-time
- Natural conversation flow with barge-in support

### 3. Analysis & Feedback

After the interview:

- Complete transcript is saved to the database
- AI analyzes your responses and provides detailed feedback
- Performance metrics and improvement suggestions
- Progress tracking for future sessions

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key with Realtime API access
- Supabase account (free tier works)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/ai-interviewer.git
   cd ai-interviewer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env.local
   ```

   Update `.env.local` with your credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up Google OAuth (Optional)**

   To enable Google sign-in:

   a. Go to the [Google Cloud Console](https://console.cloud.google.com/)
   b. Create a new project or select an existing one
   c. Enable the Google+ API
   d. Go to "Credentials" and create an OAuth 2.0 Client ID
   e. Add your domain to authorized origins (e.g., `http://localhost:3000` for development)
   f. Add your redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   g. Copy the Client ID and Client Secret to your `.env.local`:

   ```env
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id
   SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_client_secret
   ```

5. **Set up the database**

   ```bash
   # Start Supabase locally
   supabase start

   # Apply migrations
   supabase db reset
   ```

6. **Run the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ai-interviewer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   └── interview/     # Interview-related APIs
│   │   ├── dashboard/         # User dashboard
│   │   ├── interview/         # Interview pages
│   │   └── setup-interview/   # Interview setup
│   ├── components/            # React components
│   │   ├── interview/         # Interview-specific components
│   │   └── ui/               # Reusable UI components
│   ├── lib/                  # Utility libraries
│   │   ├── realtime.ts       # OpenAI Realtime API manager
│   │   ├── supabase.ts       # Supabase client
│   │   └── utils.ts          # General utilities
│   └── types/                # TypeScript definitions
├── supabase/
│   ├── migrations/           # Database migrations
│   └── seed/                # Seed data
└── tests/                   # Playwright tests
```

## 🎯 Supported Interview Types

### Job Roles

- Software Engineer
- Frontend Developer
- Backend Developer
- Full Stack Developer
- Data Scientist
- DevOps Engineer
- Product Manager
- UI/UX Designer
- QA Engineer
- Mobile Developer

### Experience Levels

- Junior (0-2 years)
- Mid-Level (3-5 years)
- Senior (6-8 years)
- Lead (8+ years)

### Interview Types

- Technical Interviews
- Behavioral Interviews
- Mixed Interviews
- Case Study Interviews

## 🔧 API Endpoints

### Interview Management

- `POST /api/interview/session` - Create new interview session
- `GET /api/interview/session` - Get session details
- `POST /api/interview/feedback` - Generate interview feedback

### Question Generation

- `POST /api/interview/generate-question` - Generate contextual questions
- `POST /api/interview/analyze-response` - Analyze user responses

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

Run tests with UI:

```bash
npm run test:ui
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for the Realtime API
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for the styling

## 📞 Support

If you have any questions or need help:

- Open an issue on GitHub
- Check the [documentation](LOCAL_SETUP.md)
- Join our community discussions

---

**Ready to ace your next interview? Start practicing with AI! 🎉**
