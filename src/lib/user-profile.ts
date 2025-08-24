import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // First check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Try API fallback immediately if no session
      try {
        // Use absolute URL for server-side calls
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (response.ok) {
          const { profile } = await response.json();
          return profile;
        }
      } catch (apiError) {
        console.error('getUserProfile: API fallback error:', apiError);
      }
      return null;
    }

    // Try direct Supabase call first
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Don't log error for missing user profiles - this is expected for new users
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Direct Supabase call failed:', error);
      
      // Fallback to API endpoint
      try {
        // Use absolute URL for server-side calls
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
        });
        
        if (response.ok) {
          const { profile } = await response.json();
          return profile;
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('API fallback failed:', response.status, errorData);
          return null;
        }
      } catch (apiError) {
        console.error('API fallback error:', apiError);
        return null;
      }
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

export async function hasCompletedProfile(userId: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      return false;
    }

    // Check if essential profile fields are filled
    const hasBasicInfo = profile.full_name && profile.preferred_role && profile.experience_level;
    const hasSkills = profile.skills && profile.skills.length > 0;
    const hasLearningPreferences = profile.learning_preferences && 
      (typeof profile.learning_preferences === 'object' ? profile.learning_preferences.style : profile.learning_preferences);

    return hasBasicInfo && hasSkills && hasLearningPreferences;
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return false;
  }
}

export async function createUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
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
    console.error('Error in createUserProfile:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
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
    console.error('Error in updateUserProfile:', error);
    return null;
  }
}

export async function getProfileCompletionPercentage(userId: string): Promise<number> {
  try {
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      return 0;
    }

    const requiredFields = [
      'full_name',
      'preferred_role', 
      'experience_level',
      'skills',
      'learning_preferences'
    ];

    const optionalFields = [
      'career_goals',
      'target_companies',
      'skill_gaps',
      'strengths',
      'interview_preferences'
    ];

    let completedRequired = 0;
    let completedOptional = 0;

    // Check required fields
    for (const field of requiredFields) {
      const value = profile[field as keyof UserProfile];
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        completedRequired++;
      }
    }

    // Check optional fields
    for (const field of optionalFields) {
      const value = profile[field as keyof UserProfile];
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        completedOptional++;
      }
    }

    // Calculate percentage (required fields are worth 80%, optional fields 20%)
    const requiredPercentage = (completedRequired / requiredFields.length) * 80;
    const optionalPercentage = (completedOptional / optionalFields.length) * 20;

    return Math.round(requiredPercentage + optionalPercentage);
  } catch (error) {
    console.error('Error calculating profile completion:', error);
    return 0;
  }
}
