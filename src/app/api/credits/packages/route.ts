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
    
    // Allow public access for pricing page
    let userId = null;
    if (authHeader && authHeader !== 'Bearer public') {
      userId = authHeader.replace('Bearer ', '');
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Invalid authorization header' },
          { status: 401 }
        );
      }
    }

    // Get available credit packages
    try {
      const packages = await CreditsService.getCreditPackages();
      
      // Format packages with price in dollars
      const formattedPackages = packages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        credits: pkg.credits,
        price_cents: pkg.price_cents,
        price_dollars: (pkg.price_cents / 100).toFixed(2),
        price_per_credit: (pkg.price_cents / pkg.credits / 100).toFixed(2)
      }));

      return NextResponse.json(formattedPackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      return NextResponse.json([]);
    }

  } catch (error) {
    console.error('Error fetching credit packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit packages' },
      { status: 500 }
    );
  }
}
