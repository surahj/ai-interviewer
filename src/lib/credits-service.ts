import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

type Json = Database['public']['Tables']['credit_transactions']['Row']['metadata'];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

export interface CreditPackage {
  id: string;
  name: string;
  description: string | null;
  credits: number;
  price_cents: number;
  is_active: boolean | null;
}

export interface UserCredits {
  user_id: string;
  available_credits: number;
  total_credits_earned: number;
  total_credits_used: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  transaction_type: string; // Allow any string to match database
  credits: number;
  description: string | null;
  package_id?: string | null;
  interview_id?: string | null;
  metadata?: Json;
  created_at: string | null;
}

export class CreditsService {
  // Initialize credits for a new user
  static async initializeUserCredits(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('initialize_user_credits', {
        user_uuid: userId
      });

      if (error) {
        console.error('Error initializing user credits:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to initialize user credits:', error);
      throw error;
    }
  }

  // Get user's current credit balance
  static async getUserCredits(userId: string): Promise<UserCredits | null> {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User doesn't have credits record yet, return null
          return null;
        }
        console.error('Error fetching user credits:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get user credits:', error);
      throw error;
    }
  }

  // Calculate credits needed for an interview
  static async calculateInterviewCredits(durationMinutes: number): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('calculate_interview_credits', {
        duration_minutes: durationMinutes
      });

      if (error) {
        console.error('Error calculating interview credits:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to calculate interview credits:', error);
      throw error;
    }
  }

  // Check if user has enough credits for an interview
  static async checkUserCredits(userId: string, requiredCredits: number): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_user_credits', {
        user_uuid: userId,
        required_credits: requiredCredits
      });

      if (error) {
        console.error('Error checking user credits:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to check user credits:', error);
      throw error;
    }
  }

  // Deduct credits for an interview
  static async deductInterviewCredits(userId: string, interviewId: string, durationMinutes: number): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('deduct_interview_credits', {
        user_uuid: userId,
        interview_uuid: interviewId,
        duration_minutes: durationMinutes
      });

      if (error) {
        console.error('Error deducting interview credits:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to deduct interview credits:', error);
      throw error;
    }
  }

  // Add credits to user account (for purchases)
  static async addUserCredits(
    userId: string, 
    creditsToAdd: number, 
    packageId?: string, 
    description?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('add_user_credits', {
        user_uuid: userId,
        credits_to_add: creditsToAdd,
        package_uuid: packageId,
        description: description
      });

      if (error) {
        console.error('Error adding user credits:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to add user credits:', error);
      throw error;
    }
  }

  // Get available credit packages
  static async getCreditPackages(): Promise<CreditPackage[]> {
    try {
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('is_active', true)
        .order('credits', { ascending: true });

      if (error) {
        console.error('Error fetching credit packages:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get credit packages:', error);
      throw error;
    }
  }

  // Get user's transaction history
  static async getUserTransactions(userId: string, limit: number = 50): Promise<CreditTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user transactions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get user transactions:', error);
      throw error;
    }
  }

  // Purchase credits via Stripe (deprecated - use StripeService instead)
  static async purchaseCredits(userId: string, packageId: string): Promise<boolean> {
    console.warn('purchaseCredits is deprecated. Use StripeService.createCheckoutSession instead.');
    throw new Error('Direct credit purchase is disabled. Please use Stripe checkout.');
  }

  // Get credit usage statistics
  static async getCreditStats(userId: string): Promise<{
    totalEarned: number;
    totalUsed: number;
    available: number;
    averagePerInterview: number;
  }> {
    try {
      const credits = await this.getUserCredits(userId);
      const transactions = await this.getUserTransactions(userId, 100);

      if (!credits) {
        return {
          totalEarned: 0,
          totalUsed: 0,
          available: 0,
          averagePerInterview: 0
        };
      }

      // Calculate average credits per interview
      const interviewTransactions = transactions.filter(t => 
        t.transaction_type === 'usage' && t.credits < 0
      );
      const totalInterviewCredits = Math.abs(
        interviewTransactions.reduce((sum, t) => sum + t.credits, 0)
      );
      const averagePerInterview = interviewTransactions.length > 0 
        ? totalInterviewCredits / interviewTransactions.length 
        : 0;

      return {
        totalEarned: credits.total_credits_earned,
        totalUsed: credits.total_credits_used,
        available: credits.available_credits,
        averagePerInterview: Math.round(averagePerInterview)
      };
    } catch (error) {
      console.error('Failed to get credit stats:', error);
      throw error;
    }
  }

  // Deduct credits for OpenAI API call
  static async deductOpenAICredits(userId: string, interviewId: string, tokensUsed: number = 0): Promise<boolean> {
    try {
      // Calculate credits based on tokens used (1 credit per 100 tokens, minimum 1 credit)
      const creditsToDeduct = Math.max(1, Math.ceil(tokensUsed / 100));
      
      // Check if user has enough credits
      const { data: userCredits, error: fetchError } = await supabase
        .from('user_credits')
        .select('available_credits, total_credits_used')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching user credits:', fetchError);
        return false;
      }

      if (!userCredits || userCredits.available_credits < creditsToDeduct) {
        console.error('Insufficient credits for OpenAI API call');
        return false;
      }

      // Deduct credits
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          available_credits: userCredits.available_credits - creditsToDeduct,
          total_credits_used: userCredits.total_credits_used + creditsToDeduct,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error deducting credits:', updateError);
        return false;
      }

      // Record transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'usage',
          credits: -creditsToDeduct,
          description: `OpenAI API call - ${tokensUsed} tokens used`,
          interview_id: interviewId,
          metadata: {
            tokens_used: tokensUsed,
            credits_per_token: 0.01,
            api_call_type: 'openai'
          }
        });

      if (transactionError) {
        console.error('Error recording credit transaction:', transactionError);
        // Don't fail the API call if transaction recording fails
      }

      console.log(`Deducted ${creditsToDeduct} credits for ${tokensUsed} tokens used`);
      return true;
    } catch (error) {
      console.error('Failed to deduct OpenAI credits:', error);
      return false;
    }
  }
}
