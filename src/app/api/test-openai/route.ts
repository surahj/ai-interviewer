import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing OpenAI API key...');
    
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Test with a simple API call to verify the key works
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('OpenAI models API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API test failed:', errorText);
      return NextResponse.json(
        { 
          error: 'OpenAI API key test failed',
          details: errorText,
          status: response.status
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('OpenAI API test successful');
    
    // Check if realtime models are available
    const hasRealtimeModel = data.data?.some((model: any) => 
      model.id === 'gpt-4o-realtime'
    );

    return NextResponse.json({
      success: true,
      message: 'OpenAI API key is working',
      hasRealtimeModel,
      availableModels: data.data?.length || 0
    });

  } catch (error) {
    console.error('Error testing OpenAI API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test OpenAI API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
