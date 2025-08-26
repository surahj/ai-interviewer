import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';
import { transcribeAudio } from '@/lib/openai';
import { createClient } from '@supabase/supabase-js';
import { CreditsService } from '@/lib/credits-service';

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

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      console.error('No audio file provided');
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }


    // Convert File to Blob
    const audioBlob = new Blob([audioFile], { type: audioFile.type });

    // Deduct credits before transcribing
    const creditsDeducted = await CreditsService.deductOpenAICredits(userId, 'transcribe', 50); // Estimate tokens for transcription
    if (!creditsDeducted) {
      return NextResponse.json(
        { error: 'Insufficient credits to transcribe audio. Please purchase more credits.' },
        { status: 402 }
      );
    }

    // Transcribe using OpenAI Whisper
    const transcript = await transcribeAudio(audioBlob, userId, 'transcribe');

    return NextResponse.json({ transcript });

  } catch (error) {
    console.error('=== TRANSCRIBE AUDIO API ERROR ===');
    console.error('Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
