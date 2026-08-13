'use client';
import React, { useState, useEffect, useRef } from 'react';
import ClientModalLink from '@/components/ui/ClientModalLink';
import { useGame } from '../teams/GameContext';
import { usePathname, useSearchParams } from 'next/navigation';

export default function FooterActions() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { gameState, currentCheckpoint } = useGame();

  // Whether we are in the final-minutes warning zone for the current checkpoint
  const [isWarning, setIsWarning] = useState(false);

  // Once a warning fires (or the game completes while warning was active), the hint
  // button stays unlocked for the rest of the session.
  const [hintUnlocked, setHintUnlocked] = useState(false);

  // The red notification dot — shown when warning first triggers, hidden when the
  // user opens the hint modal; resets for each new checkpoint index.
  const [showRedDot, setShowRedDot] = useState(false);

  // Triggers the attention animation for one cycle when red dot first appears.
  const [isAttention, setIsAttention] = useState(false);
  const attentionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track which checkpoint index we last showed the red dot for, so we can
  // re-show it when a new checkpoint enters warning territory.
  const lastRedDotCheckpointRef = useRef<number>(-1);

  // ── Warning / unlock logic ───────────────────────────────────────────────
  // Mirrors TimerCard.tsx exactly: warning fires at ≤10% of total available
  // time (base duration + any early-finish bonus), which is when the audio
  // starts playing and the timer UI turns red.
  useEffect(() => {
    if (!gameState.timeStarted || gameState.isCompleted || !currentCheckpoint) {
      setTimeout(() => setIsWarning(false), 0);
      return;
    }

    const TOTAL_MS = currentCheckpoint.durationSeconds * 1000;
    const TOTAL_AVAILABLE_MS = TOTAL_MS + gameState.activeBonusMs;

    const check = () => {
      const elapsed = Date.now() - gameState.timeStarted!;
      const remainingMs = Math.max(0, TOTAL_MS - elapsed);
      const isWarn = remainingMs > 0 && remainingMs <= TOTAL_AVAILABLE_MS * 0.1;
      
      setIsWarning(isWarn);
      
      if (isWarn) {
        setHintUnlocked(true);
        const cpIndex = gameState.currentCheckpointIndex;
        if (lastRedDotCheckpointRef.current !== cpIndex) {
          lastRedDotCheckpointRef.current = cpIndex;
          setShowRedDot(true);
          setIsAttention(true);
          if (attentionTimerRef.current) clearTimeout(attentionTimerRef.current);
          attentionTimerRef.current = setTimeout(() => setIsAttention(false), 700);
          
          const url = new URL(window.location.href);
          url.searchParams.set('modal', 'hint');
          window.history.pushState(null, '', url.toString());
        }
      }
    };

    check(); // immediate
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [gameState.timeStarted, gameState.isCompleted, currentCheckpoint, gameState.activeBonusMs, gameState.currentCheckpointIndex]);

  // ── Dismiss red dot when hint modal opens ────────────────────────────────
  if (showRedDot && searchParams?.get('modal') === 'hint') {
    setShowRedDot(false);
  }

  // Cleanup attention timer on unmount
  useEffect(() => {
    return () => {
      if (attentionTimerRef.current) clearTimeout(attentionTimerRef.current);
    };
  }, []);

  if (pathname?.includes('/qr/')) {
    return null;
  }

  // The hint button is active when either:
  //   - currently in warning mode, OR
  //   - it was ever unlocked (warning fired before) and the game is running/completed
  const hintActive = isWarning || hintUnlocked;

  return (
    <footer className="pt-[16px] px-[16px] sm:px-[24px] pb-[40px] flex justify-center items-center bg-transparent z-10 w-full relative">
      <div className="flex items-center gap-[10px] sm:gap-[16px] bg-white/90 backdrop-blur-[12px] px-[14px] sm:px-[20px] py-[10px] sm:py-[12px] rounded-[36px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] border-[1px] border-gray-100">
        {hintActive ? (
          <ClientModalLink
            id="tutorial-hint"
            modal="hint"
            className={`w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-full bg-gray-100 border-none text-black cursor-pointer flex items-center justify-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-gray-200 active:scale-95 active:translate-y-0 relative${isAttention ? ' animate-[hint-attention_0.6s_cubic-bezier(0.36,0.07,0.19,0.97)_both]' : ''}`}
            aria-label="View Hint"
            title="View Checkpoint Hint"
          >
            {showRedDot && (
              <>
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
              </>
            )}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path>
              <path d="M9 18h6"></path>
              <path d="M10 22h4"></path>
            </svg>
          </ClientModalLink>
        ) : (
          <div
            id="tutorial-hint"
            className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-full bg-gray-100 border-none text-black/30 cursor-not-allowed flex items-center justify-center transition-all duration-200 relative"
            aria-label="Hint disabled"
            title="Hint is only available when time is running out"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path>
              <path d="M9 18h6"></path>
              <path d="M10 22h4"></path>
            </svg>
          </div>
        )}
        <ClientModalLink
          id="tutorial-verify"
          modal="verify"
          className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-full bg-gray-100 border-none text-black cursor-pointer flex items-center justify-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-gray-200 active:scale-95 active:translate-y-0"
          aria-label="Verify Checkpoint Code"
          title="Verify Code"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"></path>
            <path d="m21 2-9.6 9.6"></path>
            <circle cx="7.5" cy="15.5" r="5.5"></circle>
          </svg>
        </ClientModalLink>
        <ClientModalLink
          id="tutorial-contact"
          modal="contacts"
          className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-full bg-gray-100 border-none text-black cursor-pointer flex items-center justify-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-gray-200 active:scale-95 active:translate-y-0"
          aria-label="Contact Help Desk for Assistance or Doubts"
          title="Need Help or Have Doubts? Contact Help Desk"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z" />
            <path d="M21 11h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2z" />
            <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
            <path d="M1 14a10.5 10.5 0 0 1 21 0" />
          </svg>
        </ClientModalLink>
        <ClientModalLink
          id="tutorial-qr"
          modal="qr"
          className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-full bg-gray-100 border-none text-black cursor-pointer flex items-center justify-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-gray-200 active:scale-95 active:translate-y-0"
          aria-label="Current Checkpoint QR Code"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="5" height="5" x="3" y="3" rx="1"></rect>
            <rect width="5" height="5" x="16" y="3" rx="1"></rect>
            <rect width="5" height="5" x="3" y="16" rx="1"></rect>
            <path d="M21 16h-3a2 2 0 0 0-2 2v3"></path>
            <path d="M21 21v.01"></path>
            <path d="M12 7v3a2 2 0 0 1-2 2H7"></path>
            <path d="M3 12h.01"></path>
            <path d="M12 3h.01"></path>
            <path d="M12 16v.01"></path>
            <path d="M16 12h1"></path>
            <path d="M21 12v.01"></path>
            <path d="M12 21v-1"></path>
          </svg>
        </ClientModalLink>
        <ClientModalLink
          id="tutorial-logout"
          modal="logout"
          className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-full bg-zinc-900 border-none text-white cursor-pointer flex items-center justify-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-zinc-800 active:scale-95 active:translate-y-0 shadow-[0_4px_14px_rgba(24,24,27,0.25)]"
          aria-label="Logout"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </ClientModalLink>
      </div>
    </footer>
  );
}
