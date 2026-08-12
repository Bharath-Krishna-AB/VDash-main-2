'use client';
import React from 'react';
import KDashLogo from '@/components/ui/KDashLogo';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  if (pathname?.includes('/qr/')) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 w-full h-[64px] md:h-[80px] bg-white/70 backdrop-blur-md border-b border-zinc-200/50 flex items-center justify-between px-5 sm:px-6 md:px-12 z-50">
      <KDashLogo className="drop-shadow-sm h-7 sm:h-8 md:h-10 w-auto" />
    </header>
  );
}
