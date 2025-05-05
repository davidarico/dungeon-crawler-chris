import { db } from '../api/db.server';

// User model interface
export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  created_at?: Date;
  last_login?: Date;
}

// Create or update a user in the database using PostgreSQL
export async function upsertUser(user: Omit<User, 'created_at' | 'last_login'>): Promise<User> {
  try {
    const { id, email, name, image } = user;
    
    // Use PostgreSQL's ON CONFLICT DO UPDATE for upsert operation
    const query = `
      INSERT INTO users (id, email, name, image, last_login)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE
      SET email = $2, name = $3, image = $4, last_login = $5
      RETURNING *
    `;
    
    const values = [id, email, name, image, new Date()];
    const result = await db.query(query, values);
    
    if (!result.rows || result.rows.length === 0) {
      throw new Error('Failed to upsert user');
    }
    
    return result.rows[0] as User;
  } catch (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
}

// Get a user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as User;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

// Get a user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as User;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}