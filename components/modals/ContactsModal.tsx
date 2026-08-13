

import React from 'react';
import Image from 'next/image';

export default function ContactsModal({ active, onClose }: { active: boolean, onClose: () => void }) {
  return (
    <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-90 bg-surface border-[3px] border-zinc-100 py-6 px-4 sm:py-10 sm:px-8 rounded-[2.5rem] shadow-2xl z-[300] w-[calc(100%-24px)] sm:w-[calc(100%-32px)] max-w-[28rem] text-center transition-all duration-300 ease-spring max-h-[90vh] overflow-y-auto overflow-x-hidden box-border ${active ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-90'}`} id="contacts-modal">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#f57a00]/10 flex items-center justify-center mt-2 mx-auto mb-3 sm:mb-6 shadow-sm border-2 border-white text-[#f57a00]">
        <svg width="24" height="24" className="sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z" />
          <path d="M21 11h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2z" />
          <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
          <path d="M1 14a10.5 10.5 0 0 1 21 0" />
        </svg>
      </div>

      <h3 className="mt-1 mb-3 text-2xl sm:text-3xl font-display font-[900] text-surface-dark tracking-tight text-center uppercase [-webkit-text-stroke:1.5px_currentColor]">
        Help Desk Contacts
      </h3>

      <p className="text-xs sm:text-sm text-zinc-500 mx-auto mb-4 sm:mb-8 text-center leading-relaxed font-semibold">
        Contact our help desk team for any assistance, clue clarifications, or clearing doubts during your hunt.
      </p>

      <div className="flex flex-col gap-2 sm:gap-3 w-full mb-6 sm:mb-8 text-left">
        <div className="flex items-center gap-2 sm:gap-4 py-2 sm:py-3 px-3 sm:px-4 bg-zinc-50 rounded-2xl border-2 border-zinc-100 transition-colors">
          <div className="w-9 h-9 sm:w-12 sm:h-12 relative rounded-full overflow-hidden shrink-0 shadow-sm border border-zinc-200">
            <Image src="/developedBy.jpeg" alt="Bharath" fill className="object-cover" />
          </div>
          <div className="flex-1">
            <div className="font-extrabold text-sm sm:text-base text-surface-dark">Bharath</div>
            <div className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wide sm:tracking-wider mt-0.5 truncate max-w-[130px] sm:max-w-none">Main Coordinator - CTO</div>
          </div>
          <a href="tel:6235311216" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#f57a00]/10 text-[#f57a00] flex items-center justify-center transition-colors hover:bg-[#f57a00]/20 shrink-0">
            <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </a>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 py-2 sm:py-3 px-3 sm:px-4 bg-zinc-50 rounded-2xl border-2 border-zinc-100 transition-colors">
          <div className="w-9 h-9 sm:w-12 sm:h-12 relative rounded-full overflow-hidden shrink-0 shadow-sm border border-zinc-200">
            <Image src="/alfred.jpeg" alt="Alfred" fill className="object-cover" />
          </div>
          <div className="flex-1">
            <div className="font-extrabold text-sm sm:text-base text-surface-dark">Alfred</div>
            <div className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wide sm:tracking-wider mt-0.5 truncate max-w-[130px] sm:max-w-none">Coordinator - CEO</div>
          </div>
          <a href="tel:+919495911910" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#f57a00]/10 text-[#f57a00] flex items-center justify-center transition-colors hover:bg-[#f57a00]/20 shrink-0">
            <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </a>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 py-2 sm:py-3 px-3 sm:px-4 bg-zinc-50 rounded-2xl border-2 border-zinc-100 transition-colors">
          <div className="w-9 h-9 sm:w-12 sm:h-12 relative rounded-full overflow-hidden shrink-0 shadow-sm border border-zinc-200">
            <Image src="/helpdesk2.jpeg" alt="Sidhaarth" fill className="object-cover" />
          </div>
          <div className="flex-1">
            <div className="font-extrabold text-sm sm:text-base text-surface-dark">Sidhaarth</div>
            <div className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wide sm:tracking-wider mt-0.5 truncate max-w-[130px] sm:max-w-none">Coordinator - CO CEO</div>
          </div>
          <a href="tel:8078486125" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#f57a00]/10 text-[#f57a00] flex items-center justify-center transition-colors hover:bg-[#f57a00]/20 shrink-0">
            <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </a>
        </div>

      </div>

      <button
        type="button"
        className="w-full inline-flex justify-center items-center rounded-full font-bold transition-all duration-300 ease-out active:translate-y-0 active:scale-[0.98] px-8 py-2.5 sm:py-4 font-display text-lg sm:text-xl bg-surface-dark text-white shadow-lg hover:shadow-xl hover:-translate-y-1 [-webkit-text-stroke:1px_currentColor]"
        onClick={onClose}
      >
        <span>Close</span>
      </button>
    </div>
  );
}
