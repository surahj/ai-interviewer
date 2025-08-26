import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreditsService } from '@/lib/credits-service';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Get user from request headers (same pattern as other endpoints)
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

    // Get user's credit balance
    try {
      const credits = await CreditsService.getUserCredits(userId);
      
      if (!credits) {
        // Return 0 credits for new users - they need to complete profile or purchase credits
        return NextResponse.json({
          available_credits: 0,
          total_credits_earned: 0,
          total_credits_used: 0
        });
      }

      return NextResponse.json({
        available_credits: credits.available_credits,
        total_credits_earned: credits.total_credits_earned,
        total_credits_used: credits.total_credits_used
      });
    } catch (error) {
      console.error('Error in getUserCredits:', error);
      // Return 0 credits for new users
      return NextResponse.json({
        available_credits: 0,
        total_credits_earned: 0,
        total_credits_used: 0
      });
    }

  } catch (error) {
    console.error('Error fetching credit balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit balance' },
      { status: 500 }
    );
  }
}
