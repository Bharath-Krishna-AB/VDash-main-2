import React from 'react';

export default function TeamAdminCard() {
  return (
    <div className="bg-surface rounded-4xl p-7 shadow-card flex flex-col transition-all hover:shadow-float hover:-translate-y-1 relative overflow-hidden group">
      {/* Decorative subtle background icon */}
      <svg className="absolute -right-5 -top-2.5 w-36 h-auto opacity-[0.02] transform group-hover:scale-110 transition-transform duration-500 z-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 22h20L12 2z"></path>
      </svg>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
            Team Alpha
          </h2>
          <p className="text-[0.95rem] font-bold text-brand-purple mt-0.5">
            Checkpoint 1
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-brand-yellow text-white text-xs font-extrabold tracking-wide uppercase transition-colors">
          ACTIVE
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-5">
        <div 
          className="h-full bg-surface-dark rounded-full transition-all duration-500 ease-out" 
          style={{ width: `25%` }}
        />
      </div>

      {/* Timer Section */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl py-6 mb-4 border border-slate-100">
        <span className="text-[0.85rem] font-bold text-slate-500 uppercase tracking-wider mb-1">
          Time Remaining
        </span>
        <div className="text-6xl leading-[0.85] font-['Milesons',_sans-serif] tracking-tight text-white scale-y-110 origin-center">
          59:59
        </div>
      </div>

      {/* Quick Action */}
      <div className="flex gap-4">
        <button className="flex-1 py-4 text-center font-extrabold text-slate-500 hover:text-white hover:bg-slate-50 rounded-2xl transition-all text-[0.8rem] uppercase tracking-wider flex items-center justify-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          Contact Team
        </button>
      </div>
    </div>
  );
}
