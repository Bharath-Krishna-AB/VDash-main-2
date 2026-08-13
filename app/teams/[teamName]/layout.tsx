import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import FooterActions from '@/components/layout/FooterActions';
import ModalsContainer from '@/components/modals/ModalsContainer';
import { GameProvider } from '@/components/teams/GameContext';
import AppTutorial from '@/components/teams/AppTutorial';
import SessionKeepAlive from '@/components/teams/SessionKeepAlive';

export default async function DashboardLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode,
  params: Promise<{ teamName: string }>
}) {
  const resolvedParams = await params;
  const decodedTeamName = decodeURIComponent(resolvedParams.teamName);

  return (
    <div className="w-full h-[100dvh] bg-transparent flex flex-col relative overflow-hidden mx-auto">
      <GameProvider teamName={decodedTeamName}>
        <SessionKeepAlive />
        <Header />
        <main className="flex-1 w-full max-w-[480px] mx-auto relative h-full flex flex-col pt-[100px]">
          {children}
        </main>
        <FooterActions />
        <Suspense fallback={null}>
          <ModalsContainer />
        </Suspense>
        <Suspense fallback={null}>
          <AppTutorial />
        </Suspense>
      </GameProvider>
    </div>
  );
}
