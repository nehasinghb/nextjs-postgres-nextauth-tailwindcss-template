'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export function HamburgerMenu() {
  function goBackToApp() {
    // Try React Native WebView bridge first, then fall back to history navigation
    if ((window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'goBack' }));
    } else {
      // Go all the way back to before admin was opened
      window.history.go(-(window.history.length - 1));
    }
  }

  function handleDashboard() {
    goBackToApp();
  }

  function handleSignOut() {
    // Hit the server-side logout endpoint to clear the httpOnly cookie,
    // then navigate back to the React Native app
    fetch('/api/auth/logout', { credentials: 'include' })
      .finally(() => {
        if ((window as any).ReactNativeWebView) {
          (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: 'logout' }));
        } else {
          window.history.go(-(window.history.length - 1));
        }
      });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg md:h-8 md:w-8"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start">
        <DropdownMenuItem onClick={handleDashboard}>
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
