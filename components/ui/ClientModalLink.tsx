'use client';
import React from 'react';

interface ClientModalLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  modal: string;
  children: React.ReactNode;
}

export default function ClientModalLink({ 
  modal, 
  children, 
  className = '', 
  id,
  title,
  'aria-label': ariaLabel,
  ...props
}: ClientModalLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    if (modal) {
      url.searchParams.set('modal', modal);
    } else {
      url.searchParams.delete('modal');
    }
    window.history.pushState(null, '', url.toString());
  };

  return (
    <button
      id={id}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
      title={title}
      {...props}
    >
      {children}
    </button>
  );
}
