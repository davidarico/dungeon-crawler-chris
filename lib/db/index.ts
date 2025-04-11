// Database connection utility using Supabase
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function for database queries
export async function query(sql: string, params: any[] = []) {
  try {
    const { data, error } = await supabase.rpc('run_sql_query', {
      query_text: sql,
      query_params: params,
    });
    
    if (error) throw error;
    return { rows: data || [] };
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}