'use client';

import React, { useRef, useState } from 'react';

interface PinInputProps {
  pin: string[];
  onChange: (pin: string[]) => void;
  isPending?: boolean;
  isRequired?: boolean;
}

export default function PinInput({ pin, onChange, isPending = false, isRequired = true }: PinInputProps) {
  const [showPin, setShowPin] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const combinedPin = pin.join('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.slice(0, 6);
    
    const newPinArray = Array.from({ length: 6 }).map((_, i) => val[i] || '');
    onChange(newPinArray);
  };

  const handleBoxClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-1.5 px-2">
        <label className="text-sm uppercase text-zinc-500 tracking-widest font-bold">PIN Code</label>
        <button
          type="button"
          onClick={() => setShowPin(!showPin)}
          className="text-zinc-400 hover:text-zinc-900 transition-colors focus:outline-none flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
          tabIndex={-1}
        >
          {showPin ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              Hide
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Show
            </>
          )}
        </button>
      </div>
      
      <div className="relative flex justify-between gap-1.5 sm:gap-2 md:gap-3 w-full cursor-text" onClick={handleBoxClick}>
        {/* Invisible Native Input for robust typing/autofill */}
        <input
          ref={inputRef}
          type={showPin ? "text" : "password"}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={combinedPin}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isPending}
          required={isRequired}
          autoComplete="one-time-code"
          className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-text"
        />

        {/* Visual Boxes */}
        {Array.from({ length: 6 }).map((_, idx) => {
          const val = pin[idx];
          const isActive = isFocused && !isPending && (combinedPin.length === idx || (combinedPin.length === 6 && idx === 5));
          
          return (
            <div
              key={idx}
              className={`flex-1 flex items-center justify-center min-w-0 aspect-square rounded-[1.25rem] text-2xl font-bold text-center border transition-all duration-200 
                ${isActive ? 'bg-white border-brand-primary shadow-[0_0_0_4px_rgba(159,90,234,0.1)]' : 'bg-zinc-50 border-zinc-200/60 text-zinc-900'}
                ${isPending ? 'opacity-50' : ''}
              `}
            >
              {val ? (showPin ? val : '•') : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}
