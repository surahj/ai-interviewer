import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestion, InterviewContext } from '@/lib/openai';

interface QuestionRequest {
  context: InterviewContext & {
    previousQuestions?: string[];
    avoidSimilar?: boolean;
  };
  userResponse?: string;
  isFirstQuestion: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: QuestionRequest = await request.json();
    const { context, userResponse, isFirstQuestion } = body;

    console.log('=== GENERATE QUESTION API CALL ===');
    console.log('Context:', {
      role: context.role,
      level: context.level,
      type: context.type,
      currentQuestionNumber: context.currentQuestionNumber,
      totalQuestions: context.totalQuestions,
      conversationHistoryLength: context.conversationHistory?.length || 0,
      customRequirements: context.customRequirements
    });
    console.log('User Response:', userResponse);
    console.log('Is First Question:', isFirstQuestion);

    // Validate request
    if (!context || !context.role) {
      console.log('=== VALIDATION ERROR ===');
      console.log('Missing context or role in request');
      return NextResponse.json(
        { error: 'Invalid request: missing context or role' },
        { status: 400 }
      );
    }

    // Generate question using OpenAI
    let question: string;
    
    if (isFirstQuestion) {
      console.log('Generating first question with OpenAI...');
      question = await generateInterviewQuestion(context, undefined, true);
    } else {
      console.log('Generating follow-up question with OpenAI...');
      
      // If we need to avoid similar questions, add that context
      if (context.avoidSimilar && context.previousQuestions) {
        console.log('Avoiding similar questions. Previous questions:', context.previousQuestions.length);
        const enhancedContext = {
          ...context,
          avoidSimilarQuestions: context.previousQuestions
        };
        question = await generateInterviewQuestion(enhancedContext, userResponse, false);
      } else {
        question = await generateInterviewQuestion(context, userResponse, false);
      }
    }

    console.log('OpenAI Generated Question:', question);

    const response = {
      question: question,
      category: context.type || 'technical',
      difficulty: context.level || 'mid-level'
    };

    console.log('=== GENERATE QUESTION API RESPONSE ===');
    console.log('Final Question:', question);
    console.log('Response Object:', JSON.stringify(response, null, 2));
    console.log('=== END GENERATE QUESTION API ===');

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
