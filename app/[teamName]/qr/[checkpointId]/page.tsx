import React from 'react';
import Image from 'next/image';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';

export default async function QRScanLandingPage({ params }: { params: Promise<{ teamName: string, checkpointId: string }> }) {
  const resolvedParams = await params;
  const decodedTeamName = decodeURIComponent(resolvedParams.teamName);
  
  const { data: checkpoint, error } = await supabaseAdmin
    .from('checkpoints')
    .select('*')
    .eq('id', resolvedParams.checkpointId)
    .single();

  if (error || !checkpoint) {
    return notFound();
  }

  const title = checkpoint.title;
  const clue = checkpoint.apphint || checkpoint.qrhint || 'Follow the trail to your next destination.';
  const points = checkpoint.points || 15;

  return (
    <div className="relative h-[100dvh] w-full flex flex-col items-center justify-center p-4 font-serif overflow-hidden">
      
      {/* Full screen black background to fill white gaps on desktop */}
      <div className="fixed inset-0 bg-black z-[-2]"></div>
      
      {/* Background image only visible on mobile views */}
      <div 
        className="fixed inset-0 z-[-1] md:hidden"
        style={{
          backgroundImage: "url('/GotBg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Lighter overlay to ensure image is highly visible while text stays readable */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>
      </div>
      
      {/* Header Logo */}
      <div className="fixed top-0 left-0 z-10 w-full flex justify-center pt-6">
        <Image 
          src="/kickstart-logo.png" 
          alt="Kickstart Logo" 
          width={250} 
          height={80} 
          className="opacity-90 drop-shadow-2xl object-contain filter grayscale"
          priority
        />
      </div>

      <div className="w-full max-w-md flex flex-col items-center z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-2 mb-2 flex-1 justify-center">
        
        {/* Animated Icon (House Sigil style - Silver/White) */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-950/80 rounded-full border-[2px] border-zinc-700 flex items-center justify-center mb-4 sm:mb-6 shadow-2xl relative backdrop-blur-sm">
          <div className="absolute inset-0 bg-zinc-800/40 rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute inset-1 border border-zinc-800 rounded-full"></div>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300 drop-shadow-md"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>

        {/* Content Section */}
        <div className="text-center mb-4 sm:mb-6 w-full px-4">
          <span className="bg-zinc-900/90 text-zinc-300 px-4 py-1.5 rounded-sm text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase border-y border-zinc-700 mb-4 inline-flex items-center gap-3 shadow-xl backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse"></span>
            Territory Claimed
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-wider mb-2 text-zinc-100 drop-shadow-md font-serif">
            {title}
          </h1>
          <p className="text-zinc-400 font-medium text-sm sm:text-base leading-relaxed px-2 font-sans tracking-wide">
            You have successfully discovered a new location in the realm. Open your app to verify this checkpoint and claim your reward.
          </p>
        </div>

        {/* Info Card */}
        <div className="w-full bg-zinc-900/80 border border-zinc-700 p-1 mb-6 shadow-2xl backdrop-blur-md relative group">
          {/* Ornate corners */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-zinc-500"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-zinc-500"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-zinc-500"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-zinc-500"></div>
          
          <div className="border border-zinc-800 bg-zinc-950/90 p-4 sm:p-5">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-800">
              <span className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[9px] sm:text-[10px]">The Spoils</span>
              <span className="text-zinc-200 font-bold text-lg sm:text-xl font-serif drop-shadow-md">+{points} PTS</span>
            </div>
            <div>
              <span className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[9px] sm:text-[10px] block mb-2 text-center">A Raven&apos;s Whisper</span>
              <div className="bg-black/60 p-3 sm:p-4 border border-zinc-800 shadow-inner">
                <p className="text-zinc-300 font-medium italic font-serif text-center leading-relaxed text-xs sm:text-sm">
                  &quot;{clue}&quot;
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
