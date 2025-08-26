import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';
import { analyzeUserResponse } from '@/lib/openai';

interface ResponseAnalysisRequest {
  userResponse: string;
  context: {
    role: string;
    level: string;
    type: string;
    focusArea: string;
    currentQuestion?: string;
    questionNumber?: number;
  };
  interviewId?: string;
}

interface ResponseAnalysis {
  score: number;
  feedback: string;
  keywords: string[];
  confidence: number;
  suggestions: string[];
  category: 'technical' | 'behavioral' | 'problem-solving';
}

// Mock response analysis - in production, this would use AI/ML models
function analyzeResponse(userResponse: string, context: any): ResponseAnalysis {
  const response = userResponse.toLowerCase();
  let score = 50; // Base score
  let feedback = "";
  let keywords: string[] = [];
  const suggestions: string[] = [];
  let category: 'technical' | 'behavioral' | 'problem-solving' = 'behavioral';

  // Extract keywords from response
  const technicalKeywords = [
    'react', 'javascript', 'python', 'java', 'node', 'database', 'api', 'algorithm',
    'data structure', 'framework', 'library', 'testing', 'debugging', 'optimization',
    'performance', 'scalability', 'architecture', 'design pattern', 'git', 'docker',
    'aws', 'cloud', 'frontend', 'backend', 'fullstack', 'mobile', 'web', 'ui', 'ux'
  ];

  const behavioralKeywords = [
    'team', 'collaboration', 'communication', 'leadership', 'mentoring', 'problem',
    'challenge', 'solution', 'experience', 'project', 'deadline', 'pressure',
    'learning', 'growth', 'improvement', 'feedback', 'conflict', 'resolution',
    'initiative', 'responsibility', 'achievement', 'success', 'failure', 'lesson'
  ];

  const problemSolvingKeywords = [
    'design', 'system', 'approach', 'methodology', 'strategy', 'plan', 'implement',
    'solve', 'analyze', 'evaluate', 'optimize', 'improve', 'scale', 'handle',
    'manage', 'coordinate', 'integrate', 'deploy', 'maintain', 'monitor', 'debug'
  ];

  // Check for technical keywords
  const foundTechnicalKeywords = technicalKeywords.filter(keyword => 
    response.includes(keyword)
  );
  
  // Check for behavioral keywords
  const foundBehavioralKeywords = behavioralKeywords.filter(keyword => 
    response.includes(keyword)
  );
  
  // Check for problem-solving keywords
  const foundProblemSolvingKeywords = problemSolvingKeywords.filter(keyword => 
    response.includes(keyword)
  );

  keywords = [...foundTechnicalKeywords, ...foundBehavioralKeywords, ...foundProblemSolvingKeywords];

  // Determine category based on keywords and context
  if (foundTechnicalKeywords.length > foundBehavioralKeywords.length && 
      foundTechnicalKeywords.length > foundProblemSolvingKeywords.length) {
    category = 'technical';
  } else if (foundProblemSolvingKeywords.length > foundBehavioralKeywords.length) {
    category = 'problem-solving';
  }

  // Score based on response length and content
  if (response.length > 100) { score += 10; }
  if (response.length > 200) { score += 10; }
  if (response.length > 300) { score += 5; }

  // Score based on keywords found
  const keywordScore = Math.min(keywords.length * 5, 20);
  score += keywordScore;

  // Score based on response completeness
  if (response.includes('because') || response.includes('since') || response.includes('as')) {
    score += 10; // Shows reasoning
  }

  if (response.includes('example') || response.includes('instance') || response.includes('case')) {
    score += 10; // Shows examples
  }

  if (response.includes('learned') || response.includes('improved') || response.includes('grew')) {
    score += 10; // Shows growth mindset
  }

  // Context-specific scoring
  if (context.type === 'technical' && category === 'technical') {
    score += 15;
  } else if (context.type === 'behavioral' && category === 'behavioral') {
    score += 15;
  } else if (context.type === 'problem-solving' && category === 'problem-solving') {
    score += 15;
  }

  // Generate feedback based on score and content
  if (score >= 80) {
    feedback = "Excellent response! You provided a comprehensive answer with good examples and reasoning.";
  } else if (score >= 60) {
    feedback = "Good response. You covered the main points well. Consider adding more specific examples.";
  } else if (score >= 40) {
    feedback = "Fair response. Try to provide more detail and specific examples to strengthen your answer.";
  } else {
    feedback = "Your response could be more detailed. Consider providing specific examples and explaining your reasoning.";
  }

  // Generate suggestions
  if (response.length < 100) {
    suggestions.push("Provide more detail in your response");
  }
  
  if (keywords.length < 3) {
    suggestions.push("Include more relevant technical or behavioral keywords");
  }
  
  if (!response.includes('example') && !response.includes('instance')) {
    suggestions.push("Add specific examples to support your points");
  }
  
  if (!response.includes('because') && !response.includes('since')) {
    suggestions.push("Explain your reasoning and thought process");
  }

  // Level-specific suggestions
  if (context.level === 'senior' && score < 70) {
    suggestions.push("As a senior-level candidate, provide more strategic and leadership-focused insights");
  }

  if (context.level === 'junior' && score > 80) {
    suggestions.push("Great job! Consider how you can apply this knowledge in a team setting");
  }

  // Cap score at 100
  score = Math.min(score, 100);

  return {
    score,
    feedback,
    keywords,
    confidence: Math.min(score / 100, 0.95),
    suggestions,
    category
  };
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

    const body: ResponseAnalysisRequest = await request.json();
    const { userResponse, context, interviewId } = body;

    // Validate request
    if (!userResponse || !context) {
      return NextResponse.json(
        { error: 'Invalid request: missing userResponse or context' },
        { status: 400 }
      );
    }

    // Clean and analyze the response
    const cleanResponse = userResponse.trim();
    
    if (cleanResponse.length === 0) {
      return NextResponse.json(
        { error: 'Empty response provided' },
        { status: 400 }
      );
    }

    // Analyze the response using OpenAI
    const analysis = await analyzeUserResponse(cleanResponse, context, userId, interviewId);

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('=== ANALYZE RESPONSE API ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('=== END ANALYZE RESPONSE API ERROR ===');
    
    return NextResponse.json(
      { error: 'Failed to analyze response' },
      { status: 500 }
    );
  }
}
