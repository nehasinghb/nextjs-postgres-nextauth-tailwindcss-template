// app/api/settings/ai-usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch user's AI usage statistics
export async function GET(request: NextRequest) {
  try {
    console.log('[AI Usage API] GET request received');
    
    const session = await auth();
    console.log('[AI Usage API] Session:', session ? 'Found' : 'Not found');
    
    if (!session || !session.user) {
      console.log('[AI Usage API] No session or user in session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('[AI Usage API] User ID:', userId);

    // Get current week's Monday
    const weekStartResult = await query('SELECT get_week_start_date() as week_start');
    const weekStart = weekStartResult.rows[0].week_start;
    console.log('[AI Usage API] Current week start:', weekStart);

    // Get user's weekly limit
    const limitResult = await query(
      `SELECT weekly_limit, reset_day 
       FROM ai_usage_limits 
       WHERE user_id = $1`,
      [userId]
    );

    let weeklyLimit = 1000; // Default
    let resetDay = 1; // Monday

    if (limitResult.rows.length > 0) {
      weeklyLimit = limitResult.rows[0].weekly_limit;
      resetDay = limitResult.rows[0].reset_day;
    } else {
      // Create default limit for user
      await query(
        `INSERT INTO ai_usage_limits (user_id, weekly_limit, reset_day) 
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, weeklyLimit, resetDay]
      );
    }

    console.log('[AI Usage API] Weekly limit:', weeklyLimit);

    // Get current week's usage
    const currentWeekResult = await query(
      `SELECT 
        COALESCE(total_tokens, 0) as total_tokens,
        COALESCE(total_requests, 0) as total_requests,
        COALESCE(chat_tokens, 0) as chat_tokens,
        COALESCE(voice_tokens, 0) as voice_tokens,
        COALESCE(image_tokens, 0) as image_tokens
       FROM ai_weekly_usage
       WHERE user_id = $1 AND week_start_date = $2`,
      [userId, weekStart]
    );

    const currentUsage = currentWeekResult.rows.length > 0 
      ? currentWeekResult.rows[0]
      : {
          total_tokens: 0,
          total_requests: 0,
          chat_tokens: 0,
          voice_tokens: 0,
          image_tokens: 0
        };

    console.log('[AI Usage API] Current usage:', currentUsage);

    // Get last 4 weeks of usage for history
    const historyResult = await query(
      `SELECT 
        week_start_date,
        total_tokens,
        total_requests,
        chat_tokens,
        voice_tokens,
        image_tokens
       FROM ai_weekly_usage
       WHERE user_id = $1
       ORDER BY week_start_date DESC
       LIMIT 4`,
      [userId]
    );

    console.log('[AI Usage API] History records:', historyResult.rows.length);

    // Calculate percentage used
    const percentageUsed = weeklyLimit > 0 
      ? Math.round((currentUsage.total_tokens / weeklyLimit) * 100)
      : 0;

    // Calculate days until reset (next Monday)
    const today = new Date();
    const daysUntilReset = (8 - today.getDay()) % 7 || 7;

    return NextResponse.json({
      current_week: {
        week_start: weekStart,
        total_tokens: parseInt(currentUsage.total_tokens),
        total_requests: parseInt(currentUsage.total_requests),
        chat_tokens: parseInt(currentUsage.chat_tokens),
        voice_tokens: parseInt(currentUsage.voice_tokens),
        image_tokens: parseInt(currentUsage.image_tokens),
        percentage_used: percentageUsed
      },
      limits: {
        weekly_limit: weeklyLimit,
        reset_day: resetDay,
        days_until_reset: daysUntilReset
      },
      history: historyResult.rows.map(row => ({
        week_start: row.week_start_date,
        total_tokens: parseInt(row.total_tokens),
        total_requests: parseInt(row.total_requests),
        chat_tokens: parseInt(row.chat_tokens),
        voice_tokens: parseInt(row.voice_tokens),
        image_tokens: parseInt(row.image_tokens)
      }))
    });
  } catch (error: any) {
    console.error('[AI Usage API] Error fetching usage:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch AI usage' },
      { status: 500 }
    );
  }
}

// POST - Log AI usage (for tracking)
export async function POST(request: NextRequest) {
  try {
    console.log('[AI Usage API] POST request received');
    
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    
    const {
      usage_type = 'chat',
      tokens_used = 0,
      requests_count = 1
    } = body;

    console.log('[AI Usage API] Logging usage:', { usage_type, tokens_used, requests_count });

    // Get current week's Monday
    const weekStartResult = await query('SELECT get_week_start_date() as week_start');
    const weekStart = weekStartResult.rows[0].week_start;

    // Insert usage log
    await query(
      `INSERT INTO ai_usage_logs (user_id, usage_type, tokens_used, requests_count, week_start_date)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, usage_type, tokens_used, requests_count, weekStart]
    );

    // Update weekly summary
    await query(
      'SELECT update_weekly_usage_summary($1, $2)',
      [userId, weekStart]
    );

    console.log('[AI Usage API] Usage logged successfully');

    return NextResponse.json({
      success: true,
      message: 'Usage logged successfully'
    });
  } catch (error: any) {
    console.error('[AI Usage API] Error logging usage:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log AI usage' },
      { status: 500 }
    );
  }
}