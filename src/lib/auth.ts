import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Client-Info': 'supabase-js/2.0.0',
    },
  },
});

export interface AuthUser {
  id: string;
  email: string;
  access_token: string;
}

export class AuthManager {
  private static instance: AuthManager;
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  async initialize(): Promise<AuthUser | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth initialization error:', error);
        return null;
      }

      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          access_token: session.access_token,
        };
        this.currentUser = user;
        this.notifyListeners(user);
        return user;
      }

      return null;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      return null;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.currentUser) {
      return this.currentUser;
    }
    return this.initialize();
  }

  async signIn(email: string, password: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user && data.session) {
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email || '',
          access_token: data.session.access_token,
        };
        this.currentUser = user;
        this.notifyListeners(user);
        return user;
      }

      return null;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signUp(email: string, password: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user && data.session) {
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email || '',
          access_token: data.session.access_token,
        };
        this.currentUser = user;
        this.notifyListeners(user);
        
        // Initialize credits for new user
        try {
          const { CreditsService } = await import('./credits-service');
          await CreditsService.initializeUserCredits(data.user.id);
        } catch (creditError) {
          console.error('Failed to initialize user credits:', creditError);
          // Don't fail the signup if credit initialization fails
        }
        
        return user;
      }

      return null;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.currentUser = null;
      this.notifyListeners(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  getAccessToken(): string | null {
    return this.currentUser?.access_token || null;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(user: AuthUser | null): void {
    this.listeners.forEach(listener => listener(user));
  }

  // Setup auth state change listener
  setupAuthListener(): void {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          access_token: session.access_token,
        };
        this.currentUser = user;
        this.notifyListeners(user);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.notifyListeners(null);
      }
    });
  }
}

// Export singleton instance
export const authManager = AuthManager.getInstance();
