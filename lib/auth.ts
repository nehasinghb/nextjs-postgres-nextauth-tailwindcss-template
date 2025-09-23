"use server";
// lib/auth.ts
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { query } from '@/lib/db' // your db query function
import type { JwtPayload } from 'jsonwebtoken'

export async function signOut() {
  // This removes the 'token' cookie, effectively logging the user out
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

export async function auth() {
  const cookieStore = await cookies(); // Await cookies first
  const token = cookieStore.get('token')?.value;
  if (!token) {
    return null;
  }
  try {
    // decode the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // e.g. { user_id, email, ... } from your NodeJS passport code
    if (!decoded || typeof decoded !== 'object' || !decoded['user_id']) {
      return null;
    }

    // fetch the user from the DB
    const dbUserRes = await query('SELECT user_id, email, display_name FROM users WHERE user_id = $1', [decoded['user_id']]);
    if (dbUserRes.rows.length === 0) {
      return null;
    }
    const dbUser = dbUserRes.rows[0];

    // return a session-like object
    return {
      user: {
        id: dbUser.user_id,
        email: dbUser.email,
        name: dbUser.display_name
      }
    };
  } catch (err) {
    console.error('auth() error verifying JWT:', err);
    return null;
  }
}