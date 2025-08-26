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
        console.error('Sign in error:', error);
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
        console.error('Sign up error:', error);
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
        
        // Initialize credits for new user (but don't fail signup if this fails)
        try {
          const { CreditsService } = await import('./credits-service');
          await CreditsService.initializeUserCredits(data.user.id);
          console.log('User credits initialized successfully');
        } catch (creditError) {
          console.error('Failed to initialize user credits:', creditError);
          // Don't fail the signup if credit initialization fails
          // The user can still use the app, they just won't have initial credits
        }
        
        return user;
      }

      // Handle case where user is created but email confirmation is required
      if (data.user && !data.session) {
        console.log('User created successfully, email confirmation required');
        // Return a temporary user object for the signup success case
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email || '',
          access_token: '', // No session token since email needs confirmation
        };
        return user;
      }

      return null;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        throw error;
      }

      // For OAuth, we need to wait for the redirect and callback
      // The actual user data will be handled in the callback
      return null;
    } catch (error) {
      console.error('Google sign in error:', error);
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
      console.log('Auth state change:', event, session?.user?.email);
      
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
