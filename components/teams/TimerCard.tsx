'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from './GameContext';
import SquircleClipPath from '@/components/ui/SquircleClipPath';

interface TimerCardProps {
  teamName: string;
}

export default function TimerCard({ teamName }: TimerCardProps) {
  const { gameState, currentCheckpoint, checkpoints, startGame, advanceCheckpoint } = useGame();
  const [timeRemaining, setTimeRemaining] = useState("00:00");
  const [isWarning, setIsWarning] = useState(false);
  const [startCode, setStartCode] = useState("");
  const [startError, setStartError] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/warning.mp3');
    audioRef.current.loop = true;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!gameState.timeStarted || gameState.isCompleted || !currentCheckpoint) return;

    const TOTAL_MS = currentCheckpoint.durationSeconds * 1000;
    const TOTAL_AVAILABLE_MS = TOTAL_MS + gameState.activeBonusMs;
    const warningTimestamp = gameState.timeStarted! + TOTAL_MS - (TOTAL_AVAILABLE_MS * 0.2);

    const checkWarning = () => {
      const now = Date.now();
      const isWarn = now >= warningTimestamp && now < gameState.timeStarted! + TOTAL_MS;
      setIsWarning(isWarn);
      if (isWarn) {
        if (audioRef.current && audioRef.current.paused) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.log('Autoplay blocked:', e));
        }
      } else {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
        }
      }
    };

    const interval = setInterval(() => {
      const elapsed = Date.now() - gameState.timeStarted!;
      const remainingMs = Math.max(0, TOTAL_MS - elapsed);

      const mins = Math.floor(remainingMs / 60000);
      const secs = Math.floor((remainingMs % 60000) / 1000);

      setTimeRemaining(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);

      checkWarning();

      if (remainingMs === 0) {
        clearInterval(interval);
        if (audioRef.current) audioRef.current.pause();

        // Auto-advance to the next checkpoint immediately
        advanceCheckpoint();
      }
    }, 1000);

    // Initial render
    const initialElapsed = Date.now() - gameState.timeStarted!;
    const initialRemainingMs = Math.max(0, TOTAL_MS - initialElapsed);
    const m = Math.floor(initialRemainingMs / 60000);
    const s = Math.floor((initialRemainingMs % 60000) / 1000);
    const initTimer = setTimeout(() => {
      setTimeRemaining(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      checkWarning();
    }, 0);

    let warningTimeout: ReturnType<typeof setTimeout> | null = null;
    const now = Date.now();
    if (now < warningTimestamp) {
      warningTimeout = setTimeout(checkWarning, warningTimestamp - now);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(initTimer);
      if (warningTimeout) clearTimeout(warningTimeout);
      if (audioRef.current) audioRef.current.pause();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.timeStarted, gameState.isCompleted, currentCheckpoint]);

  const handleStart = async () => {
    // Unlock audio context on mobile via first user interaction
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        if (audioRef.current) audioRef.current.pause();
      }).catch(e => console.log('Audio unlock blocked:', e));
    }

    if (startCode.trim()) {
      const success = await startGame(startCode.trim());
      if (!success) {
        setStartError(true);
      }
    }
  };

  const checkpointText = gameState.isCompleted
    ? " Route Completed!"
    : currentCheckpoint
      ? `Checkpoint ${gameState.currentCheckpointIndex + 1} of ${checkpoints.length}`
      : "Loading...";

  if (!gameState.assignmentId) {
    return (
      <section className="relative flex-1 w-full h-full flex flex-col justify-center px-4 sm:px-6 pb-20 z-20" id="screen-1">
        <div className="w-full bg-white border-[3px] border-zinc-100 rounded-[2.5rem] p-6 sm:p-10 flex flex-col items-center shadow-2xl shadow-zinc-950/10">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h1 className="text-3xl font-[900] text-center tracking-tight text-zinc-900 mb-3">
            No Route Assigned
          </h1>
          <p className="text-zinc-500 font-medium text-center text-sm leading-relaxed max-w-[280px]">
            This team has not been assigned a route yet. Please contact the administrator.
          </p>
        </div>
      </section>
    );
  }

  if (!gameState.hasStarted) {
    return (
      <section className="relative flex-1 w-full h-full flex flex-col justify-center px-4 sm:px-6 pb-20 z-20" id="screen-1">
        <div id="tutorial-timer" className="w-full bg-white/95 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 sm:p-10 flex flex-col items-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-transform duration-300 relative overflow-hidden group">

          {/* Subtle animated background glow mesh */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-[2.5rem] z-0">
            <div className="absolute -top-[30%] -right-[20%] w-[70%] h-[70%] bg-blue-100/50 blur-[80px] rounded-full mix-blend-multiply opacity-50 group-hover:opacity-80 transition-opacity duration-1000"></div>
            <div className="absolute -bottom-[20%] -left-[20%] w-[60%] h-[60%] bg-purple-100/50 blur-[80px] rounded-full mix-blend-multiply opacity-50 group-hover:opacity-80 transition-opacity duration-1000 delay-300"></div>
          </div>

          <div className="relative z-10 w-24 h-24 bg-white text-zinc-900 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(59,130,246,0.15)] border border-zinc-100 group-hover:-translate-y-2 transition-transform duration-700 ease-out">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800 drop-shadow-sm">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </div>

          <h1 className="relative z-10 text-[clamp(2rem,8vw,2.5rem)] font-[900] text-center tracking-tight bg-gradient-to-br from-zinc-900 to-zinc-500 bg-clip-text text-transparent mb-4 drop-shadow-sm">
            Ready To Begin
          </h1>
          <p className="relative z-10 text-zinc-500 font-medium mb-10 text-center text-[15px] leading-relaxed max-w-[320px]">
            Enter the authorized start code to officially start your team&apos;s route and timer.
          </p>

          <div className="relative z-10 w-full flex flex-col gap-5">
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-blue-500 transition-colors duration-300 z-10">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <input
                type="text"
                value={startCode}
                onChange={(e) => { setStartCode(e.target.value.toUpperCase()); setStartError(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleStart(); }}
                placeholder="ENTER CODE"
                className={`w-full h-[76px] bg-white rounded-[1.25rem] border-[3px] text-[22px] font-black text-center outline-none transition-all px-14 tracking-[0.2em] shadow-sm ${startError ? 'border-red-500/50 text-red-600 bg-red-50 focus:border-red-500 focus:shadow-[0_0_25px_rgba(239,68,68,0.2)]' : 'border-zinc-100 text-zinc-900 placeholder:text-zinc-300 placeholder:tracking-[0.1em] placeholder:font-bold focus:border-blue-500 focus:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:border-zinc-200'}`}
              />
              <div className={`absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none transition-all duration-300 ${startCode.length > 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-md">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </div>
            {startError && <p className="text-red-500 font-bold text-xs text-center uppercase tracking-wider animate-pulse">Invalid Code</p>}

            <button
              onClick={handleStart}
              className="w-full h-[72px] mt-2 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 border-t border-white/10 text-white font-bold text-[18px] tracking-wide hover:from-zinc-700 hover:to-zinc-900 transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2 group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)]"
            >
              Start Game
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex-1 w-full h-full flex flex-col opacity-100 pointer-events-auto z-20 pb-[16px] px-4 sm:px-[24px]" id="screen-1">
      {/* 1. Timer & Checkpoint Card */}
      <div
        id="tutorial-timer"
        className={`w-full flex flex-col relative transition-all duration-300 ease-out text-white p-4 sm:p-[32px] flex-1 min-h-0 justify-between items-center [clip-path:url(#squircle-clip)] [view-transition-name:main-card] shadow-xl ${isWarning && !gameState.isCompleted ? 'bg-red-950 shadow-red-900/50' : 'bg-zinc-950 shadow-zinc-950/20'}`}
      >
        <div className="w-full mt-[16px] flex flex-col items-center">
          {isWarning && !gameState.isCompleted && (
            <div className="flex items-center gap-2 text-red-500 mb-2 animate-bounce">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22M12 6l7.5 13h-15M11 10h2v4h-2M11 16h2v2h-2" /></svg>
              <span className="font-bold tracking-widest text-sm">CRITICAL DANGER</span>
            </div>
          )}
          <h1
            className={`text-[clamp(1.75rem,8vw,2.75rem)] font-[900] text-center tracking-tight drop-shadow-md ${isWarning && !gameState.isCompleted ? 'text-red-500' : 'text-white'}`}
          >
            {teamName}
          </h1>
        </div>

        <div className="flex-1 flex items-center justify-center w-full min-h-0">
          <div
            className={`text-[clamp(3rem,20vw,8.5rem)] leading-[0.85] font-display font-[900] tracking-[-0.03em] [font-variant-numeric:tabular-nums] text-center scale-y-[1.1] origin-center [view-transition-name:timer-display] drop-shadow-xl transition-colors duration-500 ${isWarning ? 'text-red-500 animate-pulse' : 'text-white'}`}
          >
            {gameState.isCompleted ? "DONE" : timeRemaining}
          </div>
        </div>

        <div className="w-full mb-[16px]">
          <div className="text-[1.2rem] font-[700] text-center tracking-tight text-white">{checkpointText}</div>
          {!gameState.isCompleted && currentCheckpoint && (
            <div className="text-center text-sm font-bold mt-1 text-white/80 font-serif italic">{currentCheckpoint.title}</div>
          )}
        </div>
      </div>
      <SquircleClipPath />
    </section>
  );
}
