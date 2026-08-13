'use client';

import React from 'react';
import Link from 'next/link';
import { useGame } from '@/components/teams/GameContext';
import ClientModalLink from '@/components/ui/ClientModalLink';

export default function HintDetailPage() {
  const { currentCheckpoint, gameState } = useGame();

  if (gameState.isCompleted) {
    return (
      <section className="absolute top-0 bottom-0 left-[24px] right-[24px] flex flex-col gap-[16px] h-full opacity-100 pointer-events-auto translate-y-0" id="screen-2">
        <div className="w-full flex flex-col justify-center items-center text-center p-8 bg-zinc-800 rounded-3xl text-surface mt-20">
          <h2 className="text-3xl font-bold mb-4 text-brand-tertiary">Congratulations!</h2>
          <p>You have completed all checkpoints.</p>
        </div>
      </section>
    );
  }

  const targetLocation = currentCheckpoint?.targetLocation || "Loading location...";
  const hint = currentCheckpoint?.hint || "Loading hint...";

  return (
    <section className="absolute top-0 bottom-0 left-[16px] sm:left-[24px] right-[16px] sm:right-[24px] flex flex-col gap-[12px] sm:gap-[16px] h-full opacity-100 pointer-events-auto translate-y-0" id="screen-2">
      {/* Target Location Card */}
      <div 
        className="w-full flex flex-col relative transition-all duration-200 ease-out [clip-path:url(#squircle-clip)] rounded-[20px] text-surface p-[16px] sm:p-[24px] mb-[16px] sm:mb-[20px] flex-1 min-h-0 [view-transition-name:hint-display] [container-type:size] bg-brand-tertiary"
      >
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between pb-[12px] border-b-[1.5px] border-[rgba(255,255,255,0.15)] relative">
          <Link
            href="."
            className="w-[40px] h-[40px] rounded-full bg-[rgba(255,255,255,0.15)] backdrop-blur-[8px] text-surface flex items-center justify-center cursor-pointer transition-all duration-200 ease-[ease] absolute left-0 z-10 hover:bg-[rgba(255,255,255,0.25)] hover:scale-105 active:scale-95"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
          </Link>
          
          <h2 className="text-[1.25rem] font-[800] tracking-[-0.01em] text-center w-full m-0 opacity-95 pointer-events-none">
            Clue Hint
          </h2>
        </div>
        
        {/* Scrollable Hint Content */}
        <div className="flex-1 overflow-y-auto w-full pt-[20px] px-0 mt-[4px] relative flex flex-col items-center">
          <div className="text-surface opacity-80 text-[0.88rem] uppercase tracking-[0.08em] font-[700] mb-[12px] flex items-center gap-[6px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Target Location
          </div>
          <div className="text-[clamp(1.1rem,5vw,1.4rem)] font-[850] leading-[1.4] text-center tracking-[-0.01em] [text-wrap:balance]">
            {targetLocation}
          </div>
          
          <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.15)] w-full text-center">
             <div className="text-white/80 font-bold uppercase tracking-widest text-xs mb-2">Additional Clue</div>
             <p className="text-lg font-medium">{hint}</p>
          </div>
        </div>

        {/* Footer Area inside Card */}
        <div className="pt-[16px] flex justify-center border-t-[1.5px] border-[rgba(255,255,255,0.15)] mt-auto">
          <div className="flex gap-[4px]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i} 
                className={`w-[6px] h-[6px] rounded-full ${i === 0 ? 'bg-[#FFFFFF]' : 'bg-[rgba(255,255,255,0.3)]'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Verify Pin Full Width Button */}
      <div className="w-full mt-[4px] mb-[8px] relative z-30">
        <ClientModalLink
          modal="verify"
          className="w-full min-h-[56px] sm:min-h-[64px] bg-[#18181B] text-[#FFFFFF] border-[2px] border-[#18181B] rounded-[22px] p-[14px_16px] sm:p-[18px_20px] text-[1rem] sm:text-[1.1rem] font-[800] tracking-[-0.01em] flex items-center justify-center gap-[6px] cursor-pointer transition-all duration-150 ease-[ease] shadow-[0_6px_16px_rgba(24,24,27,0.2)] hover:bg-[#27272A] hover:border-[#27272A] hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(24,24,27,0.25)] active:translate-y-0 active:scale-[0.98] active:shadow-[0_4px_12px_rgba(24,24,27,0.15)]"
        >
          <span>Verify Code</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </ClientModalLink>
      </div>
    </section>
  );
}
