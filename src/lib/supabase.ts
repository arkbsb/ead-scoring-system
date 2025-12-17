import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Authentication and persistence will not work.');
}

// Prevent crash if variables are missing by using fallback values
// This allows the app to load and show an error UI instead of white screening
console.log('Supabase Config:', {
    urlPresent: !!supabaseUrl,
    keyPresent: !!supabaseAnonKey
});

// Fallback to prevent crash if variables are missing
// The app will load but Auth/DB will fail gracefully instead of white screen
const safeUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(safeUrl, safeKey);
