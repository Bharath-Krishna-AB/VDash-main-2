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
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-start pt-32 sm:pt-36 pb-8 px-4 font-serif overflow-x-hidden overflow-y-auto">
      
      {/* Full screen background */}
      <div className="fixed inset-0 bg-zinc-950 z-[-2]"></div>
      
      {/* Background image across all breakpoints */}
      <div 
        className="fixed inset-0 z-[-1]"
        style={{
          backgroundImage: "url('/GotBg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Vignette and darkness overlay for readability */}
        <div className="absolute inset-0 bg-black/60 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/80 to-black pointer-events-none"></div>
      </div>
      
      {/* Header Logo - Fixed and Spaced */}
      <div className="fixed top-0 left-0 z-20 w-full flex justify-center pt-10 sm:pt-12 pointer-events-none">
        <Image 
          src="/kickstart-logo.png" 
          alt="Kickstart Logo" 
          width={240} 
          height={75} 
          className="opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] object-contain filter grayscale"
          priority
        />
      </div>

      <div className="w-full max-w-md flex flex-col items-center z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-8 mb-4 flex-1 justify-start">
        
        {/* Animated Icon (House Sigil style - Silver/White) */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-full border-[2px] border-zinc-600/50 flex items-center justify-center mb-6 sm:mb-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative backdrop-blur-md">
          <div className="absolute inset-0 bg-zinc-700/20 rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute inset-1.5 border border-zinc-700/80 rounded-full"></div>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.518l4.276 3.664a1 1 0 0 0 1.516-.294l2.952-5.606z" />
            <path d="M5 21h14" />
          </svg>
        </div>

        {/* Content Section */}
        <div className="text-center mb-8 sm:mb-10 w-full px-2">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-8 sm:w-12 h-[1px] bg-gradient-to-r from-transparent to-amber-500/60"></span>
            <span className="text-amber-500 text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] ml-1">
              Territory Claimed
            </span>
            <span className="w-8 sm:w-12 h-[1px] bg-gradient-to-l from-transparent to-amber-500/60"></span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-widest mb-4 text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-400 drop-shadow-lg font-serif uppercase">
            {title}
          </h1>
          <p className="text-zinc-300 font-medium text-base sm:text-lg leading-relaxed px-4 font-serif tracking-wide drop-shadow-md">
            A new territory discovered in the realm<br/>
            <span className="text-amber-500/80 text-sm sm:text-base mt-2 block">Verify to claim your reward</span>
          </p>
        </div>

        {/* The Clue Card */}
        <div className="w-full relative group mb-8">
          <div className="absolute -inset-1 bg-gradient-to-b from-zinc-700/40 via-zinc-800/20 to-zinc-950/60 rounded-xl blur-lg opacity-70 group-hover:opacity-100 transition duration-1000"></div>
          
          <div className="relative bg-zinc-950/80 border border-zinc-700/50 rounded-xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="flex flex-col items-center">
              
              {/* Emblem */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-600 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-900/20 rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300 relative z-10 drop-shadow-md">
                  <path d="M20 4s-4.5-.5-9 4c-3 3-5 7.5-6.5 10.5-.5 1-1.5 2.5-2.5 3.5s-1 1-1 1 0 0 1-1 2.5-2 3.5-2.5C9 18 13.5 16 16.5 13c4.5-4.5 4-9 4-9z" />
                  <path d="M17.5 6.5L6.5 17.5" />
                </svg>
              </div>
              
              <h3 className="text-zinc-400 font-bold uppercase tracking-[0.3em] text-xs mb-8 flex items-center gap-4">
                <span className="w-10 h-[1px] bg-gradient-to-r from-transparent to-zinc-500"></span>
                A Raven&apos;s Whisper
                <span className="w-10 h-[1px] bg-gradient-to-l from-transparent to-zinc-500"></span>
              </h3>
              
              <div className="relative w-full px-6 py-4">
                <span className="absolute top-0 left-0 text-6xl text-zinc-700/30 font-serif leading-none transform -translate-x-2 -translate-y-4">&quot;</span>
                <p className="text-zinc-100 font-serif text-xl sm:text-2xl text-center leading-relaxed tracking-wider z-10 relative drop-shadow-md">
                  {clue}
                </p>
                <span className="absolute bottom-0 right-0 text-6xl text-zinc-700/30 font-serif leading-none transform translate-x-2 translate-y-8">&quot;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
