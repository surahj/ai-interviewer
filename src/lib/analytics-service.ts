import { createClient } from '@supabase/supabase-js';
import { getUserProfile, getUserProgress, getInterviewHistory } from './enhanced-feedback';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AnalyticsData {
  overallMetrics: {
    totalInterviews: number;
    averageScore: number;
    improvementRate: number;
    currentStreak: number;
    totalPracticeTime: number;
  };
  skillBreakdown: {
    [skill: string]: {
      currentScore: number;
      trend: string;
      improvement: number;
      practiceCount: number;
      targetScore: number;
    };
  };
  progressTrends: {
    weekly: Array<{
      week: string;
      score: number;
      interviews: number;
      skills: { [skill: string]: number };
    }>;
    monthly: Array<{
      month: string;
      score: number;
      interviews: number;
      skills: { [skill: string]: number };
    }>;
  };
  performanceInsights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    nextMilestones: string[];
  };
  interviewHistory: Array<{
    id: string;
    date: string;
    score: number;
    type: string;
    duration: number;
    skills: string[];
  }>;
}

export async function getAnalyticsData(userId: string): Promise<AnalyticsData> {
  try {
    const [userProfile, userProgress, interviewHistory] = await Promise.all([
      getUserProfile(userId),
      getUserProgress(userId),
      getInterviewHistory(userId)
    ]);

    const overallMetrics = calculateOverallMetrics(interviewHistory);
    const skillBreakdown = calculateSkillBreakdown(userProgress, interviewHistory);
    const progressTrends = calculateProgressTrends(interviewHistory);
    const performanceInsights = generatePerformanceInsights(userProfile, userProgress, interviewHistory);

    return {
      overallMetrics,
      skillBreakdown,
      progressTrends,
      performanceInsights,
      interviewHistory: formatInterviewHistory(interviewHistory)
    };
  } catch (error) {
    console.error('Error getting analytics data:', error);
    return getDefaultAnalyticsData();
  }
}

function calculateOverallMetrics(interviewHistory: any[]) {
  const totalInterviews = interviewHistory.length;
  const averageScore = totalInterviews > 0 
    ? interviewHistory.reduce((sum, interview) => sum + (interview.feedback?.overallScore || 0), 0) / totalInterviews
    : 0;
  
  const improvementRate = calculateImprovementRate(interviewHistory);
  const currentStreak = calculateCurrentStreak(interviewHistory);
  const totalPracticeTime = interviewHistory.reduce((sum, interview) => sum + (interview.duration || 0), 0);

  return {
    totalInterviews,
    averageScore: Math.round(averageScore * 10) / 10,
    improvementRate,
    currentStreak,
    totalPracticeTime
  };
}

function calculateSkillBreakdown(userProgress: any[], interviewHistory: any[]) {
  const skillBreakdown: { [skill: string]: any } = {};

  // Initialize with user progress data
  userProgress.forEach(progress => {
    skillBreakdown[progress.skill_name] = {
      currentScore: progress.score,
      trend: progress.trend_direction,
      improvement: 0,
      practiceCount: progress.interview_count,
      targetScore: progress.score + 10 // Default target
    };
  });

  // Update with recent interview data
  const recentInterviews = interviewHistory.slice(0, 5);
  recentInterviews.forEach(interview => {
    if (interview.feedback?.skillBreakdown) {
      Object.entries(interview.feedback.skillBreakdown).forEach(([skill, data]: [string, any]) => {
        if (!skillBreakdown[skill]) {
          skillBreakdown[skill] = {
            currentScore: data.score,
            trend: 'stable',
            improvement: 0,
            practiceCount: 1,
            targetScore: data.score + 10
          };
        } else {
          const improvement = data.score - skillBreakdown[skill].currentScore;
          skillBreakdown[skill].improvement = improvement;
          skillBreakdown[skill].currentScore = data.score;
          skillBreakdown[skill].practiceCount++;
        }
      });
    }
  });

  return skillBreakdown;
}

function calculateProgressTrends(interviewHistory: any[]) {
  const weeklyData = groupByWeek(interviewHistory);
  const monthlyData = groupByMonth(interviewHistory);

  return {
    weekly: weeklyData,
    monthly: monthlyData
  };
}

function groupByWeek(interviewHistory: any[]) {
  const weeklyGroups: { [week: string]: any[] } = {};
  
  interviewHistory.forEach(interview => {
    const date = new Date(interview.created_at);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyGroups[weekKey]) {
      weeklyGroups[weekKey] = [];
    }
    weeklyGroups[weekKey].push(interview);
  });

  return Object.entries(weeklyGroups).map(([week, interviews]) => ({
    week,
    score: calculateAverageScore(interviews),
    interviews: interviews.length,
    skills: calculateSkillScores(interviews)
  }));
}

function groupByMonth(interviewHistory: any[]) {
  const monthlyGroups: { [month: string]: any[] } = {};
  
  interviewHistory.forEach(interview => {
    const date = new Date(interview.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyGroups[monthKey]) {
      monthlyGroups[monthKey] = [];
    }
    monthlyGroups[monthKey].push(interview);
  });

  return Object.entries(monthlyGroups).map(([month, interviews]) => ({
    month,
    score: calculateAverageScore(interviews),
    interviews: interviews.length,
    skills: calculateSkillScores(interviews)
  }));
}

function calculateSkillScores(interviews: any[]) {
  const skillScores: { [skill: string]: number } = {};
  
  interviews.forEach(interview => {
    if (interview.feedback?.skillBreakdown) {
      Object.entries(interview.feedback.skillBreakdown).forEach(([skill, data]: [string, any]) => {
        if (!skillScores[skill]) {
          skillScores[skill] = [];
        }
        skillScores[skill].push(data.score);
      });
    }
  });

  // Calculate average scores for each skill
  Object.keys(skillScores).forEach(skill => {
    const scores = skillScores[skill];
    skillScores[skill] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  });

  return skillScores;
}

function generatePerformanceInsights(userProfile: any, userProgress: any[], interviewHistory: any[]) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  const nextMilestones: string[] = [];

  // Analyze strengths and weaknesses
  userProgress.forEach(progress => {
    if (progress.score >= 80) {
      strengths.push(`${progress.skill_name} (${progress.score}/100)`);
    } else if (progress.score <= 60) {
      weaknesses.push(`${progress.skill_name} (${progress.score}/100)`);
    }
  });

  // Generate recommendations
  if (weaknesses.length > 0) {
    recommendations.push(`Focus on improving: ${weaknesses.slice(0, 2).join(', ')}`);
  }
  
  if (userProfile?.skill_gaps) {
    recommendations.push(`Address skill gaps: ${userProfile.skill_gaps.slice(0, 2).join(', ')}`);
  }

  // Generate next milestones
  const totalInterviews = interviewHistory.length;
  if (totalInterviews < 5) {
    nextMilestones.push('Complete 5 practice interviews');
  } else if (totalInterviews < 10) {
    nextMilestones.push('Complete 10 practice interviews');
  }

  const averageScore = interviewHistory.reduce((sum, interview) => 
    sum + (interview.feedback?.overallScore || 0), 0) / totalInterviews;
  
  if (averageScore < 80) {
    nextMilestones.push('Achieve average score of 80+');
  }

  return {
    strengths,
    weaknesses,
    recommendations,
    nextMilestones
  };
}

function formatInterviewHistory(interviewHistory: any[]) {
  return interviewHistory.map(interview => ({
    id: interview.id,
    date: new Date(interview.created_at).toLocaleDateString(),
    score: interview.feedback?.overallScore || 0,
    type: interview.interview_type,
    duration: interview.duration,
    skills: Object.keys(interview.feedback?.skillBreakdown || {})
  }));
}

// Helper functions
function calculateImprovementRate(interviewHistory: any[]): number {
  if (interviewHistory.length < 2) return 0;
  
  const recentScores = interviewHistory.slice(0, 5).map(i => i.feedback?.overallScore || 0);
  const olderScores = interviewHistory.slice(-5).map(i => i.feedback?.overallScore || 0);
  
  const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
  
  return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
}

function calculateCurrentStreak(interviewHistory: any[]): number {
  if (interviewHistory.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < interviewHistory.length; i++) {
    const interviewDate = new Date(interviewHistory[i].created_at);
    const daysDiff = Math.floor((today.getTime() - interviewDate.getTime()) / oneDay);
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateAverageScore(interviews: any[]): number {
  if (interviews.length === 0) return 0;
  return Math.round(interviews.reduce((sum, interview) => 
    sum + (interview.feedback?.overallScore || 0), 0) / interviews.length);
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getDefaultAnalyticsData(): AnalyticsData {
  return {
    overallMetrics: {
      totalInterviews: 0,
      averageScore: 0,
      improvementRate: 0,
      currentStreak: 0,
      totalPracticeTime: 0
    },
    skillBreakdown: {},
    progressTrends: {
      weekly: [],
      monthly: []
    },
    performanceInsights: {
      strengths: [],
      weaknesses: [],
      recommendations: ['Start your first practice interview'],
      nextMilestones: ['Complete your first interview']
    },
    interviewHistory: []
  };
}
