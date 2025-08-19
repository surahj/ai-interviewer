import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple ping response
    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Connection successful' 
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Connection failed' 
      },
      { status: 500 }
    );
  }
}
