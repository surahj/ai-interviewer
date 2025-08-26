import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';
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

    // Extract user ID from authorization header
    const userId = authHeader.replace('Bearer ', '');

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid authorization header' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { credits = 50, description = "Welcome bonus" } = body;

    // Check if user already has credits initialized
    try {
      const existingCredits = await CreditsService.getUserCredits(userId);
      
      if (existingCredits && existingCredits.available_credits > 0) {
        return NextResponse.json(
          { message: 'Credits already initialized for this user' },
          { status: 200 }
        );
      }
    } catch (error) {
      // User doesn't have credits yet, proceed with initialization
    }

    // Initialize credits for the user
    try {
      await CreditsService.addUserCredits(userId, credits, undefined, description);
      
      return NextResponse.json({
        message: 'Credits initialized successfully',
        credits_added: credits,
        description: description
      });
    } catch (error) {
      console.error('Error initializing credits:', error);
      return NextResponse.json(
        { error: 'Failed to initialize credits' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in credit initialization:', error);
    return NextResponse.json(
      { error: 'Failed to initialize credits' },
      { status: 500 }
    );
  }
}
