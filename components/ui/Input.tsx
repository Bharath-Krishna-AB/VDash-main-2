import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightElement, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-[8px]">
        {label && (
          <label className="text-sm uppercase text-zinc-500 tracking-widest font-bold flex items-center gap-2 mb-1 ml-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-[20px] top-1/2 -translate-y-1/2 text-zinc-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-zinc-50 border-2 ${
              error ? 'border-red-400 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(248,113,113,0.1)]' : 'border-zinc-100 focus:border-brand-primary focus:shadow-[0_0_0_4px_rgba(159,90,234,0.1)]'
            } rounded-[2rem] py-4 ${
              icon ? 'pl-[52px]' : 'px-6'
            } ${
              rightElement ? 'pr-[52px]' : 'px-6'
            } text-xl text-surface-dark font-bold transition-all duration-200 ease-out outline-none focus:bg-surface placeholder:text-zinc-300 placeholder:font-bold ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-[16px] top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <span className="text-red-500 text-sm font-semibold mt-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
