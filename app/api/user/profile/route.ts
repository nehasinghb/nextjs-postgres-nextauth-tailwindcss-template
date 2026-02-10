// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    console.log('[Profile API] GET request received');
    
    const session = await auth();
    console.log('[Profile API] Session:', session ? 'Found' : 'Not found');
    
    if (!session || !session.user) {
      console.log('[Profile API] No session or user in session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('[Profile API] User ID:', userId);

    // Fetch user profile from database
    const result = await query(
      `SELECT 
        user_id,
        email,
        display_name,
        date_of_birth,
        current_grade,
        school_university,
        profile_picture_url,
        created_at,
        updated_at
      FROM users 
      WHERE user_id = $1`,
      [userId]
    );

    console.log('[Profile API] Query result rows:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('[Profile API] User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];
    console.log('[Profile API] User data:', {
      email: user.email,
      display_name: user.display_name,
      has_dob: !!user.date_of_birth,
      has_grade: !!user.current_grade
    });
    
    // Format date if it exists
    if (user.date_of_birth) {
      user.date_of_birth = new Date(user.date_of_birth).toISOString().split('T')[0];
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('[Profile API] Error fetching user profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    console.log('[Profile API] PUT request received');
    
    const session = await auth();
    console.log('[Profile API] Session:', session ? 'Found' : 'Not found');
    
    if (!session || !session.user) {
      console.log('[Profile API] No session or user in session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    console.log('[Profile API] Update data received:', {
      has_display_name: !!body.display_name,
      has_dob: !!body.date_of_birth,
      has_grade: !!body.current_grade
    });

    const {
      display_name,
      date_of_birth,
      current_grade,
      school_university
    } = body;

    // Validation
    if (!display_name || !display_name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!date_of_birth) {
      return NextResponse.json(
        { error: 'Date of birth is required' },
        { status: 400 }
      );
    }

    if (!current_grade) {
      return NextResponse.json(
        { error: 'Current grade is required' },
        { status: 400 }
      );
    }

    // Update user profile
    const result = await query(
      `UPDATE users 
      SET 
        display_name = $1,
        date_of_birth = $2,
        current_grade = $3,
        school_university = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $5
      RETURNING 
        user_id,
        email,
        display_name,
        date_of_birth,
        current_grade,
        school_university,
        profile_picture_url,
        updated_at`,
      [
        display_name.trim(),
        date_of_birth,
        current_grade,
        school_university || null,
        userId
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = result.rows[0];
    console.log('[Profile API] User updated successfully');
    
    // Format date if it exists
    if (updatedUser.date_of_birth) {
      updatedUser.date_of_birth = new Date(updatedUser.date_of_birth).toISOString().split('T')[0];
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('[Profile API] Error updating user profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user profile' },
      { status: 500 }
    );
  }
}