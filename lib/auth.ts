// lib/auth.ts
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { query } from '@/lib/db'

export async function signOut() {
  "use server";
  // This removes the 'token' cookie, effectively logging the user out
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

export async function auth() {
  "use server";
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    console.log('[Auth] Token exists:', !!token);
    
    if (!token) {
      return null;
    }

    // Decode the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log('[Auth] JWT decoded successfully');
    
    // Ensure decoded has user_id
    if (!decoded || typeof decoded !== 'object' || !('user_id' in decoded)) {
      console.log('[Auth] Invalid token structure');
      return null;
    }

    const userId = decoded.user_id;
    console.log('[Auth] User ID from token:', userId);

    // Fetch the user from the DB - include all relevant fields
    const dbUserRes = await query(
      `SELECT 
        user_id, 
        email, 
        display_name, 
        profile_picture_url,
        date_of_birth,
        current_grade,
        school_university,
        created_at,
        updated_at
      FROM users 
      WHERE user_id = $1`, 
      [userId]
    );

    if (dbUserRes.rows.length === 0) {
      console.log('[Auth] User not found in database');
      return null;
    }

    const dbUser = dbUserRes.rows[0];
    console.log('[Auth] User found:', {
      email: dbUser.email,
      display_name: dbUser.display_name
    });

    // Return a session-like object compatible with Next.js expectations
    return {
      user: {
        id: dbUser.user_id,
        email: dbUser.email,
        name: dbUser.display_name,
        image: dbUser.profile_picture_url
      }
    };
  } catch (err) {
    console.error('[Auth] Error verifying JWT:', err);
    return null;
  }
}