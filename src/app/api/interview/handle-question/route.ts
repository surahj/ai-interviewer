import { NextRequest, NextResponse } from 'next/server';
import { handleUserQuestion } from '@/lib/openai';

interface QuestionRequest {
  userQuestion: string;
  context: {
    role: string;
    level: string;
    type: string;
    focusArea: string;
    customRequirements?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== HANDLE USER QUESTION API CALL ===');
    console.log('Timestamp:', new Date().toISOString());

    const body: QuestionRequest = await request.json();
    const { userQuestion, context } = body;

    console.log('Request Body:', JSON.stringify(body, null, 2));
    console.log('User Question:', userQuestion);
    console.log('Context:', context);

    // Handle the user question using OpenAI
    const answer = await handleUserQuestion(userQuestion, context);

    console.log('=== HANDLE USER QUESTION API RESPONSE ===');
    console.log('Answer:', answer);

    const response = {
      answer: answer,
      category: 'clarification',
      type: 'response'
    };

    console.log('Response Object:', JSON.stringify(response, null, 2));
    console.log('=== END HANDLE USER QUESTION API ===');

    return NextResponse.json(response);

  } catch (error) {
    console.error('=== HANDLE USER QUESTION API ERROR ===');
    console.error('Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to handle user question' },
      { status: 500 }
    );
  }
}
