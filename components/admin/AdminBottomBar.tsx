'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '../ui/LogoutButton';

export default function AdminBottomBar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname?.startsWith(path);
  };

  const getClassName = (path: string) => {
    return `flex items-center justify-center p-3 md:p-4 rounded-full transition-all duration-300 ${
      isActive(path) 
        ? 'bg-surface-dark text-white shadow-float' 
        : 'text-slate-500 hover:bg-zinc-100/80 hover:text-surface-dark'
    }`;
  };

  return (
    <aside className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 w-[95%] md:w-auto bg-surface/95 backdrop-blur-2xl rounded-[2rem] border border-zinc-200/50 shadow-float flex flex-row items-center py-2 px-2 md:px-4 gap-1 md:gap-2 z-50 justify-between md:justify-center overflow-x-auto hide-scrollbar">
      {/* Menu Items */}

      <Link 
        href="/admin/routes"
        className={getClassName('/admin/routes')}
        title="Routes"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 22h20L12 2z"></path><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path></svg>
      </Link>

      <Link 
        href="/admin/teams"
        className={getClassName('/admin/teams')}
        title="Teams"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
      </Link>
      
      <Link 
        href="/admin/announcements"
        className={getClassName('/admin/announcements')}
        title="Announcements"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
      </Link>
      
      <Link 
        href="/admin/create-account"
        className={getClassName('/admin/create-account')}
        title="Accounts"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
      </Link>

      
      {/* Vertical Divider */}
      <div className="w-[1px] h-8 bg-zinc-200/60 hidden md:block mx-2"></div>

      {/* Logout Button */}
      <LogoutButton 
        className="flex items-center justify-center p-3 md:p-4 rounded-full transition-all duration-300 text-slate-500 hover:bg-zinc-100/80 hover:text-red-500"
        title="Logout"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      </LogoutButton>
    </aside>
  );
}
