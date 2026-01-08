'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLoggedInUser } from './auth';

export function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    const user = getLoggedInUser();
    if (!user) {
      router.replace('/login');
    }
  }, [router]);
}
