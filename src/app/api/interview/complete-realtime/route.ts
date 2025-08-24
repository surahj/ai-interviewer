import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generatePersonalizedFeedback } from '@/lib/enhanced-feedback';
import { generateInterviewFeedback } from '@/lib/openai';

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

    const {
      sessionId,
      transcript,
      role,
      level,
      type,
      customRequirements,
      duration = 0
    } = requestBody;

    if (!sessionId || !userId || !transcript) {
      console.error('Missing required fields:', { sessionId, userId, transcriptLength: transcript?.length });
      return NextResponse.json(
        { error: 'Session ID, User ID, and transcript are required' },
        { status: 400 }
      );
    }

    // Validate and use the actual role/level from the request, not hardcoded values
    const actualRole = role || 'software-engineer';
    const actualLevel = level || 'mid-level';
    const actualType = type || 'mixed';
    
    // Calculate actual duration from transcript timestamps if available
    let actualDuration = duration;
    if (transcript && transcript.length > 0) {
      const firstMessage = transcript[0];
      const lastMessage = transcript[transcript.length - 1];
      
      if (firstMessage.timestamp && lastMessage.timestamp) {
        const startTime = new Date(firstMessage.timestamp);
        const endTime = new Date(lastMessage.timestamp);
        actualDuration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60); // Convert to minutes
      }
    }

    // Create interview record with actual values
    const interviewData = {
      session_id: sessionId,
      user_id: userId,
      role: actualRole,
      level: actualLevel,
      interview_type: actualType,
      custom_requirements: customRequirements || '',
      duration: actualDuration,
      transcript: transcript,
      status: 'completed',
      completed_at: new Date().toISOString(),
      total_questions: transcript.filter((msg: any) => msg.role === 'assistant').length
    };

    console.log('Creating interview record for user:', userId);

    const { data: interview, error: insertError } = await supabase
      .from('interviews')
      .insert(interviewData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating interview record:', insertError);
      return NextResponse.json(
        { error: 'Failed to create interview record: ' + insertError.message },
        { status: 500 }
      );
    }

    console.log('Interview record created:', interview.id);

    // Generate AI feedback first
    const aiFeedback = await generateInterviewFeedback({
      transcript: transcript,
      role: actualRole,
      level: actualLevel,
      type: actualType,
      customRequirements: customRequirements || ''
    }, userId, interview.id);

    if (!aiFeedback) {
      console.error('Failed to generate AI feedback');
      return NextResponse.json(
        { error: 'Failed to generate AI feedback' },
        { status: 500 }
      );
    }

    // Generate personalized feedback using the AI feedback
    const personalizedFeedback = await generatePersonalizedFeedback({
      ...interview,
      feedback: aiFeedback
    }, userId);

    if (!personalizedFeedback) {
      console.error('Failed to generate personalized feedback');
      return NextResponse.json(
        { error: 'Failed to generate feedback' },
        { status: 500 }
      );
    }

    // Update interview with feedback
    const { error: updateError } = await supabase
      .from('interviews')
      .update({
        feedback: personalizedFeedback
      })
      .eq('id', interview.id);

    if (updateError) {
      console.error('Error updating interview with feedback:', updateError);
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    // Store detailed analytics
    await storeInterviewAnalytics(interview.id, userId, interview, personalizedFeedback);

    // Update user progress tracking
    await updateUserProgress(userId, personalizedFeedback);

    console.log('Interview completed successfully:', interview.id);

    return NextResponse.json({
      success: true,
      interviewId: interview.id,
      sessionId: interview.session_id,
      feedback: personalizedFeedback,
      interview: {
        id: interview.id,
        sessionId: interview.session_id,
        role: interview.role,
        level: interview.level,
        interviewType: interview.interview_type,
        duration: interview.duration,
        feedback: personalizedFeedback,
        status: 'completed',
        completedAt: interview.completed_at
      }
    });

  } catch (error) {
    console.error('Error completing real-time interview:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

async function storeInterviewAnalytics(
  interviewId: string,
  userId: string,
  interview: any,
  feedback: any
) {
  try {
    const analytics = {
      interview_id: interviewId,
      user_id: userId,
      question_analytics: analyzeQuestions(interview.transcript),
      skill_breakdown: feedback.skillBreakdown,
      improvement_areas: feedback.areasForImprovement,
      confidence_trends: analyzeConfidenceTrends(interview.transcript),
      response_patterns: analyzeResponsePatterns(interview.transcript)
    };

    await supabase
      .from('interview_analytics')
      .insert(analytics);

  } catch (error) {
    console.error('Error storing interview analytics:', error);
  }
}

async function updateUserProgress(userId: string, feedback: any) {
  try {
    // Update progress for each skill
    for (const [skillName, skillData] of Object.entries(feedback.skillBreakdown)) {
      const skill = skillData as any;
      
      await supabase
        .from('user_progress_tracking')
        .upsert({
          user_id: userId,
          skill_category: skillName,
          skill_name: skillName,
          score: skill.score,
          interview_count: 1,
          trend_direction: skill.trend,
          last_assessed: new Date().toISOString()
        });
    }

  } catch (error) {
    console.error('Error updating user progress:', error);
  }
}

function analyzeQuestions(transcript: any[]) {
  const questions = transcript.filter(msg => msg.role === 'assistant');
  return {
    total_questions: questions.length,
    question_types: questions.map(q => ({
      content: q.content,
      timestamp: q.timestamp
    }))
  };
}

function analyzeConfidenceTrends(transcript: any[]) {
  const userResponses = transcript.filter(msg => msg.role === 'user');
  return {
    response_count: userResponses.length,
    average_response_length: userResponses.length > 0 ? 
      userResponses.reduce((sum, r) => sum + r.content.length, 0) / userResponses.length : 0
  };
}

function analyzeResponsePatterns(transcript: any[]) {
  const userResponses = transcript.filter(msg => msg.role === 'user');
  return {
    hesitation_indicators: userResponses.filter(r => 
      r.content.toLowerCase().includes('um') || 
      r.content.toLowerCase().includes('uh')
    ).length,
    technical_terms: userResponses.filter(r => 
      r.content.toLowerCase().includes('algorithm') ||
      r.content.toLowerCase().includes('database') ||
      r.content.toLowerCase().includes('api')
    ).length
  };
}
