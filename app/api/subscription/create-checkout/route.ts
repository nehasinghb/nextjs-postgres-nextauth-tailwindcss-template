// app/api/subscription/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { stripe, SUBSCRIPTION_TIERS } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

// POST - Create Stripe Checkout Session
export async function POST(request: NextRequest) {
  try {
    console.log('[Checkout API] POST request received');
    
    const session = await auth();
    
    if (!session || !session.user) {
      console.log('[Checkout API] No session');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { tier } = body;

    console.log('[Checkout API] User ID:', userId);
    console.log('[Checkout API] Requested tier:', tier);

    // Validate tier
    if (!tier || !['student', 'premium'].includes(tier.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    const selectedTier = tier.toUpperCase() as 'STUDENT' | 'PREMIUM';
    const tierConfig = SUBSCRIPTION_TIERS[selectedTier];

    // Get user data
    const userResult = await query(
      `SELECT user_id, email, stripe_customer_id FROM users WHERE user_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];
    let customerId = user.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      console.log('[Checkout API] Creating new Stripe customer');
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId
        }
      });
      
      customerId = customer.id;
      
      // Save customer ID to database
      await query(
        `UPDATE users SET stripe_customer_id = $1 WHERE user_id = $2`,
        [customerId, userId]
      );
      
      console.log('[Checkout API] Stripe customer created:', customerId);
    }

    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';

    // Create Stripe Checkout Session
    console.log('[Checkout API] Creating checkout session');
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: tierConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/subscription?canceled=true`,
      metadata: {
        userId: userId,
        tier: selectedTier.toLowerCase()
      },
      subscription_data: {
        metadata: {
          userId: userId,
          tier: selectedTier.toLowerCase()
        },
        trial_period_days: 14, // 14-day free trial
      }
    });

    console.log('[Checkout API] Checkout session created:', checkoutSession.id);

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    });
  } catch (error: any) {
    console.error('[Checkout API] Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}