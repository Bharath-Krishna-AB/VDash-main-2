

import React from 'react';

interface ModalProps {
  active: boolean;
  onClose: () => void;
}

export default function HelpModal({ active, onClose }: ModalProps) {
  return (
    <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-90 bg-[var(--color-background)] border-[3px] border-[var(--color-surface-dark)]  py-6 px-5 rounded-4xl shadow-[0_8px_0_var(--color-surface-dark)] z-[300] w-[calc(100%-24px)] sm:w-[calc(100%-32px)] max-w-sm text-center transition-all duration-300 ease-spring max-h-[90vh] overflow-y-auto overflow-x-hidden box-border ${active ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-90'}`} id="help-modal">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-surface-dark flex items-center justify-center mt-2 mx-auto mb-3 shadow-float">
        <svg width="28" height="28" className="sm:w-[34px] sm:h-[34px]" viewBox="0 0 24 24" fill="none" stroke="var(--color-surface-dark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z" />
          <path d="M21 11h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2z" />
          <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
          <path d="M1 14a10.5 10.5 0 0 1 21 0" />
        </svg>
      </div>
      <h4 className="text-xl font-black text-surface-dark mb-2">Help Desk Notified</h4>
      <p className="text-sm text-slate-500 leading-relaxed mb-5 font-semibold">
        A notification has been sent to our Help Desk. Someone will reach out to your team shortly to clarify doubts.
      </p>
      <button
        type="button"
        className="bg-[var(--color-brand-primary)] text-[var(--color-surface-dark)] border-[2px] border-[var(--color-surface-dark)] shadow-[0_4px_0_var(--color-surface-dark)] w-full py-3 px-5 rounded-2xl text-base font-extrabold cursor-pointer transition-all duration-150 ease-out flex items-center justify-center gap-2 shadow-float hover:bg-zinc-800 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
        onClick={onClose}
      >
        <span>Got It</span>
      </button>
    </div>
  );
}
