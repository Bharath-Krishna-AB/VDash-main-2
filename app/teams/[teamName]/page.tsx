import React from 'react';
import TimerCard from '@/components/teams/TimerCard';

export default async function DashboardPage({ params }: { params: Promise<{ teamName: string }> }) {
  const resolvedParams = await params;
  const decodedTeamName = decodeURIComponent(resolvedParams.teamName);

  return (
    <TimerCard teamName={decodedTeamName} />
  );
}
