import { NextRequest, NextResponse } from 'next/server';
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
  console.log('=== STARTING RESPONSE ANALYSIS ===');
  console.log('Input Response:', userResponse);
  console.log('Context:', context);
  
  const response = userResponse.toLowerCase();
  let score = 50; // Base score
  let feedback = "";
  let keywords: string[] = [];
  let suggestions: string[] = [];
  let category: 'technical' | 'behavioral' | 'problem-solving' = 'behavioral';
  
  console.log('Initial Score:', score);

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

  console.log('Keyword Analysis:', {
    technicalKeywords: foundTechnicalKeywords,
    behavioralKeywords: foundBehavioralKeywords,
    problemSolvingKeywords: foundProblemSolvingKeywords,
    totalKeywords: keywords.length
  });

  // Determine category based on keywords and context
  if (foundTechnicalKeywords.length > foundBehavioralKeywords.length && 
      foundTechnicalKeywords.length > foundProblemSolvingKeywords.length) {
    category = 'technical';
  } else if (foundProblemSolvingKeywords.length > foundBehavioralKeywords.length) {
    category = 'problem-solving';
  }
  
  console.log('Determined Category:', category);

  // Score based on response length and content
  console.log('Scoring - Response Length:', response.length);
  if (response.length > 100) { score += 10; console.log('+10 points for length > 100'); }
  if (response.length > 200) { score += 10; console.log('+10 points for length > 200'); }
  if (response.length > 300) { score += 5; console.log('+5 points for length > 300'); }

  // Score based on keywords found
  const keywordScore = Math.min(keywords.length * 5, 20);
  score += keywordScore;
  console.log(`+${keywordScore} points for ${keywords.length} keywords found`);

  // Score based on response completeness
  if (response.includes('because') || response.includes('since') || response.includes('as')) {
    score += 10; // Shows reasoning
    console.log('+10 points for reasoning (because/since/as)');
  }

  if (response.includes('example') || response.includes('instance') || response.includes('case')) {
    score += 10; // Shows examples
    console.log('+10 points for examples');
  }

  if (response.includes('learned') || response.includes('improved') || response.includes('grew')) {
    score += 10; // Shows growth mindset
    console.log('+10 points for growth mindset');
  }

  // Context-specific scoring
  if (context.type === 'technical' && category === 'technical') {
    score += 15;
    console.log('+15 points for technical context match');
  } else if (context.type === 'behavioral' && category === 'behavioral') {
    score += 15;
    console.log('+15 points for behavioral context match');
  } else if (context.type === 'problem-solving' && category === 'problem-solving') {
    score += 15;
    console.log('+15 points for problem-solving context match');
  }
  
  console.log('Score after all calculations:', score);

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
  
  console.log('Final Score (capped at 100):', score);
  console.log('Generated Feedback:', feedback);
  console.log('Generated Suggestions:', suggestions);
  console.log('=== ENDING RESPONSE ANALYSIS ===');

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
    const body: ResponseAnalysisRequest = await request.json();
    const { userResponse, context } = body;

    console.log('=== ANALYZE RESPONSE API CALL ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Request Body:', JSON.stringify(body, null, 2));
    console.log('Context Details:', {
      role: context.role,
      level: context.level,
      type: context.type,
      focusArea: context.focusArea,
      currentQuestion: context.currentQuestion,
      questionNumber: context.questionNumber
    });
    console.log('User Response Length:', userResponse.length);
    console.log('User Response Preview:', userResponse.substring(0, 100) + (userResponse.length > 100 ? '...' : ''));

    // Validate request
    if (!userResponse || !context) {
      console.log('=== VALIDATION ERROR ===');
      console.log('Missing userResponse or context in request');
      return NextResponse.json(
        { error: 'Invalid request: missing userResponse or context' },
        { status: 400 }
      );
    }

    // Clean and analyze the response
    const cleanResponse = userResponse.trim();
    console.log('Cleaned Response Length:', cleanResponse.length);
    
    if (cleanResponse.length === 0) {
      console.log('=== VALIDATION ERROR ===');
      console.log('Empty response provided after cleaning');
      return NextResponse.json(
        { error: 'Empty response provided' },
        { status: 400 }
      );
    }

    // Analyze the response using OpenAI
    console.log('Starting OpenAI response analysis...');
    const analysis = await analyzeUserResponse(cleanResponse, context);

    console.log('=== ANALYZE RESPONSE API RESPONSE ===');
    console.log('Analysis Results:', {
      score: analysis.score,
      category: analysis.category,
      confidence: analysis.confidence,
      keywordsFound: analysis.keywords.length,
      suggestionsCount: analysis.suggestions.length
    });
    console.log('Full Analysis Object:', JSON.stringify(analysis, null, 2));
    console.log('=== END ANALYZE RESPONSE API ===');

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
