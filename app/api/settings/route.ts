// app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch user settings
export async function GET(request: NextRequest) {
  try {
    console.log('[Settings API] GET request received');
    
    const session = await auth();
    console.log('[Settings API] Session:', session ? 'Found' : 'Not found');
    
    if (!session || !session.user) {
      console.log('[Settings API] No session or user in session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('[Settings API] User ID:', userId);

    // Fetch user settings from database
    const result = await query(
      `SELECT 
        user_id,
        dark_mode,
        ai_voice_id,
        created_at,
        updated_at
      FROM users 
      WHERE user_id = $1`,
      [userId]
    );

    console.log('[Settings API] Query result rows:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('[Settings API] User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const settings = result.rows[0];
    console.log('[Settings API] Settings data:', {
      user_id: settings.user_id,
      dark_mode: settings.dark_mode,
      ai_voice_id: settings.ai_voice_id
    });

    return NextResponse.json({
      dark_mode: settings.dark_mode || false,
      ai_voice_id: settings.ai_voice_id || 'af', // Default to Professor Amy
    });
  } catch (error: any) {
    console.error('[Settings API] Error fetching settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update user settings
export async function PUT(request: NextRequest) {
  try {
    console.log('[Settings API] PUT request received');
    
    const session = await auth();
    console.log('[Settings API] Session:', session ? 'Found' : 'Not found');
    
    if (!session || !session.user) {
      console.log('[Settings API] No session or user in session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    console.log('[Settings API] Update data received:', {
      has_dark_mode: 'dark_mode' in body,
      has_ai_voice_id: 'ai_voice_id' in body,
      dark_mode: body.dark_mode,
      ai_voice_id: body.ai_voice_id
    });

    const {
      dark_mode,
      ai_voice_id
    } = body;

    // Validation
    if (typeof dark_mode !== 'boolean') {
      return NextResponse.json(
        { error: 'Dark mode must be a boolean value' },
        { status: 400 }
      );
    }

    if (!ai_voice_id || typeof ai_voice_id !== 'string') {
      return NextResponse.json(
        { error: 'AI voice ID is required and must be a string' },
        { status: 400 }
      );
    }

    // Update user settings
    const result = await query(
      `UPDATE users 
      SET 
        dark_mode = $1,
        ai_voice_id = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $3
      RETURNING 
        user_id,
        dark_mode,
        ai_voice_id,
        updated_at`,
      [
        dark_mode,
        ai_voice_id,
        userId
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedSettings = result.rows[0];
    console.log('[Settings API] Settings updated successfully');

    return NextResponse.json({
      dark_mode: updatedSettings.dark_mode,
      ai_voice_id: updatedSettings.ai_voice_id,
    });
  } catch (error: any) {
    console.error('[Settings API] Error updating settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}