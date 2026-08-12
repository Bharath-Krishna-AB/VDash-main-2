import React from 'react';
import TeamManager from '@/components/admin/TeamManager';
import { fetchTeamsData } from './actions';

export default async function AdminTeamsPage() {
  const data = await fetchTeamsData();

  return (
    <div className="h-full">
      <TeamManager 
        initialTeams={data.teams} 
        initialRoutes={data.routes} 
        initialAssignments={data.assignments} 
      />
    </div>
  );
}
