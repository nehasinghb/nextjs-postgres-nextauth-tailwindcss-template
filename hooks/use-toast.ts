// hooks/use-toast.ts
import { useState } from 'react';

export interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let toastListener: ((toast: Toast) => void) | null = null;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (newToast: Toast) => {
    setToasts((prev) => [...prev, newToast]);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
    
    // Call global listener if it exists
    if (toastListener) {
      toastListener(newToast);
    }
  };

  return { toast, toasts };
}

// Simple implementation - you can replace with a proper toast library like sonner
export function setToastListener(listener: (toast: Toast) => void) {
  toastListener = listener;
}