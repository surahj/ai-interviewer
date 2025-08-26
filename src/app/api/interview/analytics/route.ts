import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
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
    const userId = authHeader.replace('Bearer ', '');

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid authorization header' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '4w';

    // Calculate date range based on timeRange parameter
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '1w':
        startDate.setDate(now.getDate() - 7);
        break;
      case '2w':
        startDate.setDate(now.getDate() - 14);
        break;
      case '4w':
        startDate.setDate(now.getDate() - 28);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      default:
        startDate.setDate(now.getDate() - 28);
    }

    // Fetch interviews for the user within the time range
    const { data: interviews, error: interviewsError } = await supabase
      .from('interviews')
      .select(`
        id,
        role,
        level,
        interview_type,
        duration,
        feedback,
        status,
        created_at,
        completed_at
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (interviewsError) {
      console.error('Error fetching interviews:', interviewsError);
      return NextResponse.json(
        { error: 'Failed to fetch interview data' },
        { status: 500 }
      );
    }

    // Calculate analytics
    const completedInterviews = interviews || [];
    const totalInterviews = completedInterviews.length;
    
    // Calculate overall score
    const totalScore = completedInterviews.reduce((sum, interview) => {
      return sum + (interview.feedback?.overallScore || 0);
    }, 0);
    const overallScore = totalInterviews > 0 ? Math.round((totalScore / totalInterviews) * 10) / 10 : 0;

    // Calculate average time
    const totalTime = completedInterviews.reduce((sum, interview) => {
      return sum + (interview.duration || 0);
    }, 0);
    const averageTime = totalInterviews > 0 ? Math.round(totalTime / totalInterviews) : 0;

    // Calculate improvement (compare first half vs second half of interviews)
    let improvement = '+0%';
    if (totalInterviews >= 4) {
      const halfPoint = Math.floor(totalInterviews / 2);
      const firstHalf = completedInterviews.slice(halfPoint);
      const secondHalf = completedInterviews.slice(0, halfPoint);
      
      const firstHalfAvg = firstHalf.reduce((sum, i) => sum + (i.feedback?.overallScore || 0), 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, i) => sum + (i.feedback?.overallScore || 0), 0) / secondHalf.length;
      
      const improvementPercent = Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100);
      improvement = improvementPercent >= 0 ? `+${improvementPercent}%` : `${improvementPercent}%`;
    }

    // Calculate practice streak (consecutive days with interviews)
    let streak = 0;
    const interviewDates = completedInterviews.map(i => new Date(i.created_at).toDateString());
    const uniqueDates = Array.from(new Set(interviewDates)).sort().reverse();
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (currentDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    // Generate skill breakdown
    const skillBreakdown: Record<string, { score: number; trend: string; questions: number }> = {
      technical: { score: 0, trend: '+0%', questions: 0 },
      communication: { score: 0, trend: '+0%', questions: 0 },
      confidence: { score: 0, trend: '+0%', questions: 0 },
      clarity: { score: 0, trend: '+0%', questions: 0 }
    };

    completedInterviews.forEach(interview => {
      if (interview.feedback?.skillBreakdown) {
        Object.keys(skillBreakdown).forEach(skill => {
          if (interview.feedback.skillBreakdown[skill as keyof typeof interview.feedback.skillBreakdown]) {
            skillBreakdown[skill].score += interview.feedback.skillBreakdown[skill as keyof typeof interview.feedback.skillBreakdown].score;
            skillBreakdown[skill].questions += 1;
          }
        });
      }
    });

    // Calculate averages for skills
    Object.keys(skillBreakdown).forEach(skill => {
      if (skillBreakdown[skill].questions > 0) {
        skillBreakdown[skill].score = Math.round((skillBreakdown[skill].score / skillBreakdown[skill].questions) * 10) / 10;
      }
    });

    // Generate category performance
    const categoryPerformance = [
      { category: 'Technical', score: 0, count: 0, trend: '+0%' },
      { category: 'Behavioral', score: 0, count: 0, trend: '+0%' },
      { category: 'Mixed', score: 0, count: 0, trend: '+0%' }
    ];

    completedInterviews.forEach(interview => {
      const category = interview.interview_type === 'technical' ? 'Technical' : 
                      interview.interview_type === 'behavioral' ? 'Behavioral' : 'Mixed';
      const categoryData = categoryPerformance.find(c => c.category === category);
      if (categoryData && interview.feedback?.overallScore) {
        categoryData.score += interview.feedback.overallScore;
        categoryData.count += 1;
      }
    });

    // Calculate averages for categories
    categoryPerformance.forEach(category => {
      if (category.count > 0) {
        category.score = Math.round((category.score / category.count) * 10) / 10;
      }
    });

    // Generate recent trends (last 5 interviews)
    const recentTrends = completedInterviews.slice(0, 5).map(interview => ({
      date: new Date(interview.created_at).toISOString().split('T')[0],
      score: Math.round((interview.feedback?.overallScore || 0) * 10) / 10,
      type: interview.interview_type.charAt(0).toUpperCase() + interview.interview_type.slice(1)
    }));

    // Generate weekly progress
    const weeklyProgress = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekInterviews = completedInterviews.filter(interview => {
        const interviewDate = new Date(interview.created_at);
        return interviewDate >= weekStart && interviewDate <= weekEnd;
      });
      
      const weekScore = weekInterviews.length > 0 ? 
        Math.round((weekInterviews.reduce((sum, i) => sum + (i.feedback?.overallScore || 0), 0) / weekInterviews.length) * 10) / 10 : 0;
      
      weeklyProgress.push({
        week: `Week ${4 - i}`,
        score: weekScore,
        interviews: weekInterviews.length
      });
    }

    return NextResponse.json({
      overallScore,
      totalInterviews,
      averageTime: `${averageTime} min`,
      improvement,
      streak,
      skillBreakdown,
      categoryPerformance,
      recentTrends,
      weeklyProgress
    });

  } catch (error) {
    console.error('Error generating analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
