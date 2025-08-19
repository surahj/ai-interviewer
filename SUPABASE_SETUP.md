# Supabase Setup Guide for AI Interviewer

This guide will help you set up Supabase for the AI Interviewer application using migrations.

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Supabase CLI installed (`npm install -g supabase`)
- A Supabase account (free tier works fine)

### 2. Initialize Supabase Project

The project is already initialized with the following structure:

```
supabase/
├── migrations/          # Database schema migrations
│   └── 20240817000000_initial_schema.sql
├── seed/               # Seed data
│   └── seed.sql
├── functions/          # Edge Functions (future use)
├── config.toml         # Supabase configuration
└── .gitignore
```

### 3. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and API keys
3. Update your `.env.local` file with the credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Link Your Project

```bash
# Link your local project to your Supabase project
npx supabase link --project-ref your-project-ref

# Start local development (optional)
npx supabase start
```

### 5. Apply Database Schema

```bash
# Push the schema to your Supabase project
npm run db:push

# Or if you want to reset and seed the database
npm run db:seed
```

## 📋 Database Schema

### Tables

#### `interviews`
Stores interview sessions and results.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References auth.users |
| `role` | TEXT | Job role (e.g., 'software-engineer') |
| `level` | TEXT | Experience level (e.g., 'senior') |
| `candidate_name` | TEXT | Optional candidate name |
| `interview_type` | ENUM | 'technical', 'behavioral', 'mixed', 'case-study' |
| `duration` | INTEGER | Interview duration in minutes |
| `focus_area` | TEXT | Focus area (e.g., 'backend') |
| `custom_requirements` | TEXT | Custom requirements |
| `total_questions` | INTEGER | Number of questions |
| `transcript` | JSONB | Interview transcript |
| `feedback` | JSONB | Interview feedback |
| `status` | ENUM | 'active', 'completed', 'cancelled' |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `completed_at` | TIMESTAMP | Completion timestamp |

#### `questions`
Stores interview questions for different roles and levels.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `role` | TEXT | Job role |
| `level` | TEXT | Experience level |
| `question` | TEXT | Question text |
| `type` | ENUM | Question type |
| `category` | ENUM | Question category |
| `difficulty` | INTEGER | Difficulty (1-5) |
| `tags` | TEXT[] | Question tags |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

#### `user_profiles`
Stores additional user information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | References auth.users |
| `full_name` | TEXT | User's full name |
| `avatar_url` | TEXT | Avatar URL |
| `bio` | TEXT | User bio |
| `preferred_role` | TEXT | Preferred job role |
| `experience_level` | TEXT | Experience level |
| `skills` | TEXT[] | User skills |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

#### `interview_sessions`
Tracks active interview sessions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `interview_id` | UUID | References interviews |
| `session_token` | TEXT | Session token |
| `system_prompt` | TEXT | AI system prompt |
| `is_active` | BOOLEAN | Session status |
| `created_at` | TIMESTAMP | Creation timestamp |
| `ended_at` | TIMESTAMP | End timestamp |

### Functions

#### `get_user_interview_stats(user_uuid UUID)`
Returns interview statistics for a user.

#### `get_questions_by_role_level(p_role TEXT, p_level TEXT, p_type ENUM, p_limit INTEGER)`
Returns questions filtered by role, level, and type.

#### `calculate_interview_stats()`
Returns overall interview statistics.

## 🔐 Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **interviews**: Users can only access their own interviews
- **questions**: All authenticated users can read questions
- **user_profiles**: Users can only access their own profile
- **interview_sessions**: Users can only access sessions for their interviews

## 🛠️ Database Commands

### Development Commands

```bash
# Start local Supabase
npm run db:start

# Stop local Supabase
npm run db:stop

# Check status
npm run db:status

# Push schema changes
npm run db:push

# Reset database and seed
npm run db:seed

# Generate TypeScript types
npm run db:generate-types
```

### Production Commands

```bash
# Apply migrations to production
npx supabase db push --db-url your-production-db-url

# Generate types from production
npx supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

## 📊 Seed Data

The seed file (`supabase/seed/seed.sql`) includes:

- **50+ Questions** for different roles and levels
- **Technical Questions** for software engineers, frontend developers, data scientists
- **Behavioral Questions** for all roles
- **Problem-solving Questions** with varying difficulty levels

### Question Categories

1. **Technical**: Programming concepts, algorithms, frameworks
2. **Behavioral**: Past experiences, teamwork, leadership
3. **Problem-solving**: System design, real-world scenarios
4. **Communication**: Clarity, presentation skills

### Difficulty Levels

- **1-2**: Junior level (0-2 years experience)
- **3**: Mid-level (3-5 years experience)
- **4-5**: Senior level (6+ years experience)

## 🔄 Migration Workflow

### Creating New Migrations

```bash
# Create a new migration
npx supabase migration new migration_name

# This creates a new file in supabase/migrations/
```

### Example Migration

```sql
-- Example: Add new column to interviews table
ALTER TABLE interviews ADD COLUMN difficulty_level INTEGER DEFAULT 3;

-- Example: Create new table
CREATE TABLE interview_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES interviews(id),
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Applying Migrations

```bash
# Apply all pending migrations
npm run db:push

# Check migration status
npx supabase migration list
```

## 🧪 Testing Database

### Local Testing

```bash
# Start local Supabase
npm run db:start

# Run tests
npm run test

# Stop local Supabase
npm run db:stop
```

### Database Testing

```sql
-- Test user interview stats
SELECT * FROM get_user_interview_stats('user-uuid-here');

-- Test question retrieval
SELECT * FROM get_questions_by_role_level('software-engineer', 'senior', 'technical', 5);

-- Test interview stats
SELECT * FROM calculate_interview_stats();
```

## 🔍 Monitoring and Debugging

### View Database Logs

```bash
# View local database logs
npx supabase logs

# View specific service logs
npx supabase logs --service db
```

### Database Inspector

```bash
# Open Supabase Studio
npx supabase studio
```

### Common Issues

1. **Migration Conflicts**: Use `npm run db:reset` to start fresh
2. **RLS Issues**: Check policy definitions in migrations
3. **Type Generation**: Run `npm run db:generate-types` after schema changes

## 📈 Performance Optimization

### Indexes

The schema includes optimized indexes for:

- User interviews (`user_id`)
- Interview status (`status`)
- Question filtering (`role`, `level`, `type`)
- Session tokens (`session_token`)

### Query Optimization

```sql
-- Use functions for complex queries
SELECT * FROM get_user_interview_stats('user-uuid');

-- Use indexes for filtering
SELECT * FROM questions WHERE role = 'software-engineer' AND level = 'senior';
```

## 🔒 Security Best Practices

1. **Always use RLS**: Never disable RLS on production tables
2. **Validate inputs**: Use check constraints and triggers
3. **Use service role carefully**: Only for admin operations
4. **Monitor access**: Use Supabase logs to monitor database access

## 🚀 Deployment

### Staging Deployment

```bash
# Link to staging project
npx supabase link --project-ref staging-project-ref

# Push schema
npm run db:push

# Generate types
npm run db:generate-types
```

### Production Deployment

```bash
# Link to production project
npx supabase link --project-ref production-project-ref

# Push schema
npm run db:push

# Generate types
npm run db:generate-types
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

---

**Need help?** Check the [GitHub Issues](https://github.com/your-username/ai-interviewer/issues) or create a new one!
