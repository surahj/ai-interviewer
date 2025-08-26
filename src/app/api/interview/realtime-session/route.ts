import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreditsService } from '@/lib/credits-service';
import { v4 as uuidv4 } from 'uuid';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    const body = await request.json();
    const { role, level, type, customRequirements, duration = 30 } = body;

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Calculate required credits based on interview duration
    const requiredCredits = Math.max(5, Math.min(50, Math.ceil(parseInt(duration) / 3)));
    
    // Check if user has enough credits
    const hasEnoughCredits = await CreditsService.checkUserCredits(userId, requiredCredits);
    if (!hasEnoughCredits) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${requiredCredits} credits to start this interview. Please purchase more credits.` },
        { status: 402 }
      );
    }

    // Generate a unique session ID
    const sessionId = uuidv4();
    
    // Deduct credits before creating OpenAI Realtime session
    const creditsDeducted = await CreditsService.deductOpenAICredits(userId, sessionId, 0); // Will deduct based on actual usage
    if (!creditsDeducted) {
      return NextResponse.json(
        { error: 'Failed to deduct credits. Please try again.' },
        { status: 500 }
      );
    }

    // Create OpenAI Realtime session
    const requestBody = {
      model: 'gpt-4o-realtime-preview',
      voice: 'alloy',
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      tools: [],
      instructions: `You are an expert technical interviewer conducting a ${type} interview for a ${level} ${role} position. 

Your role is to:
- Start the conversation immediately with a warm greeting and introduction
- Conduct a natural, conversational interview
- Ask relevant questions based on the role (${role}) and level (${level})
- Listen carefully to the candidate's responses
- Ask follow-up questions to explore their experience and skills
- Keep the conversation flowing naturally
- Be professional, friendly, and encouraging

Focus on:
- Technical skills relevant to ${role}
- Problem-solving abilities
- Communication skills
- Experience level appropriate for ${level} position
${customRequirements ? `- Specific requirements: ${customRequirements}` : ''}

IMPORTANT: 
- This is a real-time voice conversation. Speak naturally and conversationally in English.
- Do not mention that you are an AI - act as a human interviewer.
- Start the conversation immediately when the connection is established.
- Ask one question at a time and wait for the candidate's response.
- Speak clearly and at a normal pace.`
    };

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      console.error('OpenAI API error status:', response.status);
      
      return NextResponse.json(
        { 
          error: 'Failed to create realtime session',
          details: errorText,
          status: response.status
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      sessionId: sessionId, // Use our generated session ID
      openaiSessionId: data.id, // OpenAI's session ID
      session: data,
      interviewConfig: { role, level, type, customRequirements }
    });

  } catch (error) {
    console.error('Error in realtime-session API route:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
