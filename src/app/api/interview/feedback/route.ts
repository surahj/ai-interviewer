import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Get user from request headers (same pattern as other endpoints)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Extract user ID from authorization header
    // Format: "Bearer {user_id}"
    const userId = authHeader.replace('Bearer ', '');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid authorization header' },
        { status: 401 }
      );
    }

    const requestBody = await request.json();
    const { interviewId } = requestBody;

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    // Fetch interview data from database
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select(`
        id,
        session_id,
        user_id,
        role,
        level,
        interview_type,
        duration,
        custom_requirements,
        transcript,
        feedback,
        status,
        created_at,
        completed_at,
        total_questions
      `)
      .eq('id', interviewId)
      .eq('user_id', userId)
      .single();

    if (interviewError || !interview) {
      console.error('Error fetching interview:', interviewError);
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    const interviewSummary = {
      id: interview.id,
      sessionId: interview.session_id,
      role: interview.role,
      level: interview.level,
      interviewType: interview.interview_type,
      duration: interview.duration,
      focusArea: interview.custom_requirements || 'General',
      customRequirements: interview.custom_requirements,
      totalQuestions: interview.total_questions || 0,
      feedback: interview.feedback || {
        overallScore: 0,
        skillBreakdown: {},
        strengths: [],
        areasForImprovement: [],
        personalizedRecommendations: [],
        progressInsights: [],
        nextSteps: [],
        confidenceLevel: 0
      },
      status: interview.status,
      completedAt: interview.completed_at || interview.created_at,
      transcript: interview.transcript
    };

    return NextResponse.json({
      success: true,
      interview: interviewSummary
    });

  } catch (error) {
    console.error('Error fetching interview feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
