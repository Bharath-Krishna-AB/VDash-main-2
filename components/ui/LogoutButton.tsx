'use client';
import React from 'react';
import { logout } from '@/app/login/action';


export interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onBeforeLogout?: () => Promise<boolean | void> | boolean | void;
}

export function LogoutButton({ className, children, onBeforeLogout, ...props }: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) {
      props.onClick(e);
      if (e.defaultPrevented) return;
    }

    if (onBeforeLogout) {
      setIsLoggingOut(true);
      const shouldProceed = await onBeforeLogout();
      if (shouldProceed === false) {
        setIsLoggingOut(false);
        return;
      }
    }

    setIsLoggingOut(true);
    await logout();
  };


  return (
    <button onClick={handleLogout} disabled={isLoggingOut} className={className} {...props}>
      {children}
    </button>
  );
}
