import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateInterviewFeedback } from '@/lib/openai';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface FeedbackRequest {
  sessionId: string;
  transcript: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  role: string;
  level: string;
  type: string;
  focusArea: string;
  customRequirements?: string;
  userId?: string; // Add user ID for realtime interviews
}

interface FeedbackResponse {
  sessionId: string;
  feedback: {
    overallScore: number;
    communication: {
      score: number;
      feedback: string;
      suggestions: string[];
    };
    technicalDepth: {
      score: number;
      feedback: string;
      suggestions: string[];
    };
    confidence: {
      score: number;
      feedback: string;
      suggestions: string[];
    };
    clarity: {
      score: number;
      feedback: string;
      suggestions: string[];
    };
    strengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
  };
  summary: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();
    const { sessionId, transcript, role, level, type, focusArea, customRequirements, userId } = body;

    console.log('=== GENERATE INTERVIEW FEEDBACK ===');
    console.log('Session ID:', sessionId);
    console.log('Transcript length:', transcript.length);
    console.log('Role:', role);
    console.log('Level:', level);

    // Validate request
    if (!sessionId || !transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: 'Session ID and transcript are required' },
        { status: 400 }
      );
    }

    // Generate feedback using OpenAI
    const feedback = await generateInterviewFeedback({
      transcript,
      role,
      level,
      type,
      customRequirements
    });

    // Check if sessionId is a UUID (standard interview) or OpenAI session ID (realtime)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
    
    let feedbackData;
    let feedbackError;

    if (isUUID) {
      // Standard interview - update existing record
      const result = await supabase
        .from('interviews')
        .update({
          transcript: transcript,
          feedback: feedback,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();
      
      feedbackData = result.data;
      feedbackError = result.error;
    } else {
      // Realtime interview - create new record
      const result = await supabase
        .from('interviews')
        .insert({
          id: crypto.randomUUID(), // Generate new UUID for database
          user_id: userId, // Add user ID for proper filtering
          openai_session_id: sessionId, // Store OpenAI session ID separately
          transcript: transcript,
          feedback: feedback,
          status: 'completed',
          role: role,
          level: level,
          interview_type: type,
          custom_requirements: customRequirements,
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .select()
        .single();
      
      feedbackData = result.data;
      feedbackError = result.error;
    }

    if (feedbackError) {
      console.error('Database error:', feedbackError);
      return NextResponse.json(
        { error: 'Failed to store feedback' },
        { status: 500 }
      );
    }

    const response: FeedbackResponse = {
      sessionId: feedbackData?.id || sessionId, // Return database ID for realtime interviews
      feedback,
      summary: `Interview completed for ${role} ${level} position. Overall score: ${feedback.overallScore}/100.`
    };

    console.log('=== FEEDBACK GENERATED ===');
    console.log('Overall Score:', feedback.overallScore);
    console.log('Strengths count:', feedback.strengths.length);
    console.log('Areas for improvement count:', feedback.areasForImprovement.length);

    return NextResponse.json(response);

  } catch (error) {
    console.error('=== FEEDBACK GENERATION ERROR ===');
    console.error('Error details:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve feedback from database
    const { data: interview, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    if (!interview.feedback) {
      return NextResponse.json(
        { error: 'Feedback not yet generated' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sessionId: interview.id,
      role: interview.role,
      level: interview.level,
      candidateName: interview.candidate_name,
      interviewType: interview.interview_type,
      duration: interview.duration,
      focusArea: interview.focus_area,
      customRequirements: interview.custom_requirements,
      totalQuestions: interview.total_questions,
      feedback: interview.feedback,
      status: interview.status,
      completedAt: interview.completed_at
    });

  } catch (error) {
    console.error('Feedback retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve feedback' },
      { status: 500 }
    );
  }
}
