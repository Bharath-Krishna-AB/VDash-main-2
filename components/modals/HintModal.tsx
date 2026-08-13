'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../teams/GameContext';

interface FrozenHint {
  checkpointIndex: number;
  checkpointNumber: number;
  targetLocation: string;
}

export default function HintModal({ active, onClose }: { active: boolean, onClose: () => void }) {
  const { currentCheckpoint, gameState } = useGame();

  // Snapshot of the hint at the time warning fired for a checkpoint.
  // Only updates when a NEW checkpoint enters its warning period.
  const [frozenHint, setFrozenHint] = useState<FrozenHint | null>(null);

  // Mirror the exact same threshold as TimerCard / FooterActions:
  // ≤10% of total available time (base + bonus) — when audio starts & timer turns red.
  useEffect(() => {
    if (!gameState.timeStarted || gameState.isCompleted || !currentCheckpoint) return;

    const TOTAL_MS = currentCheckpoint.durationSeconds * 1000;
    const TOTAL_AVAILABLE_MS = TOTAL_MS + gameState.activeBonusMs;

    const check = () => {
      const elapsed = Date.now() - gameState.timeStarted!;
      const remainingMs = Math.max(0, TOTAL_MS - elapsed);
      const inWarning = remainingMs > 0 && remainingMs <= TOTAL_AVAILABLE_MS * 0.1;

      if (inWarning) {
        // Only freeze/update when warning fires for a checkpoint we haven't frozen yet
        setFrozenHint(prev => {
          if (prev?.checkpointIndex === gameState.currentCheckpointIndex) return prev;
          return {
            checkpointIndex: gameState.currentCheckpointIndex,
            checkpointNumber: gameState.currentCheckpointIndex + 1,
            targetLocation: currentCheckpoint.targetLocation,
          };
        });
      }
    };

    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [gameState.timeStarted, gameState.isCompleted, currentCheckpoint, gameState.activeBonusMs, gameState.currentCheckpointIndex]);

  // What to show: frozen snapshot if available, otherwise fall back to live data
  const display: FrozenHint = frozenHint ?? {
    checkpointIndex: gameState.currentCheckpointIndex,
    checkpointNumber: gameState.currentCheckpointIndex + 1,
    targetLocation: currentCheckpoint?.targetLocation ?? 'Target location will appear here...',
  };

  // Is the shown hint from a checkpoint that has already ended?
  const isStaleHint =
    !gameState.isCompleted &&
    frozenHint !== null &&
    frozenHint.checkpointIndex < gameState.currentCheckpointIndex;

  // Badge copy
  let badgeText: string;
  let badgeCls: string;
  if (gameState.isCompleted) {
    badgeText = '⏱ Session ended — for quick reference only.';
    badgeCls = 'text-red-500';
  } else if (isStaleHint) {
    badgeText = 'Previous checkpoint — new clue unlocks when time runs out.';
    badgeCls = 'text-zinc-400';
  } else {
    badgeText = 'Current target location for this checkpoint.';
    badgeCls = 'text-zinc-500';
  }

  return (
    <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-90 bg-white/95 backdrop-blur-2xl border border-white/60 py-8 px-5 sm:py-10 sm:px-8 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15),0_0_40px_rgba(0,0,0,0.05)] z-[300] w-[calc(100%-24px)] sm:w-[calc(100%-32px)] max-w-[28rem] text-center transition-all duration-400 ease-spring max-h-[90vh] overflow-y-auto overflow-x-hidden box-border ${active ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'}`} id="hint-modal">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[24px] bg-gradient-to-br from-[#f57a00]/20 to-[#f57a00]/5 flex items-center justify-center mt-2 mx-auto mb-4 sm:mb-6 shadow-inner border border-[#f57a00]/20">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f57a00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path>
          <path d="M9 18h6"></path>
          <path d="M10 22h4"></path>
        </svg>
      </div>

      <h4 className="mt-1 mb-3 text-2xl sm:text-3xl font-display font-[900] text-surface-dark tracking-tight text-center uppercase [-webkit-text-stroke:1px_currentColor]">
        Checkpoint {display.checkpointNumber} Clue
      </h4>

      <p className={`text-xs sm:text-sm mx-auto mb-6 sm:mb-8 text-center leading-relaxed font-semibold ${badgeCls}`}>
        {badgeText}
      </p>

      <div className="p-5 sm:p-6 bg-zinc-50 border border-zinc-100 rounded-[20px] sm:rounded-[24px] shadow-inner mb-6 sm:mb-8 text-center">
        <div className="text-lg sm:text-xl leading-relaxed font-extrabold text-surface-dark tracking-tight">
          {display.targetLocation}
        </div>
      </div>

      <button
        type="button"
        className="flex-1 w-full inline-flex justify-center items-center rounded-full font-bold transition-all duration-300 ease-out active:scale-[0.97] px-4 py-3 sm:py-4 font-display text-lg sm:text-xl bg-zinc-900 text-white shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
        onClick={onClose}
      >
        <span>Close</span>
      </button>
    </div>
  );
}
