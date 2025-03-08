// app/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  useEffect(() => {
    if (tokenFromUrl) {
      // Save cookie and redirect
      document.cookie = `token=${tokenFromUrl}; path=/;`;
      router.push('/dashboard');
    }
  }, [tokenFromUrl, router]);

  return (
    <main style={{ padding: 20 }}>
      <h1>Landing Page</h1>
      <p>
        If you have a token, we’ll automatically redirect to /dashboard.
      </p>
    </main>
  );
}
