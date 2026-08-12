import React, { useState, useRef } from 'react';
import { useGame } from '@/components/teams/GameContext';
import { resetTeamRoute } from '@/app/teams/actions';
import { logout } from '@/app/login/action';
import { useRouter } from 'next/navigation';

const SwipeToLogout = ({ onConfirm, isPending }: { onConfirm: () => void, isPending: boolean }) => {
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonWidth = 48; // w-12 = 48px

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPending) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || isPending) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const maxPosition = rect.width - buttonWidth - 8; // 8px total padding (p-1)
    let newPos = Math.max(0, Math.min(x - buttonWidth / 2, maxPosition));
    setPosition(newPos);
  };

  const [maxPosition, setMaxPosition] = useState(200);

  React.useEffect(() => {
    if (containerRef.current) {
      setMaxPosition(containerRef.current.getBoundingClientRect().width - buttonWidth - 8);
    }
  }, [buttonWidth]);

  const isReached = position >= maxPosition * 0.9;
  const showReadyState = isReached && !isPending;

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || isPending) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    if (isReached) {
      setPosition(maxPosition);
      onConfirm();
    } else {
      setPosition(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-[56px] rounded-full flex items-center p-1 overflow-hidden shadow-xl group transition-all duration-300 ${isPending || showReadyState ? 'bg-red-500 shadow-red-500/20' : 'bg-zinc-950 shadow-zinc-950/20'}`}
    >
      <div 
        className={`absolute left-0 top-0 bottom-0 rounded-full transition-all ${isPending || showReadyState ? 'bg-red-600' : 'bg-white/10'}`}
        style={{ width: `${position + buttonWidth + 8}px`, transitionDuration: isDragging ? '0ms' : '300ms' }}
      />
      
      {isPending || showReadyState ? (
        <span className="absolute inset-0 flex items-center justify-center font-bold text-sm pointer-events-none tracking-widest uppercase z-0 text-white animate-in fade-in zoom-in-95 duration-200">
          {isPending ? 'Logging out...' : 'Release to Logout'}
        </span>
      ) : (
        <span 
          className={`absolute inset-0 flex items-center justify-center font-bold text-sm pointer-events-none tracking-widest uppercase z-0 transition-opacity duration-300 ${isDragging ? 'opacity-30 text-white' : 'text-white'}`}
          style={{
            backgroundImage: isDragging ? 'none' : 'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.5) 100%)',
            backgroundSize: '200% auto',
            backgroundClip: isDragging ? 'border-box' : 'text',
            WebkitBackgroundClip: isDragging ? 'border-box' : 'text',
            WebkitTextFillColor: isDragging ? 'currentColor' : 'transparent',
            animation: isDragging ? 'none' : 'shimmer 2s linear infinite'
          }}
        >
          Slide to logout
        </span>
      )}
      
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ transform: `translateX(${position}px)`, transitionDuration: isDragging ? '0ms' : '300ms' }}
        className={`relative z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing touch-none transition-transform hover:scale-105 ${isPending || showReadyState ? 'text-red-500' : 'text-zinc-950'}`}
      >
        {isPending ? (
          <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}} />
    </div>
  );
};

interface ModalProps {
  active: boolean;
  onClose: () => void;
}

export default function LogoutModal({ active, onClose }: ModalProps) {
  const { gameState, teamName } = useGame();
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsPending(true);
    if (gameState.assignmentId) {
      await resetTeamRoute(gameState.assignmentId);
    }
    localStorage.removeItem(`game_state_${teamName}`);
    
    await logout();
  };


  return (
    <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-90 bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-zinc-100 z-[300] w-[calc(100%-24px)] sm:w-[calc(100%-32px)] max-w-sm text-center transition-all duration-300 ease-spring overflow-hidden flex flex-col gap-4 ${active ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-90'}`} id="logout-modal">
      
      <button 
        onClick={onClose} 
        disabled={isPending}
        className="absolute top-6 right-6 p-2 bg-zinc-50 text-zinc-400 hover:text-zinc-900 border border-zinc-100 hover:border-zinc-200 rounded-full transition-all disabled:opacity-50"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div className="relative z-10 w-full mt-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 shadow-sm border-2 border-white">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        <h3 className="mt-1 mb-2 text-2xl font-bold text-zinc-900 tracking-tight">
          Logout & Reset
        </h3>
        
        <p className="text-sm font-medium text-zinc-500 leading-relaxed mb-8 px-2 max-w-[260px] mx-auto">
          Are you sure you want to log out? This will reset your current route assignment.
        </p>
        
        <div className="flex flex-col gap-3 mt-2">
          <SwipeToLogout onConfirm={handleLogout} isPending={isPending} />
        </div>
      </div>
    </div>
  );
}
