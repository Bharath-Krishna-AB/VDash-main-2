'use client';

import React, { useState, useRef } from 'react';

const SwipeToConfirm = ({ onConfirm, isPending }: { onConfirm: () => void, isPending: boolean }) => {
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

  const [maxPosition, setMaxPosition] = React.useState(200);

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
          {isPending ? 'Deleting...' : 'Release to Delete'}
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
          Slide to delete
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

interface CheckpointDeleteModalProps {
  isOpen: boolean;
  checkpointName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
  affectedRoutes?: { id: string, name: string }[];
  onEditRoute?: (routeId: string) => void;
  onDeleteRoute?: (routeId: string) => void;
  onForceDeleteAll?: () => void;
}

export default function CheckpointDeleteModal({ isOpen, checkpointName, onCancel, onConfirm, isPending = false, affectedRoutes = [], onEditRoute, onDeleteRoute, onForceDeleteAll }: CheckpointDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl border border-zinc-100 animate-in zoom-in-95 duration-200 flex flex-col gap-4 text-center">
        <button 
          onClick={onCancel} 
          disabled={isPending}
          className="absolute top-6 right-6 p-2 bg-zinc-50 text-zinc-400 hover:text-zinc-900 border border-zinc-100 hover:border-zinc-200 rounded-full transition-all disabled:opacity-50 z-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        
        {affectedRoutes.length > 0 ? (
          <>
            <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 mt-4 shadow-lg shadow-amber-500/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">Cannot Delete</h3>
              <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                This checkpoint is assigned to <span className="font-bold text-zinc-900">{affectedRoutes.length} route{affectedRoutes.length > 1 ? 's' : ''}</span>. Please remove it from the following routes before deleting:
              </p>
            </div>

            <div className="relative my-2 text-left border border-zinc-100 bg-zinc-50/50 rounded-2xl overflow-hidden shadow-inner">
              <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto p-3 overscroll-contain scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
                {affectedRoutes.map((route, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 text-sm font-semibold text-zinc-700 p-2.5 bg-white rounded-xl border border-zinc-100 shadow-sm transition-all hover:border-zinc-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                      <span className="truncate text-[15px]">{route.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onEditRoute && (
                        <button 
                          onClick={() => onEditRoute(route.id)}
                          className="w-[34px] h-[34px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors border border-transparent hover:border-zinc-200"
                          title="Edit Route"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </button>
                      )}
                      {onDeleteRoute && (
                        <button 
                          onClick={() => onDeleteRoute(route.id)}
                          className="w-[34px] h-[34px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
                          title="Delete Route"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Bottom fade indicator for scroll */}
              {affectedRoutes.length > 3 && (
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-zinc-50/90 to-transparent pointer-events-none"></div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={onCancel}
                className="flex-1 py-3.5 bg-zinc-950 text-white font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-zinc-950/20"
              >
                Okay, got it
              </button>
              {onForceDeleteAll && (
                <button
                  onClick={onForceDeleteAll}
                  className="flex-1 py-3.5 bg-red-50 text-red-600 font-bold rounded-full hover:bg-red-100 transition-all border border-red-200"
                >
                  Force Delete
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 mt-4 shadow-lg shadow-red-500/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </div>
            
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">Delete Checkpoint?</h3>
              <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-zinc-900">{checkpointName}</span>? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 mt-2">
              <SwipeToConfirm onConfirm={onConfirm} isPending={isPending} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
