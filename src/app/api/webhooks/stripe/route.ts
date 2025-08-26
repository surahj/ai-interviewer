import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { StripeService } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const event = StripeService.verifyWebhookSignature(body, signature, webhookSecret);

    console.log('Webhook event:', {
      id: event.id,
      type: event.type,
      object: event.object
    });

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as any;
        
        console.log('Processing checkout.session.completed:', {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          amount: session.amount_total
        });
        
        // Only process if payment is successful
        if (session.payment_status === 'paid') {
          try {
            await StripeService.handlePaymentSuccess(session.id);
            console.log('Successfully processed payment for session:', session.id);
          } catch (error) {
            console.error('Error processing payment success:', error);
            // Don't return error to Stripe, just log it
          }
        } else {
          console.log('Payment not completed, status:', session.payment_status);
        }
        break;

      case 'checkout.session.expired':
        const expiredSession = event.data.object as any;
        console.log('Checkout session expired:', expiredSession.id);
        // TODO: Update transaction status to cancelled
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as any;
        console.log('Payment failed:', failedPayment.id);
        // TODO: Update transaction status to failed
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }
}
