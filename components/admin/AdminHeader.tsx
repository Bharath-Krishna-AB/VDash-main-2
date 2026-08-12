'use client';

import React from 'react';
import Image from 'next/image';

export default function AdminHeader() {
  return (
    <header className="flex justify-between items-center bg-surface rounded-[2rem] p-3 pr-5 shadow-sm shrink-0 border-[3px] border-zinc-100">
      <div className="flex items-center gap-4 pl-4 flex-1 max-w-[400px]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-zinc-400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input 
          type="text" 
          placeholder="Search for metrics or settings" 
          className="w-full bg-transparent border-none outline-none font-bold text-white placeholder:text-zinc-400 text-sm md:text-base"
        />
      </div>
      
      <div className="flex items-center gap-5">
        <button className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-zinc-100 transition-colors relative border-[3px] border-zinc-100">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-zinc-500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
        </button>
        
        <div className="flex items-center gap-3 pl-5 border-l-[3px] border-zinc-100">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-white">Product Admin</div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Pro User</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center overflow-hidden border-[3px] border-zinc-100 shrink-0">
            <Image src="/iedc-logo.png" alt="IEDC Logo" width={40} height={40} className="object-contain" />
          </div>
        </div>
      </div>
    </header>
  );
}
