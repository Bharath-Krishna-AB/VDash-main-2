import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '@/components/teams/GameContext';

export default function HexQrModal({ active, onClose, mode, autoCountdown }: {
  active: boolean;
  onClose: () => void;
  mode?: string;
  autoCountdown?: number; // when set: auto-dismiss countdown (seconds), close button hidden
}) {
  const [savedMode, setSavedMode] = useState(mode);

  useEffect(() => {
    if (active) {
      setSavedMode(mode);
    }
  }, [active, mode]);

  const isDisplay = savedMode === 'display';
  const { verifyCode, currentCheckpoint, gameState, teamName } = useGame();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [prevActive, setPrevActive] = useState(active);

  if (active !== prevActive) {
    setPrevActive(active);
    if (active) {
      setInputValue('');
      setError(false);
    }
  }

  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [active]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.toUpperCase());
    setError(false);
  };

  const handleVerify = async () => {
    if (inputValue.trim()) {
      const isCorrect = await verifyCode(inputValue.trim());
      if (isCorrect) {
        // Clear the modal URL param AFTER advanceCheckpoint has set showingPreQr=true,
        // so ModalsContainer immediately switches to the QR countdown display.
        onClose();
      } else {
        setError(true);
      }
    }
  };

  // Do not show verify modal if completed
  if (gameState.isCompleted && !isDisplay) {
    return null;
  }

  const cpIndex = gameState.currentCheckpointIndex + 1;

  return (
    <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-90 bg-white/95 backdrop-blur-2xl border border-white/60 py-8 px-5 sm:py-10 sm:px-8 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15),0_0_40px_rgba(0,0,0,0.05)] z-[300] w-[calc(100%-24px)] sm:w-[calc(100%-32px)] max-w-[28rem] text-center transition-all duration-400 ease-spring max-h-[90vh] overflow-y-auto overflow-x-hidden box-border ${active ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'} ${error ? 'animate-shake' : ''}`} id="hex-qr-modal">
      {isDisplay ? (
        /* Mode A: Display Current Checkpoint QR Code */
        <>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[24px] bg-gradient-to-br from-[#f57a00]/20 to-[#f57a00]/5 flex items-center justify-center mt-2 mx-auto mb-4 sm:mb-6 shadow-inner border border-[#f57a00]/20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f57a00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <rect x="7" y="7" width="3" height="3"></rect>
              <rect x="14" y="7" width="3" height="3"></rect>
              <rect x="7" y="14" width="3" height="3"></rect>
              <rect x="14" y="14" width="3" height="3"></rect>
            </svg>
          </div>
          <h4 className="mt-1 mb-3 text-2xl sm:text-3xl font-display font-[900] text-surface-dark tracking-tight text-center uppercase [-webkit-text-stroke:1px_currentColor]">Checkpoint {cpIndex} QR</h4>
          <p className="text-xs sm:text-sm text-zinc-500 mx-auto mb-6 sm:mb-8 text-center leading-relaxed font-semibold">This QR code contains the checkpoint access information for this location.</p>

          <div className="p-3 sm:p-5 bg-white border-2 border-zinc-100 rounded-2xl sm:rounded-[28px] shadow-sm inline-block mx-auto mb-6 sm:mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${typeof window !== 'undefined' && currentCheckpoint ? encodeURIComponent(`${window.location.origin}/teams/${teamName}/qr/${currentCheckpoint.id}`) : ''}`}
              alt="QR code"
              className="w-32 h-32 sm:w-40 sm:h-40 block rounded-xl mix-blend-multiply transition-transform hover:scale-105 duration-500"
            />
          </div>

          <div className="flex gap-3 w-full">
            {autoCountdown !== undefined ? (
              /* Auto-dismiss countdown ring — shown instead of close button */
              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-3">
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#e4e4e7" strokeWidth="4" />
                    <circle
                      cx="28" cy="28" r="24" fill="none"
                      stroke="#18181b" strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 24}`}
                      strokeDashoffset={`${2 * Math.PI * 24 * (1 - autoCountdown / 10)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-zinc-900">
                    {autoCountdown}
                  </span>
                </div>
                <span className="text-zinc-400 font-semibold text-xs tracking-wide uppercase">Timer starts in&hellip;</span>
              </div>
            ) : (
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  className="flex-1 inline-flex justify-center items-center rounded-full font-bold transition-all duration-300 ease-out active:scale-[0.97] px-4 py-3 sm:py-4 font-display text-lg sm:text-xl bg-zinc-900 text-white shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
                  onClick={onClose}
                >
                  <span>Close</span>
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Mode C: Code Input Only (Verify Checkpoint Code) */
        <>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[24px] bg-gradient-to-br from-[#f57a00]/20 to-[#f57a00]/5 flex items-center justify-center mt-2 mx-auto mb-4 sm:mb-6 shadow-inner border border-[#f57a00]/20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f57a00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h4 className="mt-1 mb-3 text-2xl sm:text-3xl font-display font-[900] text-surface-dark tracking-tight text-center uppercase [-webkit-text-stroke:1px_currentColor]">Verify Checkpoint {cpIndex}</h4>
          <p className="text-xs sm:text-sm text-zinc-500 mx-auto mb-6 sm:mb-8 text-center leading-relaxed font-semibold">Enter the unique secret code found at the location to verify and complete this task.</p>
          
          <div className="flex justify-center w-full mt-2 mb-8 box-border">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleChange}
              onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
              className={`w-full h-14 sm:h-16 rounded-[20px] border-2 text-xl sm:text-2xl font-black font-display text-center outline-none transition-all duration-300 ease-out px-4 box-border tracking-[0.2em] shadow-inner ${error ? 'border-red-500 bg-red-50 text-red-600 shadow-[inset_0_0_0_2px_rgba(239,68,68,0.2)]' : 'border-zinc-200 bg-zinc-50/80 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.15)]'} ${!error && inputValue ? 'border-zinc-900 bg-white shadow-sm' : ''}`}
            />
          </div>
          
          {error && <p className="text-red-600 font-bold text-sm mb-6 bg-red-50/80 backdrop-blur-md py-2.5 px-5 rounded-2xl inline-block border border-red-200 shadow-sm animate-in fade-in zoom-in duration-300">Incorrect code. Please try again.</p>}

          <div className="flex flex-row gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 inline-flex justify-center items-center rounded-full font-bold transition-all duration-300 ease-out active:scale-[0.96] px-4 py-3 sm:py-4 font-display text-lg sm:text-xl bg-white text-zinc-600 border-2 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 shadow-sm"
            >
              Close
            </button>
            <button 
              onClick={handleVerify}
              className="flex-1 inline-flex justify-center items-center rounded-full font-bold transition-all duration-300 ease-out active:scale-[0.96] px-4 py-3 sm:py-4 font-display text-lg sm:text-xl bg-zinc-900 text-white shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 [-webkit-text-stroke:1px_currentColor]"
            >
              Verify
            </button>
          </div>
        </>
      )}
    </div>
  );
}
