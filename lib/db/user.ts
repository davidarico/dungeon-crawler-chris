import { supabase } from './index';

// User model interface
export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  created_at?: Date;
  last_login?: Date;
}

// Create or update a user in the database using Supabase
export async function upsertUser(user: Omit<User, 'created_at' | 'last_login'>): Promise<User> {
  const { id, email, name, image } = user;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      name,
      image,
      last_login: new Date().toISOString()
    }, {
      onConflict: 'id'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
  
  return data as User;
}

// Get a user by ID
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
  
  return data as User;
}

// Get a user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
  
  return data as User;
}