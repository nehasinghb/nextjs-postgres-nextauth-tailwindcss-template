// app/api/subscription/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

// POST - Cancel user's subscription
export async function POST(request: NextRequest) {
  try {
    console.log('[Cancel Subscription API] POST request received');
    
    const session = await auth();
    
    if (!session || !session.user) {
      console.log('[Cancel Subscription API] No session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('[Cancel Subscription API] User ID:', userId);

    // Get user's subscription ID
    const userResult = await query(
      `SELECT stripe_subscription_id FROM users WHERE user_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const subscriptionId = userResult.rows[0].stripe_subscription_id;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Cancel subscription at period end (not immediately)
    console.log('[Cancel Subscription API] Canceling subscription:', subscriptionId);
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    // Update database
    await query(
      `UPDATE users 
      SET 
        subscription_cancel_at_period_end = true,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1`,
      [userId]
    );

    console.log('[Cancel Subscription API] Subscription will cancel at period end');

    return NextResponse.json({
      success: true,
      message: 'Subscription will cancel at the end of the billing period',
      cancelAt: new Date(subscription.current_period_end * 1000)
    });
  } catch (error: any) {
    console.error('[Cancel Subscription API] Error canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}