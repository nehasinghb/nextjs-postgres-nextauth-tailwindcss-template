// app/api/subscription/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { query } from '@/lib/db';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Disable body parsing, need raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// POST - Handle Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Webhook] No signature found');
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Webhook] No webhook secret configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('[Webhook] Signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('[Webhook] Event received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log('[Webhook] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle checkout session completed
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('[Webhook] Checkout completed:', session.id);
  
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier || 'student';

  if (!userId) {
    console.error('[Webhook] No userId in session metadata');
    return;
  }

  // Update user subscription status
  await query(
    `UPDATE users 
    SET 
      subscription_status = 'active',
      subscription_tier = $1,
      stripe_subscription_id = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $3`,
    [tier, session.subscription, userId]
  );

  console.log('[Webhook] User subscription activated:', userId);
}

// Handle subscription update
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('[Webhook] Subscription updated:', subscription.id);

  const userId = subscription.metadata?.userId;
  const tier = subscription.metadata?.tier || 'student';

  if (!userId) {
    console.error('[Webhook] No userId in subscription metadata');
    return;
  }

  const status = subscription.status;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;

  await query(
    `UPDATE users 
    SET 
      subscription_status = $1,
      subscription_tier = $2,
      stripe_subscription_id = $3,
      subscription_current_period_end = $4,
      subscription_cancel_at_period_end = $5,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $6`,
    [status, tier, subscription.id, currentPeriodEnd, cancelAtPeriodEnd, userId]
  );

  console.log('[Webhook] User subscription updated:', userId, status);
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('[Webhook] Subscription deleted:', subscription.id);

  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('[Webhook] No userId in subscription metadata');
    return;
  }

  await query(
    `UPDATE users 
    SET 
      subscription_status = 'canceled',
      subscription_tier = 'free',
      stripe_subscription_id = NULL,
      subscription_current_period_end = NULL,
      subscription_cancel_at_period_end = false,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1`,
    [userId]
  );

  console.log('[Webhook] User subscription canceled:', userId);
}

// Handle successful payment
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('[Webhook] Payment succeeded:', invoice.id);

  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  // Fetch subscription to get metadata
  const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
  const userId = subscription.metadata?.userId;

  if (!userId) return;

  // Update subscription status to active
  await query(
    `UPDATE users 
    SET 
      subscription_status = 'active',
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1`,
    [userId]
  );

  console.log('[Webhook] Payment processed for user:', userId);
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('[Webhook] Payment failed:', invoice.id);

  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  // Fetch subscription to get metadata
  const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
  const userId = subscription.metadata?.userId;

  if (!userId) return;

  // Update subscription status to past_due
  await query(
    `UPDATE users 
    SET 
      subscription_status = 'past_due',
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1`,
    [userId]
  );

  console.log('[Webhook] Payment failed for user:', userId);
}