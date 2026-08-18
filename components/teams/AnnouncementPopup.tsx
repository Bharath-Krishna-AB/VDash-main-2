'use client';

import React from 'react';

interface AnnouncementPopupProps {
  active: boolean;
  message: string;
  onClose: () => void;
}

export default function AnnouncementPopup({ active, message, onClose }: AnnouncementPopupProps) {
  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[290] transition-opacity duration-300 ${active ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      
      {/* Modal matching GoT dark theme (deep blacks, zinc/slate, silver/white highlights) */}
      <div 
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-90 bg-zinc-950/95 backdrop-blur-2xl py-8 px-5 sm:py-10 sm:px-8 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8),0_0_40px_rgba(0,0,0,0.5)] border border-zinc-800 z-[300] w-[calc(100%-24px)] sm:w-[calc(100%-32px)] max-w-[28rem] text-center transition-all duration-400 ease-spring max-h-[90vh] overflow-y-auto overflow-x-hidden box-border flex flex-col items-center ${active ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'}`} 
        id="announcement-modal"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[24px] bg-zinc-900 flex items-center justify-center mt-2 mx-auto mb-4 sm:mb-6 shadow-inner border border-zinc-800 shrink-0">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        </div>

        <h4 className="mt-1 mb-3 text-2xl sm:text-3xl font-display font-[900] text-white tracking-tight text-center uppercase">
          Broadcast
        </h4>

        <div className="w-full p-5 sm:p-6 bg-zinc-900/50 border border-zinc-800 rounded-[20px] sm:rounded-[24px] shadow-inner mb-6 sm:mb-8 text-center text-zinc-300">
          <div className="text-lg sm:text-xl leading-relaxed font-semibold tracking-tight whitespace-pre-wrap break-words">
            {message}
          </div>
        </div>

        <button
          type="button"
          className="w-full inline-flex justify-center items-center rounded-full font-bold transition-all duration-300 ease-out active:scale-[0.97] px-4 py-3 sm:py-4 font-display text-lg sm:text-xl bg-zinc-100 text-zinc-950 shadow-[0_8px_16px_-6px_rgba(255,255,255,0.1)] hover:bg-white hover:-translate-y-0.5"
          onClick={onClose}
        >
          <span>Dismiss</span>
        </button>
      </div>
    </>
  );
}
