'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, CreditCard, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  status: string;
  tier: string;
  tierDetails: {
    name: string;
    price: number;
    features: string[];
  };
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '5 AI conversations per month',
      '1 AI voice option',
      'Basic learning templates',
      'Community support'
    ]
  },
  student: {
    name: 'Student Plan',
    price: 9.99,
    popular: true,
    features: [
      'Unlimited AI conversations',
      'All 14 AI voices',
      'Advanced learning templates',
      'Study mode & flashcards',
      'Priority email support',
      'Ad-free experience'
    ]
  },
  premium: {
    name: 'Premium Plan',
    price: 19.99,
    features: [
      'Everything in Student Plan',
      'Advanced analytics & insights',
      'Custom learning paths',
      'API access',
      'White-label options',
      'Dedicated support',
      'Early access to new features'
    ]
  }
};

export default function SubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetchSubscription();
    
    // Check for success/cancel in URL params
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      toast({
        title: 'Subscription activated!',
        description: 'Your subscription has been successfully activated. Enjoy your premium features!'
      });
      // Clear URL params
      router.replace('/dashboard/subscription');
    }
    
    if (canceled === 'true') {
      toast({
        title: 'Checkout canceled',
        description: 'Your checkout was canceled. No charges were made.',
        variant: 'destructive'
      });
      // Clear URL params
      router.replace('/dashboard/subscription');
    }
  }, [searchParams]);

  const fetchSubscription = async () => {
    try {
      console.log('[Client] Fetching subscription from /api/subscription');
      
      const response = await fetch('/api/subscription', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[Client] Subscription data received:', data);
      
      setSubscription(data);
    } catch (error) {
      console.error('[Client] Error fetching subscription:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load subscription',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tier: 'student' | 'premium') => {
    setProcessing(tier);
    
    try {
      console.log('[Client] Creating checkout session for:', tier);
      
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tier })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      console.log('[Client] Redirecting to checkout:', url);
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('[Client] Error creating checkout:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start checkout',
        variant: 'destructive'
      });
      setProcessing(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You\'ll keep access until the end of your billing period.')) {
      return;
    }

    setCanceling(true);
    
    try {
      console.log('[Client] Canceling subscription');
      
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel subscription');
      }

      const data = await response.json();
      console.log('[Client] Subscription canceled');
      
      toast({
        title: 'Subscription canceled',
        description: `Your subscription will remain active until ${new Date(data.cancelAt).toLocaleDateString()}`
      });

      // Refresh subscription data
      await fetchSubscription();
    } catch (error) {
      console.error('[Client] Error canceling subscription:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel subscription',
        variant: 'destructive'
      });
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading subscription...</p>
      </div>
    );
  }

  const currentTier = subscription?.tier || 'free';
  const isActive = subscription?.status === 'active';
  const isCanceling = subscription?.cancelAtPeriodEnd;

  return (
    <div className="w-full px-2 py-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
        <p className="text-muted-foreground">
          Choose the plan that's right for you
        </p>
      </div>

      {/* Current Subscription Status */}
      {subscription && currentTier !== 'free' && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Current Plan: {subscription.tierDetails.name}
                    </p>
                    {isCanceling && (
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Cancels on {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {isActive && !isCanceling && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelSubscription}
                      disabled={canceling}
                    >
                      {canceling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Canceling...
                        </>
                      ) : (
                        'Cancel Subscription'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-3 max-w-6xl">
        {Object.entries(PLANS).map(([tierId, plan]) => {
          const isCurrent = currentTier === tierId;
          const isUpgrade = 
            (currentTier === 'free' && tierId !== 'free') ||
            (currentTier === 'student' && tierId === 'premium');
          
          return (
            <Card key={tierId} className={`relative ${isCurrent ? 'border-primary border-2' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent && (
                    <div className="bg-secondary text-secondary-foreground text-xs font-semibold px-2 py-1 rounded">
                      Current
                    </div>
                  )}
                </div>
                <CardDescription>
                  <span className="text-3xl font-bold">${plan.price}</span>
                  {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {tierId === 'free' ? (
                  <Button variant="outline" className="w-full" disabled>
                    Free Forever
                  </Button>
                ) : isCurrent && isActive ? (
                  <Button variant="outline" className="w-full" disabled>
                    <Check className="mr-2 h-4 w-4" />
                    Active
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe(tierId as 'student' | 'premium')}
                    disabled={processing !== null}
                  >
                    {processing === tierId ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isUpgrade ? (
                      'Upgrade'
                    ) : (
                      'Get Started'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* 14-Day Free Trial Notice */}
      <Card className="mt-6 max-w-6xl bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>14-Day Free Trial:</strong> All paid plans include a free 14-day trial. Cancel anytime during the trial with no charge.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}