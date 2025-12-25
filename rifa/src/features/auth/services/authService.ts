import { supabase } from '@/shared/lib/supabase';
import type { SignInCredentials, SignUpCredentials } from '../types/auth.types';
import type { AuthTokenResponse, User } from '@supabase/supabase-js';

export const authService = {
  async signInWithEmail({ email, password }: SignInCredentials): Promise<AuthTokenResponse> {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response;
  },

  async signUpWithEmail({ email, password, name }: SignUpCredentials) {
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response;
  },

  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      throw new Error(error.message);
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    
    if (error) {
      throw new Error(error.message);
    }
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      throw new Error(error.message);
    }
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(error.message);
    }
    return data.session;
  },

  async getUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
};
