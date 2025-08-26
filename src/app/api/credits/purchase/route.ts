import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Use Node.js runtime to avoid Edge Runtime issues with Supabase
export const runtime = 'nodejs';
import { StripeService } from '@/lib/stripe';

export async function POST(request: NextRequest) {
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

    const { packageId } = await request.json();

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      );
    }

    // Get the origin for success/cancel URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const successUrl = `${origin}/credits/success`;
    const cancelUrl = `${origin}/credits/cancel`;

    // Create Stripe checkout session
    const checkoutSession = await StripeService.createCheckoutSession(
      userId,
      packageId,
      successUrl,
      cancelUrl
    );

    return NextResponse.json({
      success: true,
      checkout_url: checkoutSession.url,
      session_id: checkoutSession.id
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
