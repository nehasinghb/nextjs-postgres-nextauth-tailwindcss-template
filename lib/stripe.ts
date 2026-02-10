// lib/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Subscription tier configuration
export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null, // No Stripe price for free tier
    features: [
      '5 AI conversations per month',
      '1 AI voice option',
      'Basic learning templates',
      'Community support'
    ],
    limits: {
      conversationsPerMonth: 5,
      voicesAvailable: 1,
      templatesAccess: 'basic'
    }
  },
  STUDENT: {
    id: 'student',
    name: 'Student Plan',
    price: 9.99,
    priceId: process.env.STRIPE_STUDENT_PRICE_ID || 'price_student_test', // Test mode
    features: [
      'Unlimited AI conversations',
      'All 14 AI voices',
      'Advanced learning templates',
      'Study mode & flashcards',
      'Priority email support',
      'Ad-free experience'
    ],
    limits: {
      conversationsPerMonth: -1, // unlimited
      voicesAvailable: -1, // all voices
      templatesAccess: 'advanced'
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium Plan',
    price: 19.99,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_test', // Test mode
    features: [
      'Everything in Student Plan',
      'Advanced analytics & insights',
      'Custom learning paths',
      'API access',
      'White-label options',
      'Dedicated support',
      'Early access to new features'
    ],
    limits: {
      conversationsPerMonth: -1, // unlimited
      voicesAvailable: -1, // all voices
      templatesAccess: 'premium',
      apiAccess: true,
      analytics: true
    }
  }
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// Helper function to get tier details
export function getTierDetails(tierId: string) {
  return SUBSCRIPTION_TIERS[tierId.toUpperCase() as SubscriptionTier] || SUBSCRIPTION_TIERS.FREE;
}

// Helper function to check if user has access to a feature
export function hasFeatureAccess(userTier: string, feature: string): boolean {
  const tier = getTierDetails(userTier);
  
  // Map feature names to tier capabilities
  const featureMap: Record<string, boolean> = {
    'unlimited_conversations': tier.limits.conversationsPerMonth === -1,
    'all_voices': tier.limits.voicesAvailable === -1,
    'advanced_templates': tier.limits.templatesAccess !== 'basic',
    'api_access': tier.limits.apiAccess === true,
    'analytics': tier.limits.analytics === true,
  };
  
  return featureMap[feature] || false;
}

// Stripe webhook signature verification
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}