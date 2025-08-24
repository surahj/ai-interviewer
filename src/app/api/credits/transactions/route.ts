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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get user's transaction history
    try {
      const transactions = await CreditsService.getUserTransactions(userId, limit);
      
      // Format transactions for better readability
      const formattedTransactions = transactions.map(transaction => ({
        id: transaction.id,
        type: transaction.transaction_type,
        credits: transaction.credits,
        description: transaction.description,
        created_at: transaction.created_at,
        package_id: transaction.package_id,
        interview_id: transaction.interview_id
      }));

      return NextResponse.json(formattedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json([]);
    }

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
