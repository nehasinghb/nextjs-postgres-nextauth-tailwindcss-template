'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { VercelLogo } from '@/components/icons';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If the Node server redirected here with ?token=XYZ
    if (tokenFromUrl) {
      // 1) Save token to a cookie. Make sure "path=/" so it's sent for all pages
      document.cookie = `token=${tokenFromUrl}; path=/;`;
      // 2) Navigate to the dashboard
      router.push('/dashboard');
    }
  }, [tokenFromUrl, router]);

  // This calls Node.js route => triggers Google OAuth => returns back with ?token=...
  function handleGoogleLogin() {
    setIsLoading(true);
    window.location.href = 'http://localhost:5000/api/auth/google?platform=web';
  }

  // Simulated login handlers (not implemented)
  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    // This would normally authenticate the user
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Sign in functionality would be implemented here');
    }, 1000);
  }
  
  function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    // This would normally register the user
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Sign up functionality would be implemented here');
    }, 1000);
  }
  
  function handleForgotPassword() {
    alert('Password reset functionality would be implemented here');
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/40">
      <div className="mb-8 flex items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <VercelLogo className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred sign in method
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" placeholder="name@example.com" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="px-0 text-xs text-muted-foreground"
                        onClick={handleForgotPassword}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <Input id="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign in with Google
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input id="email-signup" placeholder="name@example.com" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input id="password-signup" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </div>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign up with Google
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Button variant="link" className="h-auto p-0">Terms of Service</Button>
            {" "}and{" "}
            <Button variant="link" className="h-auto p-0">Privacy Policy</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}