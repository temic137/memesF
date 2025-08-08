'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookmarkletPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/save-memes');
  }, [router]);
  return null;
}