import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    console.log('=== TRANSCRIBE AUDIO API CALL ===');
    console.log('Timestamp:', new Date().toISOString());

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      console.error('No audio file provided');
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log('Audio file received:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type
    });

    // Convert File to Blob
    const audioBlob = new Blob([audioFile], { type: audioFile.type });

    // Transcribe using OpenAI Whisper
    const transcript = await transcribeAudio(audioBlob);

    console.log('=== TRANSCRIBE AUDIO API RESPONSE ===');
    console.log('Transcript:', transcript);

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
