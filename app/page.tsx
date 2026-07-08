'use client';

import dynamic from 'next/dynamic';

const Portal = dynamic(() => import('./components/Portal'), { ssr: false });

export default function Home() {
  return <Portal />;
}
