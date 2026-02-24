// src/utils/auth.ts - SUPABASE AUTH
import { supabase } from '../config/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

export const getSession = async (): Promise<Session | null> => {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session;
};

export const getUser = async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

export const isAuthenticated = async (): Promise<boolean> => {
    const session = await getSession();
    return !!session;
};

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
};

export const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
};

export default { getSession, getUser, isAuthenticated, signIn, logout };
