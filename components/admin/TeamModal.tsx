import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProfileData } from './TeamManager';
import { DBRouteData } from '@/app/admin/routes/actions';
import { AssignRouteData } from '@/app/admin/teams/actions';

interface TeamModalProps {
  isOpen: boolean;
  initialTeam: ProfileData | null;
  initialAssignment?: AssignRouteData;
  availableRoutes: DBRouteData[];
  isPending: boolean;
  onClose: () => void;
  onSave: (routeId: string) => void;
  onUnassign: () => void;
}

export default function TeamModal({ isOpen, initialTeam, initialAssignment, availableRoutes, isPending, onClose, onSave, onUnassign }: TeamModalProps) {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSelectedRouteId(initialAssignment?.routeid || '');
    } else {
      setSelectedRouteId('');
    }
  }

  if (!isOpen || !initialTeam) return null;

  const isSavable = selectedRouteId.trim().length > 0 && selectedRouteId !== initialAssignment?.routeid;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 border border-zinc-100">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 p-6 md:p-8 border-b border-zinc-100 shrink-0 bg-white z-10">
          <div className="flex-1 max-w-lg">
            <h2 className="font-bold text-3xl tracking-tight text-zinc-900 mb-2">
              Manage Assignment
            </h2>
            <p className="text-zinc-500 font-medium text-sm mb-4">Assign a route to {initialTeam?.username} and manage their journey.</p>
          </div>
          <div className="flex flex-col gap-4 md:items-end shrink-0">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isPending}
                className="px-6 py-2.5 rounded-full font-bold text-zinc-500 hover:bg-zinc-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(selectedRouteId)}
                disabled={!isSavable || isPending}
                className="bg-zinc-950 text-white font-bold py-2.5 px-6 rounded-full shadow-lg shadow-zinc-950/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
              >
                {isPending ? 'Saving...' : 'Save Team'}
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-zinc-50/50">
          <div className="flex flex-col gap-10 max-w-3xl mx-auto">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 text-white rounded-2xl p-5 shadow-lg">
              <div>
                <h3 className="font-bold text-lg tracking-tight">Need to update team details?</h3>
                <p className="text-zinc-400 font-medium text-sm mt-0.5">Team names, PINs, and phone numbers are managed in the accounts section.</p>
              </div>
              <Link 
                href={`/admin/create-account?edit=${initialTeam?.password}`} 
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-zinc-900 rounded-xl font-bold text-sm shadow-sm hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
              >
                Go to Accounts
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
              </Link>
            </div>

            {/* Route Assignment Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl tracking-tight text-zinc-900">Route Assignment</h3>
                  <p className="text-sm font-semibold text-zinc-500">Select the path this team will follow.</p>
                </div>
                {initialAssignment && (
                  <button
                    onClick={onUnassign}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-zinc-500 bg-zinc-50 border border-zinc-200 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-95 text-sm"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    Clear Route
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableRoutes.map(route => {
                  if (!route.id) return null;
                  const isSelected = selectedRouteId === route.id;
                  const checkpointsCount = [route.ch1, route.ch2, route.ch3, route.ch4, route.ch5].filter(c => c != null).length || 5;

                  return (
                    <div 
                      key={route.id}
                      onClick={() => setSelectedRouteId(route.id as string)}
                      className={`relative flex flex-col p-5 rounded-[1.5rem] cursor-pointer transition-all duration-300 border-2 ${
                        isSelected 
                          ? 'border-zinc-900 bg-white shadow-md' 
                          : 'border-zinc-100 bg-white hover:border-zinc-300 hover:shadow-sm'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-5 right-5 text-zinc-900 animate-in zoom-in duration-300">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                      )}
                      
                      <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center mb-4 transition-colors ${
                        isSelected ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20' : 'bg-zinc-100 text-zinc-400'
                      }`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l2-9 4 18 2-9h4"></path></svg>
                      </div>
                      <h4 className={`font-bold text-lg transition-colors ${isSelected ? 'text-zinc-900' : 'text-zinc-700'}`}>{route.title}</h4>
                      <p className={`font-bold text-xs mt-1 transition-colors uppercase tracking-widest ${isSelected ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {checkpointsCount} Checkpoints
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
