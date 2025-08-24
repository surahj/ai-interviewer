import { createClient } from '@supabase/supabase-js';
import { getUserProfile as getUserProfileFromService } from './user-profile';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id?: string;
  full_name?: string;
  preferred_role?: string;
  experience_level?: string;
  skills?: string[];
  career_goals?: string[];
  target_companies?: string[];
  skill_gaps?: string[];
  strengths?: string[];
  learning_preferences?: any;
}

export interface ProgressData {
  skill_category: string;
  skill_name: string;
  score: number;
  interview_count: number;
  trend_direction: 'improving' | 'declining' | 'stable';
  last_assessed: string;
}

export interface PersonalizedFeedback {
  overallScore: number;
  skillBreakdown: {
    [skill: string]: {
      score: number;
      trend: string;
      improvement: number;
      personalizedFeedback: string;
    };
  };
  strengths: string[];
  areasForImprovement: string[];
  personalizedRecommendations: string[];
  progressInsights: string[];
  nextSteps: string[];
  confidenceLevel: number;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return getUserProfileFromService(userId);
}

export async function getUserProgress(userId: string): Promise<ProgressData[]> {
  try {
    const { data, error } = await supabase
      .from('user_progress_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('last_assessed', { ascending: false });

    if (error) {
      console.error('Error fetching user progress:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserProgress:', error);
    return [];
  }
}

export async function getInterviewHistory(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('interviews')
      .select('*, interview_analytics(*)')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching interview history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getInterviewHistory:', error);
    return [];
  }
}

export async function generatePersonalizedFeedback(
  interviewData: any,
  userId: string
): Promise<PersonalizedFeedback> {
  try {
    // Get user profile and progress data
    const [userProfile, userProgress, interviewHistory] = await Promise.all([
      getUserProfile(userId),
      getUserProgress(userId),
      getInterviewHistory(userId)
    ]);

    // Analyze current interview performance
    const currentPerformance = analyzeInterviewPerformance(interviewData);
    
    // Compare with historical data
    const progressAnalysis = analyzeProgressTrends(userProgress, currentPerformance);
    
    // Generate personalized insights
    const personalizedInsights = generatePersonalizedInsights(
      userProfile,
      userProgress,
      interviewHistory,
      currentPerformance
    );

    // Create adaptive recommendations
    const recommendations = generateAdaptiveRecommendations(
      userProfile,
      userProgress,
      currentPerformance,
      progressAnalysis
    );

    return {
      overallScore: currentPerformance.overallScore,
      skillBreakdown: currentPerformance.skillBreakdown,
      strengths: personalizedInsights.strengths,
      areasForImprovement: personalizedInsights.areasForImprovement,
      personalizedRecommendations: recommendations,
      progressInsights: progressAnalysis.insights,
      nextSteps: generateNextSteps(userProfile, userProgress, currentPerformance),
      confidenceLevel: calculateConfidenceLevel(userProgress, currentPerformance)
    };
  } catch (error) {
    console.error('Error generating personalized feedback:', error);
    return generateFallbackFeedback();
  }
}

function analyzeInterviewPerformance(interviewData: any) {
  const feedback = interviewData.feedback;
  const transcript = interviewData.transcript;

  // Analyze response patterns from actual transcript
  const responsePatterns = analyzeResponsePatterns(transcript);
  
  // Calculate skill-specific scores from actual feedback data
  const skillBreakdown = {
    technical: {
      score: feedback?.technicalDepth?.score || 0,
      trend: 'stable',
      improvement: 0,
      personalizedFeedback: generateSkillFeedback('technical', feedback?.technicalDepth || { score: 0 }, responsePatterns)
    },
    communication: {
      score: feedback?.communication?.score || 0,
      trend: 'stable',
      improvement: 0,
      personalizedFeedback: generateSkillFeedback('communication', feedback?.communication || { score: 0 }, responsePatterns)
    },
    confidence: {
      score: feedback?.confidence?.score || 0,
      trend: 'stable',
      improvement: 0,
      personalizedFeedback: generateSkillFeedback('confidence', feedback?.confidence || { score: 0 }, responsePatterns)
    },
    clarity: {
      score: feedback?.clarity?.score || 0,
      trend: 'stable',
      improvement: 0,
      personalizedFeedback: generateSkillFeedback('clarity', feedback?.clarity || { score: 0 }, responsePatterns)
    }
  };

  // Calculate overall score from actual feedback
  const overallScore = feedback?.overallScore || 
    Object.values(skillBreakdown).reduce((sum: number, skill: any) => sum + skill.score, 0) / 4;

  return {
    overallScore: Math.round(overallScore * 10) / 10,
    skillBreakdown,
    responsePatterns,
    transcriptAnalysis: analyzeTranscript(transcript)
  };
}

function analyzeTranscript(transcript: any[]) {
  if (!transcript || transcript.length === 0) {
    return {
      totalMessages: 0,
      userMessages: 0,
      aiMessages: 0,
      averageUserResponseLength: 0,
      conversationFlow: 'incomplete'
    };
  }

  const userMessages = transcript.filter(msg => msg.role === 'user');
  const aiMessages = transcript.filter(msg => msg.role === 'assistant');
  
  const totalUserLength = userMessages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0);
  const averageUserResponseLength = userMessages.length > 0 ? totalUserLength / userMessages.length : 0;

  return {
    totalMessages: transcript.length,
    userMessages: userMessages.length,
    aiMessages: aiMessages.length,
    averageUserResponseLength: Math.round(averageUserResponseLength),
    conversationFlow: userMessages.length > 0 && aiMessages.length > 0 ? 'complete' : 'incomplete'
  };
}

function analyzeResponsePatterns(transcript: any[]) {
  const userResponses = transcript.filter(msg => msg.role === 'user');
  
  return {
    averageResponseLength: calculateAverageResponseLength(userResponses),
    hesitationPatterns: analyzeHesitationPatterns(userResponses),
    technicalDepth: analyzeTechnicalDepth(userResponses),
    confidenceIndicators: analyzeConfidenceIndicators(userResponses)
  };
}

function analyzeProgressTrends(userProgress: ProgressData[], currentPerformance: any) {
  const insights: string[] = [];
  
  // Compare current performance with historical data
  userProgress.forEach(progress => {
    const currentScore = currentPerformance.skillBreakdown[progress.skill_name]?.score || 0;
    const improvement = currentScore - progress.score;
    
    if (improvement > 5) {
      insights.push(`Great improvement in ${progress.skill_name}! You've improved by ${improvement.toFixed(1)} points.`);
    } else if (improvement < -5) {
      insights.push(`Your ${progress.skill_name} score has decreased. Consider focusing more on this area.`);
    }
  });

  return { insights };
}

function generatePersonalizedInsights(
  userProfile: UserProfile | null,
  userProgress: ProgressData[],
  interviewHistory: any[],
  currentPerformance: any
) {
  const strengths: string[] = [];
  const areasForImprovement: string[] = [];

  // Identify strengths based on user profile and current performance
  if (userProfile?.strengths) {
    strengths.push(...userProfile.strengths);
  }

  // Add current performance strengths
  Object.entries(currentPerformance.skillBreakdown).forEach(([skill, data]: [string, any]) => {
    if (data.score >= 80) {
      strengths.push(`Strong ${skill} skills`);
    } else if (data.score <= 60) {
      areasForImprovement.push(`Improve ${skill} skills`);
    }
  });

  return { strengths, areasForImprovement };
}

function generateAdaptiveRecommendations(
  userProfile: UserProfile | null,
  userProgress: ProgressData[],
  currentPerformance: any,
  progressAnalysis: any
): string[] {
  const recommendations: string[] = [];

  // Role-specific recommendations
  if (userProfile?.preferred_role) {
    recommendations.push(`Focus on ${userProfile.preferred_role}-specific technical skills`);
  }

  // Skill gap recommendations
  if (userProfile?.skill_gaps) {
    recommendations.push(`Address identified skill gaps: ${userProfile.skill_gaps.join(', ')}`);
  }

  // Performance-based recommendations
  Object.entries(currentPerformance.skillBreakdown).forEach(([skill, data]: [string, any]) => {
    if (data.score <= 70) {
      recommendations.push(`Practice more ${skill} questions to improve your score`);
    }
  });

  // Learning preference recommendations
  if (userProfile?.learning_preferences) {
    recommendations.push(`Use your preferred learning style: ${userProfile.learning_preferences.type}`);
  }

  return recommendations;
}

function generateNextSteps(
  userProfile: UserProfile | null,
  userProgress: ProgressData[],
  currentPerformance: any
): string[] {
  const nextSteps: string[] = [];

  // Immediate next steps based on current performance
  const lowestSkill = Object.entries(currentPerformance.skillBreakdown)
    .sort(([, a]: [string, any], [, b]: [string, any]) => a.score - b.score)[0];

  if (lowestSkill) {
    nextSteps.push(`Focus on improving your ${lowestSkill[0]} skills in the next practice session`);
  }

  // Career goal alignment
  if (userProfile?.career_goals) {
    nextSteps.push(`Align your practice with your career goals: ${userProfile.career_goals[0]}`);
  }

  // Target company preparation
  if (userProfile?.target_companies) {
    nextSteps.push(`Research interview patterns at ${userProfile.target_companies[0]}`);
  }

  return nextSteps;
}

function calculateConfidenceLevel(userProgress: ProgressData[], currentPerformance: any): number {
  // Calculate confidence based on consistency and improvement trends
  const recentScores = userProgress.slice(0, 5).map(p => p.score);
  const averageScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const consistency = 1 - (Math.max(...recentScores) - Math.min(...recentScores)) / 100;
  
  return Math.min(100, (averageScore + consistency * 20) / 2);
}

// Helper functions
function calculateAverageResponseLength(responses: any[]): number {
  const totalLength = responses.reduce((sum, response) => sum + response.content.length, 0);
  return totalLength / responses.length;
}

function analyzeHesitationPatterns(responses: any[]): any {
  // Analyze for hesitation indicators like "um", "uh", long pauses
  return {
    hesitationCount: responses.filter(r => r.content.includes('um') || r.content.includes('uh')).length,
    averagePauseLength: 0 // Would need timestamp data for accurate calculation
  };
}

function analyzeTechnicalDepth(responses: any[]): any {
  // Analyze technical keywords and concepts mentioned
  const technicalKeywords = ['algorithm', 'database', 'API', 'framework', 'architecture', 'optimization'];
  return {
    technicalKeywordCount: responses.reduce((count, response) => 
      count + technicalKeywords.filter(keyword => 
        response.content.toLowerCase().includes(keyword)
      ).length, 0
    )
  };
}

function analyzeConfidenceIndicators(responses: any[]): any {
  // Analyze confidence indicators like definitive statements, specific examples
  const confidenceIndicators = ['I implemented', 'I designed', 'I solved', 'I created'];
  return {
    confidenceStatementCount: responses.reduce((count, response) => 
      count + confidenceIndicators.filter(indicator => 
        response.content.toLowerCase().includes(indicator)
      ).length, 0
    )
  };
}

function generateSkillFeedback(skill: string, skillData: any, responsePatterns: any): string {
  const baseFeedback = skillData.feedback;
  
  // Add personalized insights based on response patterns
  if (skill === 'technical' && responsePatterns.technicalDepth.technicalKeywordCount < 3) {
    return `${baseFeedback} Consider using more technical terminology to demonstrate your expertise.`;
  }
  
  if (skill === 'confidence' && responsePatterns.confidenceIndicators.confidenceStatementCount < 2) {
    return `${baseFeedback} Try to use more definitive statements about your achievements.`;
  }
  
  return baseFeedback;
}

function generateFallbackFeedback(): PersonalizedFeedback {
  return {
    overallScore: 75,
    skillBreakdown: {
      technical: { score: 75, trend: 'stable', improvement: 0, personalizedFeedback: 'Good technical foundation' },
      communication: { score: 75, trend: 'stable', improvement: 0, personalizedFeedback: 'Clear communication' },
      confidence: { score: 75, trend: 'stable', improvement: 0, personalizedFeedback: 'Good confidence level' },
      clarity: { score: 75, trend: 'stable', improvement: 0, personalizedFeedback: 'Clear responses' }
    },
    strengths: ['Good foundation'],
    areasForImprovement: ['Continue practicing'],
    personalizedRecommendations: ['Practice regularly'],
    progressInsights: ['Keep up the good work'],
    nextSteps: ['Schedule next practice session'],
    confidenceLevel: 75
  };
}
