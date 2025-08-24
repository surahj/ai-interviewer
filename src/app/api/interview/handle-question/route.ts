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
    const body: QuestionRequest = await request.json();
    const { userQuestion, context } = body;

    // Handle the user question using OpenAI
    const answer = await handleUserQuestion(userQuestion, context);

    const response = {
      answer: answer,
      category: 'clarification',
      type: 'response'
    };

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
