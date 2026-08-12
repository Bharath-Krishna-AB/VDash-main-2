import React from 'react';

export default function SwipeToConfirm({ text = 'Slide to Confirm' }: { text?: string }) {
  return (
    <div
      className={`relative w-full h-[56px] bg-surface-dark rounded-[28px] flex items-center justify-center overflow-hidden select-none touch-none shadow-[0_8px_24px_rgba(0,0,0,0.12),inset_0_2px_4px_rgba(255,255,255,0.08)] mt-[16px] border-[1.5px] border-zinc-800 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}
    >
      <div
        className={`absolute w-full text-center text-[0.95rem] font-[600] tracking-[0.01em] text-zinc-300 pointer-events-none z-[2] flex items-center justify-center`}
      >
        {text}
      </div>

      <div
        className={`absolute left-[4px] top-[4px] w-[48px] h-[48px] bg-white text-surface-dark rounded-full flex items-center justify-center cursor-grab z-[3] shadow-[0_4px_12px_rgba(0,0,0,0.22)]`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </div>
    </div>
  );
}
