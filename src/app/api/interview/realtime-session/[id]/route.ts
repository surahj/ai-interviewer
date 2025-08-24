import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    // Get session data from OpenAI
    const response = await fetch(`https://api.openai.com/v1/realtime/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get session data:', errorText);
      return NextResponse.json(
        { error: 'Failed to get session data' },
        { status: 500 }
      );
    }

    const sessionData = await response.json();

    return NextResponse.json({
      session: sessionData
    });

  } catch (error) {
    console.error('Error getting session data:', error);
    return NextResponse.json(
      { error: 'Failed to get session data' },
      { status: 500 }
    );
  }
}
