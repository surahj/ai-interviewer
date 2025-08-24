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

    // Get credit statistics
    try {
      const stats = await CreditsService.getCreditStats(userId);
      
      return NextResponse.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      return NextResponse.json({
        totalEarned: 50,
        totalUsed: 0,
        available: 50,
        averagePerInterview: 0
      });
    }

  } catch (error) {
    console.error('Error fetching credit stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit stats' },
      { status: 500 }
    );
  }
}
