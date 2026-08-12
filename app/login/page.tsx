import React from 'react';
import PinScreen from '@/components/login/PinScreen';
import SquircleClipPath from '@/components/ui/SquircleClipPath';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <div className="w-full h-[100dvh] bg-white flex flex-col relative overflow-hidden">
      <PinScreen error={params?.error} />
      <SquircleClipPath />
    </div>
  );
}
