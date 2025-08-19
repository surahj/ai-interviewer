import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, level, type, customRequirements } = body;

    console.log('Creating OpenAI Realtime session...');
    console.log('Request body:', { role, level, type, customRequirements });

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
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

    console.log('OpenAI API request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('OpenAI API response status:', response.status);
    console.log('OpenAI API response headers:', Object.fromEntries(response.headers.entries()));

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
    console.log('OpenAI Realtime session created successfully:', data);

    return NextResponse.json({
      sessionId: data.id,
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
