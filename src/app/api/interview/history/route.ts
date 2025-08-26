import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Get user from request headers
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
    
    // Fetch interviews for the specific user
    const { data: interviews, error } = await supabase
      .from('interviews')
      .select(`
        id,
        user_id,
        role,
        level,
        interview_type,
        duration,
        feedback,
        status,
        created_at,
        completed_at,
        custom_requirements
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch interview history' },
        { status: 500 }
      );
    }



    // Transform the data to match the expected format
    const transformedInterviews = interviews?.map(interview => ({
      id: interview.id,
      user_id: interview.user_id,
      role: interview.role,
      level: interview.level,
      interview_type: interview.interview_type,
      duration: interview.duration,
      feedback: interview.feedback,
      status: interview.status,
      created_at: interview.created_at,
      completed_at: interview.completed_at,
      custom_requirements: interview.custom_requirements
    })) || [];

    return NextResponse.json({
      interviews: transformedInterviews,
      total: transformedInterviews.length
    });

  } catch (error) {
    console.error('Error fetching interview history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
