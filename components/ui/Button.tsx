import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      isLoading,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center rounded-full font-bold transition-all duration-300 ease-out active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-default w-full';
    
    const paddingStyles = rightIcon ? 'pl-8 pr-3 py-3' : 'px-8 py-4';
    const layoutStyles = rightIcon ? 'justify-between' : 'justify-center';
    
    const variants = {
      primary: 'font-display text-xl group bg-surface-dark text-white border-none shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:hover:translate-y-0',
      secondary: 'font-display text-xl group bg-zinc-100 text-surface-dark hover:bg-zinc-200 border-2 border-zinc-200 hover:border-zinc-300 shadow-sm disabled:hover:translate-y-0',
      outline: 'font-display text-xl group bg-transparent border-[3px] border-zinc-200 text-surface-dark hover:border-zinc-300 disabled:hover:translate-y-0',
      ghost: 'group bg-transparent text-zinc-500 hover:bg-zinc-50 hover:text-surface-dark disabled:hover:translate-y-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${paddingStyles} ${layoutStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && leftIcon}
        <span className="truncate tracking-tight [-webkit-text-stroke:1px_currentColor]">{children}</span>
        {!isLoading && rightIcon && (
          <div className={`w-12 h-12 ml-4 rounded-full flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300 ${variant === 'primary' ? 'bg-white text-brand-primary' : 'bg-surface-dark text-white'}`}>
            {rightIcon}
          </div>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
