import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export interface StripeCheckoutSession {
  id: string;
  url: string;
}

export class StripeService {
  // Create a checkout session for credit purchase
  static async createCheckoutSession(
    userId: string,
    packageId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<StripeCheckoutSession> {
    try {
      // Get package details from database
      const { data: packageData, error: packageError } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('id', packageId)
        .eq('is_active', true)
        .single();

      if (packageError || !packageData) {
        throw new Error('Invalid credit package');
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: packageData.name,
                description: packageData.description || `Purchase ${packageData.credits} credits`,
              },
              unit_amount: packageData.price_cents, // Stripe expects amount in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          packageId,
          credits: packageData.credits.toString(),
          packageName: packageData.name,
        },
        customer_email: await this.getUserEmail(userId),
      });

      // Store pending transaction in database
      await this.createPendingTransaction(userId, packageId, session.id);

      return {
        id: session.id,
        url: session.url!,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Handle successful payment webhook
  static async handlePaymentSuccess(sessionId: string): Promise<void> {
    try {
      // Retrieve the session to get metadata
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status !== 'paid') {
        throw new Error('Payment not completed');
      }

      const { userId, packageId, credits } = session.metadata!;

      // Get package details
      const { data: packageData, error: packageError } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (packageError || !packageData) {
        throw new Error('Invalid credit package');
      }

      // First find the pending transaction
      const { data: transactions, error: findError } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('transaction_type', 'purchase_pending')
        .contains('metadata', { stripe_session_id: sessionId });

      if (findError) {
        console.error('Error finding pending transaction:', findError);
        throw findError;
      }

      if (!transactions || transactions.length === 0) {
        console.log(`No pending transaction found for session: ${sessionId}`);
        throw new Error('No pending transaction found');
      }

      // Get current user credits
      const { data: currentCredits, error: getCreditsError } = await supabase
        .from('user_credits')
        .select('available_credits, total_credits_earned')
        .eq('user_id', userId)
        .single();

      if (getCreditsError) {
        console.error('Error getting current credits:', getCreditsError);
        throw getCreditsError;
      }

      // Update user credits
      const { error: updateCreditsError } = await supabase
        .from('user_credits')
        .update({
          available_credits: (currentCredits?.available_credits || 0) + parseInt(credits),
          total_credits_earned: (currentCredits?.total_credits_earned || 0) + parseInt(credits),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateCreditsError) {
        console.error('Error updating user credits:', updateCreditsError);
        throw updateCreditsError;
      }

      // Update the pending transaction with actual credits
      const { error: updateTransactionError } = await supabase
        .from('credit_transactions')
        .update({
          transaction_type: 'purchase',
          credits: parseInt(credits),
          description: `Purchased ${packageData.name} via Stripe`,
          metadata: {
            stripe_session_id: sessionId,
            status: 'completed'
          }
        })
        .eq('id', transactions[0].id);

      if (updateTransactionError) {
        console.error('Error updating transaction:', updateTransactionError);
        throw updateTransactionError;
      }

      console.log(`Successfully added ${credits} credits to user ${userId} and updated transaction ${transactions[0].id}`);
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  // Get user email for Stripe customer
  static async getUserEmail(userId: string): Promise<string | undefined> {
    try {
      const { data: user, error } = await supabase.auth.admin.getUserById(userId);
      if (error || !user.user) {
        return undefined;
      }
      return user.user.email || undefined;
    } catch (error) {
      console.error('Error getting user email:', error);
      return undefined;
    }
  }

  // Create pending transaction record
  static async createPendingTransaction(
    userId: string,
    packageId: string,
    sessionId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'purchase_pending',
          credits: 0, // Will be updated when payment is confirmed
          description: 'Credit purchase pending payment',
          package_id: packageId,
          metadata: {
            stripe_session_id: sessionId,
            status: 'pending'
          }
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error creating pending transaction:', error);
      throw error;
    }
  }

  // Update transaction status
  static async updateTransactionStatus(
    sessionId: string,
    status: 'completed' | 'failed' | 'cancelled'
  ): Promise<void> {
    try {
      // First find the transaction by session ID
      const { data: transactions, error: findError } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('transaction_type', 'purchase_pending')
        .contains('metadata', { stripe_session_id: sessionId });

      if (findError) {
        console.error('Error finding transaction:', findError);
        return;
      }

      if (!transactions || transactions.length === 0) {
        console.log(`No pending transaction found for session: ${sessionId}`);
        return;
      }

      // Update the transaction
      const { error: updateError } = await supabase
        .from('credit_transactions')
        .update({
          transaction_type: status === 'completed' ? 'purchase' : 'purchase_failed',
          description: status === 'completed' 
            ? 'Credit purchase completed' 
            : `Credit purchase ${status}`,
          metadata: {
            stripe_session_id: sessionId,
            status: status
          }
        })
        .eq('id', transactions[0].id);

      if (updateError) {
        throw updateError;
      }

      console.log(`Updated transaction ${transactions[0].id} to status: ${status}`);
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  // Verify webhook signature
  static verifyWebhookSignature(
    payload: string,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw error;
    }
  }

  // Get checkout session details
  static async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
    try {
      return await stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      console.error('Error retrieving checkout session:', error);
      return null;
    }
  }
}
