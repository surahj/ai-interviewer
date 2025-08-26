import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';
import { generateInterviewQuestion, InterviewContext } from '@/lib/openai';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface QuestionRequest {
  context: InterviewContext & {
    previousQuestions?: string[];
    avoidSimilar?: boolean;
  };
  userResponse?: string;
  isFirstQuestion: boolean;
  interviewId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get user from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const userId = authHeader.replace('Bearer ', '');
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid authorization header' },
        { status: 401 }
      );
    }

    const body: QuestionRequest = await request.json();
    const { context, userResponse, isFirstQuestion, interviewId } = body;

    // Validate request
    if (!context || !context.role) {
      return NextResponse.json(
        { error: 'Invalid request: missing context or role' },
        { status: 400 }
      );
    }

    // Generate question using OpenAI
    let question: string;
    
    if (isFirstQuestion) {
      question = await generateInterviewQuestion(context, undefined, true, userId, interviewId);
    } else {
      // If we need to avoid similar questions, add that context
      if (context.avoidSimilar && context.previousQuestions) {
        const enhancedContext = {
          ...context,
          avoidSimilarQuestions: context.previousQuestions
        };
        question = await generateInterviewQuestion(enhancedContext, userResponse, false, userId, interviewId);
      } else {
        question = await generateInterviewQuestion(context, userResponse, false, userId, interviewId);
      }
    }

    const response = {
      question: question,
      category: context.type || 'technical',
      difficulty: context.level || 'mid-level'
    };



    return NextResponse.json(response);

  } catch (error) {
    console.error('=== GENERATE QUESTION API ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('=== END GENERATE QUESTION API ERROR ===');
    
    return NextResponse.json(
      { error: 'Failed to generate question' },
      { status: 500 }
    );
  }
}
