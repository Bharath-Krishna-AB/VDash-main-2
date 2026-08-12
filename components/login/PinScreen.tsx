'use client';

import React, { useState, useTransition, useRef } from 'react';
import { login } from '@/app/login/action';
import KDashLogo from '@/components/ui/KDashLogo';
import Image from 'next/image';
import MetaBalls from '@/components/ui/MetaBalls';
import PinInput from '@/components/ui/PinInput';

export default function PinScreen({ error }: { error?: string }) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPin = pin.join('');
    if (!username || finalPin.length < 6) return;
    
    startTransition(() => {
      login(username, finalPin);
    });
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-white relative z-10 font-sans">
      
      {/* Left Panel - Branding (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%] flex-col relative overflow-hidden bg-zinc-50">
        
        {/* Animated Fluid Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-auto z-0 opacity-40">
          <MetaBalls
            hoverSmoothness={0.084}
            ballCount={30}
            clumpFactor={1.6}
            color="#3B82F6"
            cursorBallColor="#3B82F6"
            animationSize={19}
            enableTransparency={true}
            enableMouseInteraction={true}
          />
        </div>

        <div className="absolute top-10 left-10 lg:top-14 lg:left-14 z-10 pointer-events-none">
          <KDashLogo className="h-8 lg:h-10 w-auto" />
        </div>
        
        <div className="relative z-10 mt-auto mb-auto px-10 lg:px-20 max-w-2xl">
          <h1 className="text-5xl lg:text-7xl font-bold text-zinc-900 leading-[1.1] mb-6 tracking-tight">
            Authorized<br/>Access
          </h1>
          <p className="text-zinc-500 text-lg lg:text-xl max-w-md leading-relaxed font-medium">
            This dashboard is restricted to internal personnel. Please use the credentials provided by your administrator.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center pt-8 md:pt-20 px-5 sm:px-6 md:px-12 relative bg-white overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="w-full flex md:hidden justify-start mb-8 sm:mb-12 mt-4">
          <KDashLogo className="h-8 w-auto" />
        </div>

        <div className="w-full max-w-[28rem] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out md:mt-16">
          
          <div className="mb-10 text-left">
            <h2 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">System Access</h2>
            <p className="text-zinc-500 font-medium text-sm">Enter your admin-assigned username and 6-digit PIN.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            <div className="flex flex-col">
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-50/80 rounded-2xl py-4 px-5 text-[15px] text-zinc-900 font-medium transition-all duration-200 outline-none focus:bg-zinc-100 placeholder:text-zinc-400"
                placeholder="Username"
                required
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col mt-4">
              <PinInput pin={pin} onChange={setPin} isPending={isPending} />
            </div>

            {error && (
              <div className="w-full bg-red-50/50 text-[#d93025] border border-red-200 rounded-2xl py-3.5 px-4 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 mt-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {error === 'invalid' ? "Invalid credentials. Please try again." : error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || pin.join('').length < 6 || !username}
              className="mt-8 w-full bg-zinc-950 text-white rounded-full py-2.5 pl-6 pr-2.5 text-[15px] font-semibold transition-all duration-300 flex items-center justify-between hover:bg-zinc-800 hover:shadow-lg hover:shadow-black/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span className="ml-2">
                {isPending ? 'Verifying...' : 'Authenticate Access'}
              </span>
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 group-active:scale-95">
                {isPending ? (
                  <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>
                )}
              </div>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
