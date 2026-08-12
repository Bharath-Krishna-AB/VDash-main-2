'use client';

import React from 'react';
import { useGame } from '../teams/GameContext';

export default function HintModal({ active, onClose }: { active: boolean, onClose: () => void }) {
  const { currentCheckpoint, gameState } = useGame();
  
  const checkpointNumber = gameState.currentCheckpointIndex + 1;
  const targetLocation = currentCheckpoint?.targetLocation || 'Target location will appear here...';

  return (
    <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-90 bg-surface border-[3px] border-zinc-100 py-8 px-5 sm:py-10 sm:px-8 rounded-[2.5rem] shadow-2xl z-[300] w-[calc(100%-24px)] sm:w-[calc(100%-32px)] max-w-[28rem] text-center transition-all duration-300 ease-spring max-h-[90vh] overflow-y-auto overflow-x-hidden box-border ${active ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-90'}`} id="hint-modal">
      <div className="w-16 h-16 rounded-full bg-[#f57a00]/10 flex items-center justify-center mt-2 mx-auto mb-6 shadow-sm border-2 border-white">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f57a00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path>
          <path d="M9 18h6"></path>
          <path d="M10 22h4"></path>
        </svg>
      </div>

      <h3 className="mt-1 mb-3 text-2xl sm:text-3xl font-display font-[900] text-surface-dark tracking-tight text-center uppercase [-webkit-text-stroke:1.5px_currentColor]">
        Checkpoint {checkpointNumber} Clue
      </h3>
      
      <p className="text-[10px] text-brand-primary mx-auto mb-6 text-center font-bold tracking-widest uppercase bg-brand-primary/10 py-1.5 px-4 rounded-full inline-block">
        Current Target Location
      </p>

      <div className="bg-zinc-50 border-[3px] border-zinc-100 rounded-3xl py-8 px-6 mb-8 text-center shadow-sm">
        <div className="text-lg leading-relaxed font-extrabold text-surface-dark tracking-tight">
          {targetLocation}
        </div>
      </div>

      <button
        type="button"
        className="w-full inline-flex justify-center items-center rounded-full font-bold transition-all duration-300 ease-out active:translate-y-0 active:scale-[0.98] px-8 py-4 font-display text-xl bg-surface-dark text-white shadow-lg hover:shadow-xl hover:-translate-y-1 [-webkit-text-stroke:1px_currentColor]"
        onClick={onClose}
      >
        <span>Close</span>
      </button>
    </div>
  );
}
