'use client';

import React, { useState, useMemo, useTransition } from 'react';
import TeamModal from './TeamModal';
import { AssignRouteData, assignRouteToTeam, unassignRouteFromTeam } from '@/app/admin/teams/actions';
import { DBRouteData } from '@/app/admin/routes/actions';

export interface ProfileData {
  id: string;
  username: string;
  phonenumber?: string;
  password?: string;
  role: string;
}

interface TeamManagerProps {
  initialTeams: ProfileData[];
  initialRoutes: DBRouteData[];
  initialAssignments: AssignRouteData[];
}

export default function TeamManager({ initialTeams, initialRoutes, initialAssignments }: TeamManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftTeam, setDraftTeam] = useState<{ team: ProfileData, assignment?: AssignRouteData } | null>(null);

  // Derived state for directory view
  const { unassignedTeams, groupedAssignedTeams } = useMemo(() => {
    const filtered = initialTeams.filter(t => 
      t.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.password && t.password.toString().includes(searchQuery))
    );
    
    const unassigned: ProfileData[] = [];
    const grouped = new Map<string, { team: ProfileData, assignment: AssignRouteData }[]>();

    filtered.forEach(team => {
      const assignment = initialAssignments.find(a => a.teamid === team.id);
      if (!assignment) {
        unassigned.push(team);
      } else {
        if (!grouped.has(assignment.routeid)) {
          grouped.set(assignment.routeid, []);
        }
        grouped.get(assignment.routeid)!.push({ team, assignment });
      }
    });
    
    return { unassignedTeams: unassigned, groupedAssignedTeams: grouped };
  }, [initialTeams, initialAssignments, searchQuery]);

  const handleEditTeam = (team: ProfileData, assignment?: AssignRouteData) => {
    setDraftTeam({ team, assignment });
    setIsModalOpen(true);
  };

  const handleSaveTeam = (teamId: string, routeId: string) => {
    startTransition(() => {
      assignRouteToTeam(teamId, routeId).then(() => {
        setIsModalOpen(false);
        setDraftTeam(null);
      }).catch(err => {
        console.error("Failed to assign route", err);
      });
    });
  };

  const handleUnassignTeam = (teamId: string) => {
    startTransition(() => {
      unassignRouteFromTeam(teamId).then(() => {
        setIsModalOpen(false);
        setDraftTeam(null);
      }).catch(err => {
        console.error("Failed to unassign route", err);
      });
    });
  };

  const renderTeamCard = (team: ProfileData, assignment?: AssignRouteData, route?: DBRouteData) => {
    // Determine progress
    let progress = 0;
    let checkpointsCount = 5; // Default max
    if (assignment) {
      progress = [assignment.check1, assignment.check2, assignment.check3, assignment.check4, assignment.check5].filter(Boolean).length;
    }
    
    let percent = 0;
    let isCompleted = false;
    
    if (assignment && route) {
      // Find actual number of checkpoints assigned in the route
      // We assume `ch1` to `ch5` being populated means they are checkpoints.
      checkpointsCount = [route.ch1, route.ch2, route.ch3, route.ch4, route.ch5].filter(c => c != null).length;
      if (checkpointsCount === 0) checkpointsCount = 5; // Fallback
      
      percent = Math.round((progress / checkpointsCount) * 100);
      isCompleted = progress >= checkpointsCount;
    }

    return (
      <div 
        key={team.id}
        className="group flex flex-col gap-4 p-4 rounded-[1.5rem] bg-zinc-50 border border-zinc-100 transition-all hover:border-zinc-200 shrink-0 hover:shadow-sm"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-display text-xl shrink-0 uppercase font-bold shadow-sm relative bg-zinc-900">
              {team.username.substring(0, 2)}
              {assignment && isCompleted ? (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              ) : assignment ? (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></div>
              ) : (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-zinc-400 border-2 border-white rounded-full"></div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-zinc-900 text-lg truncate">{team.username}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="font-bold text-zinc-400 text-xs tracking-wide flex items-center gap-1.5 truncate">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  PIN: {team.password || 'N/A'}
                </div>
                {team.phonenumber && (
                  <>
                    <div className="w-1 h-1 bg-zinc-300 rounded-full shrink-0"></div>
                    <div className="font-bold text-zinc-400 text-xs tracking-wide flex items-center gap-1.5 truncate">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      {team.phonenumber}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-2 shrink-0 pr-2">
            <button 
              onClick={() => handleEditTeam(team, assignment)}
              disabled={isPending}
              className="p-2.5 bg-white rounded-full text-zinc-400 hover:text-zinc-900 border border-zinc-100 hover:border-zinc-300 transition-all shadow-sm hover:shadow disabled:opacity-50"
              title={assignment ? "Manage Assignment" : "Assign Route"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {assignment ? (
                  <><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></>
                ) : (
                  <><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Track */}
        {assignment && route && (
          <div className="flex flex-col gap-2.5 bg-white rounded-xl p-3.5 border border-zinc-100/50 shadow-sm">
            <div className="flex justify-between items-center text-[10px] font-black px-1">
              <span className="uppercase tracking-widest flex items-center gap-1.5 text-zinc-900">
                {!isCompleted && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                )}
                {isCompleted ? 'Route Completed' : `Checkpoint ${Math.min(progress + 1, checkpointsCount)}`}
              </span>
              <span className="text-zinc-400 tracking-wider">{percent}%</span>
            </div>
            <div className="h-2 flex gap-1.5">
              {Array.from({ length: checkpointsCount }).map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 h-full rounded-full transition-colors duration-500 ${
                    i < progress 
                      ? 'bg-zinc-900' 
                      : i === progress && !isCompleted
                        ? 'bg-blue-500' 
                        : 'bg-zinc-100'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] md:rounded-[2.5rem] border border-zinc-100 shadow-sm p-4 md:p-6 lg:p-8 min-h-0 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 shrink-0 border-b border-zinc-100 pb-6">
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight normal-case shrink-0">Route Assignments & Progress</h2>
          <p className="text-zinc-500 font-medium text-sm mt-1">Assign routes to teams and monitor their live progress in real-time.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-80">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Name or PIN..."
              className="w-full bg-zinc-50 border-2 border-transparent rounded-full pl-11 pr-5 py-3 font-bold text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all shadow-sm placeholder:text-zinc-400"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        
        {/* Unassigned Teams Section */}
        {unassignedTeams.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6 pl-2">
              <div className="w-2.5 h-2.5 rounded-full shadow-md bg-amber-400"></div>
              <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Unassigned Teams</h3>
              <span className="bg-zinc-100 text-zinc-500 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">{unassignedTeams.length} Teams</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {unassignedTeams.map(team => renderTeamCard(team))}
            </div>
          </div>
        )}

        {/* Assigned Teams Section */}
        {initialRoutes.map(route => {
          if (!route.id) return null;
          const routeTeams = groupedAssignedTeams.get(route.id) || [];
          if (routeTeams.length === 0) return null;

          return (
            <div key={route.id} className="mb-10 last:mb-0">
              <div className="flex items-center gap-3 mb-6 pl-2">
                <div className="w-2.5 h-2.5 rounded-full shadow-md shadow-green-500/40 bg-green-500"></div>
                <h3 className="text-xl font-bold text-zinc-900 tracking-tight">{route.title}</h3>
                <span className="bg-zinc-100 text-zinc-500 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">{routeTeams.length} Teams</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {routeTeams.map(({ team, assignment }) => renderTeamCard(team, assignment, route))}
              </div>
            </div>
          );
        })}
        
        {unassignedTeams.length === 0 && Array.from(groupedAssignedTeams.keys()).length === 0 && (
          <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-[2rem] p-12 text-center max-w-xl mx-auto mt-12">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400 shadow-sm border border-zinc-100">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <h4 className="font-bold text-zinc-900 text-2xl mb-2">No Teams Found</h4>
            <p className="text-zinc-500 font-medium text-base">Wait for teams to be created to assign them routes.</p>
          </div>
        )}
      </div>

      <TeamModal 
        isOpen={isModalOpen}
        initialTeam={draftTeam?.team || null}
        initialAssignment={draftTeam?.assignment}
        availableRoutes={initialRoutes}
        isPending={isPending}
        onClose={() => {
          setIsModalOpen(false);
          setDraftTeam(null);
        }}
        onSave={(routeId) => {
          if (draftTeam?.team.id) {
            handleSaveTeam(draftTeam.team.id, routeId);
          }
        }}
        onUnassign={() => {
          if (draftTeam?.team.id) {
            handleUnassignTeam(draftTeam.team.id);
          }
        }}
      />
    </div>
  );
}
