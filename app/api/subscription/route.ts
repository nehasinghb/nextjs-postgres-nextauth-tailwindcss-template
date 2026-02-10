// app/api/subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { getTierDetails } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

// GET - Fetch user's current subscription
export async function GET(request: NextRequest) {
  try {
    console.log('[Subscription API] GET request received');
    
    const session = await auth();
    console.log('[Subscription API] Session:', session ? 'Found' : 'Not found');
    
    if (!session || !session.user) {
      console.log('[Subscription API] No session or user in session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('[Subscription API] User ID:', userId);

    // Fetch user subscription data from database
    const result = await query(
      `SELECT 
        user_id,
        email,
        subscription_status,
        subscription_tier,
        stripe_customer_id,
        stripe_subscription_id,
        subscription_current_period_end,
        subscription_cancel_at_period_end
      FROM users 
      WHERE user_id = $1`,
      [userId]
    );

    console.log('[Subscription API] Query result rows:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('[Subscription API] User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = result.rows[0];
    const tier = userData.subscription_tier || 'free';
    const tierDetails = getTierDetails(tier);

    console.log('[Subscription API] Subscription data:', {
      status: userData.subscription_status,
      tier: userData.subscription_tier,
      hasStripeCustomer: !!userData.stripe_customer_id
    });

    return NextResponse.json({
      status: userData.subscription_status || 'free',
      tier: userData.subscription_tier || 'free',
      tierDetails: {
        name: tierDetails.name,
        price: tierDetails.price,
        features: tierDetails.features
      },
      stripeCustomerId: userData.stripe_customer_id,
      stripeSubscriptionId: userData.stripe_subscription_id,
      currentPeriodEnd: userData.subscription_current_period_end,
      cancelAtPeriodEnd: userData.subscription_cancel_at_period_end || false
    });
  } catch (error: any) {
    console.error('[Subscription API] Error fetching subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}