# Database Setup Guide

This guide will help you quickly set up the database for the AI Interviewer application.

## 🚀 Quick Setup

### 1. Prerequisites
- Node.js 18+
- Supabase account
- Supabase CLI (`npm install -g supabase`)

### 2. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

### 3. Configure Environment
Create `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Link Project
```bash
npx supabase link --project-ref your-project-ref
```

### 5. Setup Database
```bash
# Run the automated setup script
npm run db:setup

# Or manually:
npm run db:push    # Push schema
npm run db:seed    # Seed data
```

## 📋 What's Included

### Database Schema
- **interviews**: Interview sessions and results
- **questions**: 50+ questions for different roles/levels
- **user_profiles**: User information
- **interview_sessions**: Active session tracking

### Seed Data
- Technical questions for Software Engineers, Frontend Developers, Data Scientists
- Behavioral questions for all roles
- Problem-solving scenarios
- Questions categorized by difficulty (1-5)

### Functions
- `get_user_interview_stats()`: User statistics
- `get_questions_by_role_level()`: Filtered questions
- `calculate_interview_stats()`: Overall statistics

## 🛠️ Development Commands

```bash
# Database operations
npm run db:start      # Start local Supabase
npm run db:stop       # Stop local Supabase
npm run db:push       # Push schema changes
npm run db:seed       # Reset and seed database
npm run db:status     # Check status

# Type generation
npm run db:generate-types  # Generate TypeScript types
```

## 🔍 Testing

```sql
-- Test user stats
SELECT * FROM get_user_interview_stats('user-uuid');

-- Test question retrieval
SELECT * FROM get_questions_by_role_level('software-engineer', 'senior', 'technical', 5);

-- Test overall stats
SELECT * FROM calculate_interview_stats();
```

## 📚 More Information

- **Full Setup Guide**: See `SUPABASE_SETUP.md`
- **Schema Details**: See `supabase/migrations/20240817000000_initial_schema.sql`
- **Seed Data**: See `supabase/seed/seed.sql`
- **TypeScript Types**: See `src/types/database.ts`

## 🆘 Troubleshooting

### Common Issues

1. **"Project not linked"**
   ```bash
   npx supabase link --project-ref your-project-ref
   ```

2. **"Migration conflicts"**
   ```bash
   npm run db:reset
   ```

3. **"Type generation failed"**
   ```bash
   npm run db:generate-types
   ```

### Need Help?
- Check `SUPABASE_SETUP.md` for detailed instructions
- Review the migration files in `supabase/migrations/`
- Check Supabase logs: `npx supabase logs`

---

**Ready to start?** Run `npm run db:setup` and then `npm run dev`!
