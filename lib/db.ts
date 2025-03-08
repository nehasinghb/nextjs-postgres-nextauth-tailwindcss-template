// lib/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Create the PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Export drizzle ORM instance
export const db = drizzle(pool);

// Also export raw query function to maintain compatibility with existing code
export const query = (text: string, params?: any[]) => pool.query(text, params);