import React, { useState, useTransition, useEffect } from 'react';

interface DeferredSearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSearch: (query: string) => void;
  icon?: React.ReactNode;
}

export default function DeferredSearchInput({ onSearch, icon, className = '', value, ...props }: DeferredSearchInputProps) {
  const [inputValue, setInputValue] = useState(value as string || '');
  const [isPending, startTransition] = useTransition();

  // Keep input value in sync if parent resets it
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value as string);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    startTransition(() => {
      onSearch(newValue);
    });
  };

  return (
    <div className="relative w-full flex-1">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        className={`w-full outline-none transition-all duration-200 ${icon ? 'pl-12' : 'pl-4'} pr-4 ${className}`}
        {...props}
      />
    </div>
  );
}
