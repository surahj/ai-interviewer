import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface UserProfile {
  user_id: string;
  full_name?: string;
  preferred_role?: string;
  experience_level?: string;
  skills?: string[];
  career_goals?: string[];
  target_companies?: string[];
  skill_gaps?: string[];
  strengths?: string[];
  learning_preferences?: any;
  interview_preferences?: any;
  created_at?: string;
  updated_at?: string;
}

export async function createUserProfileServer(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createUserProfileServer:', error);
    return null;
  }
}

export async function updateUserProfileServer(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserProfileServer:', error);
    return null;
  }
}

export async function deleteUserProfileServer(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteUserProfileServer:', error);
    return false;
  }
}
