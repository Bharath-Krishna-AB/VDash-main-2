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
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-start pt-[clamp(90px,18vh,160px)] pb-8 px-4 font-serif overflow-x-hidden overflow-y-auto">
      
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
      <div className="fixed top-0 left-0 z-20 w-full flex justify-center pt-[clamp(20px,4vh,60px)] pointer-events-none">
        <Image 
          src="/kickstart-logo.png" 
          alt="Kickstart Logo" 
          width={240} 
          height={75} 
          className="w-[clamp(140px,35vw,260px)] opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] object-contain filter grayscale"
          priority
        />
      </div>

      <div className="w-full max-w-[clamp(320px,90vw,600px)] flex flex-col items-center z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 flex-1 justify-center sm:justify-start gap-[clamp(16px,4vh,40px)] my-auto sm:my-0">
        
        {/* The Clue Card */}
        <div className="w-full relative group">
          <div className="absolute -inset-1 bg-gradient-to-b from-zinc-700/40 via-zinc-800/20 to-zinc-950/60 rounded-xl blur-lg opacity-70 group-hover:opacity-100 transition duration-1000"></div>
          
          <div className="relative bg-zinc-950/80 border border-zinc-700/50 rounded-xl p-[clamp(20px,5vw,40px)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="flex flex-col items-center">
              
              {/* Emblem */}
              <div className="w-[clamp(48px,12vw,72px)] h-[clamp(48px,12vw,72px)] rounded-full bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-600 flex items-center justify-center mb-[clamp(16px,3vh,24px)] shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-900/20 rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[50%] h-[50%] text-zinc-300 relative z-10 drop-shadow-md">
                  <path d="M20 4s-4.5-.5-9 4c-3 3-5 7.5-6.5 10.5-.5 1-1.5 2.5-2.5 3.5s-1 1-1 1 0 0 1-1 2.5-2 3.5-2.5C9 18 13.5 16 16.5 13c4.5-4.5 4-9 4-9z" />
                  <path d="M17.5 6.5L6.5 17.5" />
                </svg>
              </div>
              
              <h3 className="text-zinc-300 font-bold uppercase tracking-[0.25em] text-[clamp(10px,2.5vw,16px)] mb-[clamp(16px,4vh,32px)] flex items-center gap-[clamp(8px,2vw,16px)] text-center">
                <span className="w-[clamp(20px,5vw,40px)] h-[1px] bg-gradient-to-r from-transparent to-zinc-500"></span>
                A Raven&apos;s Whisper
                <span className="w-[clamp(20px,5vw,40px)] h-[1px] bg-gradient-to-l from-transparent to-zinc-500"></span>
              </h3>
              
              <div className="relative w-full px-[clamp(16px,4vw,24px)] py-[clamp(8px,2vh,16px)]">
                <span className="absolute top-0 left-0 text-[clamp(3rem,8vw,5rem)] text-zinc-700/30 font-serif leading-none transform -translate-x-2 -translate-y-4">&quot;</span>
                <p className="text-zinc-100 font-serif text-[clamp(1.125rem,3.5vw,1.875rem)] text-center leading-relaxed tracking-wider z-10 relative drop-shadow-md">
                  {clue}
                </p>
                <span className="absolute bottom-0 right-0 text-[clamp(3rem,8vw,5rem)] text-zinc-700/30 font-serif leading-none transform translate-x-2 translate-y-6">&quot;</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="text-center w-full px-2">
          <div className="flex items-center justify-center gap-[clamp(8px,2vw,16px)] mb-[clamp(12px,3vh,24px)]">
            <span className="w-[clamp(24px,6vw,48px)] h-[1px] bg-gradient-to-r from-transparent to-amber-500/60"></span>
            <span className="text-amber-500 text-[clamp(9px,2vw,12px)] font-bold tracking-[0.35em] uppercase drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] ml-1">
              Territory Claimed
            </span>
            <span className="w-[clamp(24px,6vw,48px)] h-[1px] bg-gradient-to-l from-transparent to-amber-500/60"></span>
          </div>
          <h1 className="text-[clamp(1.75rem,6vw,3rem)] font-bold tracking-widest mb-[clamp(8px,2vh,16px)] text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-400 drop-shadow-lg font-serif uppercase leading-tight">
            {title}
          </h1>
          <p className="text-zinc-300 font-medium text-[clamp(12px,3vw,18px)] leading-relaxed px-[clamp(8px,2vw,16px)] font-serif tracking-wide drop-shadow-md">
            A new territory discovered in the realm<br/>
            <span className="text-amber-500/80 text-[clamp(11px,2.5vw,16px)] mt-[clamp(4px,1vh,8px)] block">Verify to claim your reward</span>
          </p>
        </div>

      </div>
    </div>
  );
}
