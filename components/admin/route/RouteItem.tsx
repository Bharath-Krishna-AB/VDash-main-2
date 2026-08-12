import React from 'react';

export interface RouteItemProps {
  name: string;
  checkpointsCount: number;
  isActive?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

export default function RouteItem({ name, checkpointsCount, isActive, onClick, onDelete }: RouteItemProps) {
  if (isActive) {
    return (
      <div 
        onClick={onClick}
        className="group p-4 rounded-[1.5rem] cursor-pointer transition-all duration-300 relative flex justify-between items-center bg-brand-primary shadow-md border-2 border-brand-primary"
      >
        <div className="flex-1">
          <h3 className="font-display text-xl font-bold flex items-center gap-2 text-white">
            <div className="w-2.5 h-2.5 bg-brand-success rounded-full shadow-md shadow-brand-success/80 animate-pulse"></div>
            {name}
          </h3>
          <p className="text-xs font-bold mt-1 text-zinc-100 pl-4 uppercase tracking-widest">{checkpointsCount} Checkpoints</p>
        </div>
        <button 
          type="button" 
          onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          className="p-2 rounded-full transition-colors z-10 relative text-zinc-400 hover:text-white hover:bg-zinc-800" 
          title="Delete Route"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className="group p-4 rounded-[1.5rem] cursor-pointer transition-all duration-300 relative flex justify-between items-center bg-zinc-50 border-2 border-zinc-100 hover:border-brand-primary hover:shadow-sm"
    >
      <div className="flex-1">
        <h3 className="font-display text-xl font-bold flex items-center gap-2 text-surface-dark">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
          {name}
        </h3>
        <p className="text-xs font-bold mt-1 text-zinc-400 pl-4 uppercase tracking-widest">{checkpointsCount} Checkpoints</p>
      </div>
      <button 
        type="button" 
        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
        className="p-2 rounded-full transition-colors z-10 relative text-transparent group-hover:text-slate-400 hover:!text-red-500 hover:!bg-red-100" 
        title="Delete Route"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  );
}
