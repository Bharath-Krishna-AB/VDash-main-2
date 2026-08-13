import React from 'react';
import AdminBottomBar from '@/components/admin/AdminBottomBar';
import KDashLogo from '@/components/ui/KDashLogo';
import SessionKeepAlive from '@/components/teams/SessionKeepAlive';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-[100dvh] bg-transparent font-sans flex flex-col overflow-hidden relative">
      <SessionKeepAlive />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-8 pb-32 md:pb-32 flex flex-col">
        <div className="w-full flex justify-center md:justify-start mb-6 md:mb-8 shrink-0">
          <KDashLogo className="h-8 md:h-10 drop-shadow-sm" />
        </div>
        <div className="w-full flex flex-col gap-6 md:gap-8 flex-1 min-h-0 max-w-7xl mx-auto">
          

          {/* Page Content */}
          <div className="flex-1 min-h-0 flex flex-col">
            {children}
          </div>

        </div>
      </main>

      {/* Floating Bottom Navigation */}
      <AdminBottomBar />
    </div>
  );
}
