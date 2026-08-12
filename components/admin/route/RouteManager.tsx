'use client';

import { useState } from 'react';
import CheckpointItem, { CheckpointData } from '../CheckpointItem';
import CheckpointModal from './CheckpointModal';
import CheckpointDeleteModal from './CheckpointDeleteModal';
import RouteDeleteModal from './RouteDeleteModal';
import RouteModal from './RouteModal';
import { Input } from '@/components/ui/Input';

import { addCheckpoint, updateCheckpoint, deleteCheckpoint, addRoute, updateRoute, deleteRoute, DBRouteData } from '@/app/admin/routes/actions';

export interface RouteData {
  id: string;
  name: string;
  assignedCheckpoints: { id: string; duration: number }[];
  isActive: boolean;
}

interface RouteManagerProps {
  initialCheckpoints: CheckpointData[];
  initialRoutes: DBRouteData[];
}

export default function RouteManager({ initialCheckpoints, initialRoutes }: RouteManagerProps) {
  const [activeTab, setActiveTab] = useState<'routes' | 'checkpoints'>('routes');
  const [searchQuery, setSearchQuery] = useState('');

  const [checkpoints, setCheckpoints] = useState<CheckpointData[]>(initialCheckpoints);

  const mappedInitialRoutes: RouteData[] = initialRoutes.map(r => ({
    id: r.id!,
    name: r.title,
    assignedCheckpoints: [
      { id: r.ch1, duration: r.duration1 },
      { id: r.ch2, duration: r.duration2 },
      { id: r.ch3, duration: r.duration3 },
      { id: r.ch4, duration: r.duration4 },
      { id: r.ch5, duration: r.duration5 },
    ].filter((c): c is { id: string; duration: number } => c.id != null),
    isActive: true // UI only
  }));

  const [routes, setRoutes] = useState<RouteData[]>(mappedInitialRoutes);

  // Route Editor State
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [draftRoute, setDraftRoute] = useState<RouteData | null>(null);
  
  // Selection State
  const [selectedRoutes, setSelectedRoutes] = useState<Set<string>>(new Set());
  const [selectedCheckpoints, setSelectedCheckpoints] = useState<Set<string>>(new Set());

  // Route Delete State
  const [isRouteDeleteModalOpen, setIsRouteDeleteModalOpen] = useState(false);
  const [deletingRouteIds, setDeletingRouteIds] = useState<string[]>([]);

  // Checkpoint Modal State
  const [isCheckpointModalOpen, setIsCheckpointModalOpen] = useState(false);
  const [editingCheckpoint, setEditingCheckpoint] = useState<CheckpointData | null>(null);
  
  // Checkpoint Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCheckpointIds, setDeletingCheckpointIds] = useState<string[]>([]);
  const [checkpointAffectedRoutes, setCheckpointAffectedRoutes] = useState<{ id: string, name: string }[]>([]);

  // --- CHECKPOINT ACTIONS ---
  const handleCreateCheckpoint = () => {
    setEditingCheckpoint({
      id: '',
      title: '',
      verification: '',
      qrhint: '',
      apphint: ''
    });
    setIsCheckpointModalOpen(true);
  };

  const handleEditCheckpoint = (id: string) => {
    const cp = checkpoints.find(c => c.id === id);
    if (cp) {
      setEditingCheckpoint(cp);
      setIsCheckpointModalOpen(true);
    }
  };

  const handleDeleteCheckpoint = (id: string) => {
    const cp = checkpoints.find(c => c.id === id);
    if (cp) {
      const affected = routes
        .filter(r => r.assignedCheckpoints.some(c => c.id === id))
        .map(r => ({ id: r.id, name: r.name }));
      
      setCheckpointAffectedRoutes(affected);
      setDeletingCheckpointIds([id]);
      setIsDeleteModalOpen(true);
    }
  };

  const handleBulkDeleteCheckpoints = () => {
    if (selectedCheckpoints.size === 0) return;
    const ids = Array.from(selectedCheckpoints);
    const affectedRouteIds = new Set<string>();
    const affected: { id: string, name: string }[] = [];
    routes.forEach(r => {
      if (r.assignedCheckpoints.some(c => ids.includes(c.id))) {
        if (!affectedRouteIds.has(r.id)) {
          affectedRouteIds.add(r.id);
          affected.push({ id: r.id, name: r.name });
        }
      }
    });
    setCheckpointAffectedRoutes(affected);
    setDeletingCheckpointIds(ids);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteCheckpoint = async () => {
    if (deletingCheckpointIds.length === 0) return;
    
    setIsDeleteModalOpen(false);
    
    // Optimistic UI update
    setCheckpoints(checkpoints.filter(c => !deletingCheckpointIds.includes(c.id)));
    setRoutes(routes.map(r => ({
      ...r,
      assignedCheckpoints: r.assignedCheckpoints.filter(c => !deletingCheckpointIds.includes(c.id))
    })));
    setSelectedCheckpoints(new Set());

    try {
      await Promise.all(deletingCheckpointIds.map(id => deleteCheckpoint(id)));
    } catch (error) {
      console.error(error);
    }
    
    setDeletingCheckpointIds([]);
  };

  const handleForceDeleteCheckpoints = async () => {
    if (deletingCheckpointIds.length === 0) return;
    
    setIsDeleteModalOpen(false);

    // Get all routes that need to be completely deleted
    const routesToDelete = checkpointAffectedRoutes.map(r => r.id);
    
    // Optimistic UI update
    setCheckpoints(checkpoints.filter(c => !deletingCheckpointIds.includes(c.id)));
    setRoutes(routes.filter(r => !routesToDelete.includes(r.id)));
    setSelectedCheckpoints(new Set());
    if (draftRoute && routesToDelete.includes(draftRoute.id)) {
      setIsRouteModalOpen(false);
      setDraftRoute(null);
    }

    try {
      // Delete routes first (foreign key constraints)
      await Promise.all(routesToDelete.map(id => deleteRoute(id)));
      // Then delete checkpoints
      await Promise.all(deletingCheckpointIds.map(id => deleteCheckpoint(id)));
    } catch (error) {
      console.error(error);
    }
    
    setDeletingCheckpointIds([]);
  };

  const handleAffectedRouteEdit = (routeId: string) => {
    setIsDeleteModalOpen(false);
    setActiveTab('routes');
    const route = routes.find(r => r.id === routeId);
    if (route) {
      handleEditRoute(route);
    }
  };

  const handleAffectedRouteDelete = (routeId: string) => {
    setIsDeleteModalOpen(false);
    setActiveTab('routes');
    handleDeleteRoute(routeId);
  };

  const handleSaveCheckpoint = async (cp: CheckpointData) => {
    setIsCheckpointModalOpen(false);
    const exists = checkpoints.find(c => c.id === cp.id);
    
    // Optimistic UI update
    if (exists) {
      setCheckpoints(checkpoints.map(c => c.id === cp.id ? cp : c));
      try {
        await updateCheckpoint(cp.id, {
          title: cp.title,
          verification: cp.verification,
          qrhint: cp.qrhint,
          apphint: cp.apphint
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      // Optimistic insert with temporary ID
      setCheckpoints([cp, ...checkpoints]);
      try {
        const { id, ...data } = cp;
        const newCp = await addCheckpoint(data);
        // Swap temp ID with real DB ID
        setCheckpoints(prev => prev.map(c => c.id === cp.id ? newCp : c));
      } catch (error) {
        console.error(error);
        // Remove optimistic insertion on failure
        setCheckpoints(prev => prev.filter(c => c.id !== cp.id));
      }
    }
  };

  // --- ROUTE ACTIONS ---
  const handleCreateRoute = () => {
    if (routes.length >= 5 || checkpoints.length < 5) return;
    const newRoute: RouteData = {
      id: `route_${Date.now()}`,
      name: 'New Custom Route',
      assignedCheckpoints: [],
      isActive: true
    };
    setDraftRoute(newRoute);
    setIsRouteModalOpen(true);
  };

  const handleEditRoute = (route: RouteData) => {
    setDraftRoute({ ...route });
    setIsRouteModalOpen(true);
  };

  const handleSaveRoute = async (routeToSave: RouteData) => {
    setIsRouteModalOpen(false);
    const exists = routes.find(r => r.id === routeToSave.id);
    
    // Convert to DBRouteData format
    const dbData: DBRouteData = {
      title: routeToSave.name,
      ch1: routeToSave.assignedCheckpoints[0]?.id || null,
      ch2: routeToSave.assignedCheckpoints[1]?.id || null,
      ch3: routeToSave.assignedCheckpoints[2]?.id || null,
      ch4: routeToSave.assignedCheckpoints[3]?.id || null,
      ch5: routeToSave.assignedCheckpoints[4]?.id || null,
      duration1: routeToSave.assignedCheckpoints[0]?.duration || 0,
      duration2: routeToSave.assignedCheckpoints[1]?.duration || 0,
      duration3: routeToSave.assignedCheckpoints[2]?.duration || 0,
      duration4: routeToSave.assignedCheckpoints[3]?.duration || 0,
      duration5: routeToSave.assignedCheckpoints[4]?.duration || 0,
    };

    if (exists) {
      // Optimistic Update
      setRoutes(routes.map(r => r.id === routeToSave.id ? routeToSave : r));
      try {
        await updateRoute(routeToSave.id, dbData);
      } catch (error) {
        console.error(error);
      }
    } else {
      // Optimistic Insert
      setRoutes([...routes, routeToSave]);
      try {
        const newRoute = await addRoute(dbData);
        // Swap temp ID with actual DB ID
        setRoutes(prev => prev.map(r => r.id === routeToSave.id ? { ...r, id: newRoute.id! } : r));
      } catch (error) {
        console.error(error);
        setRoutes(prev => prev.filter(r => r.id !== routeToSave.id));
      }
    }
    setDraftRoute(null);
  };

  const handleDeleteRoute = (id: string) => {
    setDeletingRouteIds([id]);
    setIsRouteDeleteModalOpen(true);
  };

  const handleBulkDeleteRoutes = () => {
    if (selectedRoutes.size === 0) return;
    setDeletingRouteIds(Array.from(selectedRoutes));
    setIsRouteDeleteModalOpen(true);
  };

  const handleConfirmDeleteRoute = async () => {
    if (deletingRouteIds.length === 0) return;
    
    setIsRouteDeleteModalOpen(false);

    // Optimistic UI Update
    setRoutes(routes.filter(r => !deletingRouteIds.includes(r.id)));
    setSelectedRoutes(new Set());
    
    try {
      await Promise.all(deletingRouteIds.map(id => deleteRoute(id)));
    } catch (error) {
      console.error(error);
    }
    
    setDeletingRouteIds([]);
  };

  // --- RENDER HELPERS ---
  const filteredRoutes = routes.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCheckpoints = checkpoints.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Render Checkpoints Tab
  const renderCheckpointsTab = () => (
    <section className="flex flex-col h-full min-h-0 relative p-5 lg:p-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 shrink-0">
        <div>
          <h3 className="text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight normal-case shrink-0">Checkpoints Library</h3>
          <p className="text-zinc-500 font-medium text-sm mt-1">Manage global physical locations (Unlimited).</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 w-full flex-1 md:ml-8">
          <div className="relative w-full flex-1 max-w-lg">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search checkpoints..."
              className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 rounded-full py-2.5 pl-12 pr-4 text-sm text-zinc-900 font-semibold transition-all duration-200 outline-none placeholder:text-zinc-400"
            />
          </div>
          
          <button 
            onClick={handleCreateCheckpoint}
            className="flex items-center justify-center gap-2 bg-zinc-950 text-white w-full sm:w-auto px-6 py-2.5 rounded-full font-semibold text-sm shadow-xl shadow-zinc-950/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Create Checkpoint</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-2 flex flex-col gap-4">
        {filteredCheckpoints.length > 0 && (
          <div className="flex justify-end mb-1">
            <button 
              onClick={() => {
                if (selectedCheckpoints.size === filteredCheckpoints.length) {
                  setSelectedCheckpoints(new Set());
                } else {
                  setSelectedCheckpoints(new Set(filteredCheckpoints.map(cp => cp.id)));
                }
              }}
              className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-2"
            >
              {selectedCheckpoints.size === filteredCheckpoints.length && filteredCheckpoints.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        )}
        {filteredCheckpoints.length === 0 ? (
          <div className="text-center text-zinc-400 py-12 text-lg font-bold flex flex-col items-center justify-center gap-3">
            No checkpoints found.
          </div>
        ) : (
          filteredCheckpoints.map(cp => (
            <CheckpointItem 
              key={cp.id}
                checkpoint={cp}
                onEdit={handleEditCheckpoint}
                onRemove={handleDeleteCheckpoint}
                onPrintQR={(id) => console.log('Print QR', id)}
                selectable={true}
                selected={selectedCheckpoints.has(cp.id)}
                onSelect={toggleCheckpointSelection}
              />
          ))
        )}
      </div>
    </section>
  );

  // Render Routes Tab (Overview)
  const toggleRouteSelection = (id: string) => {
    const newSet = new Set(selectedRoutes);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRoutes(newSet);
  };

  const toggleCheckpointSelection = (id: string) => {
    const newSet = new Set(selectedCheckpoints);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedCheckpoints(newSet);
  };

  const renderRoutesOverview = () => (
    <section className="flex flex-col h-full min-h-0 relative p-5 lg:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 shrink-0">
        <div>
          <h3 className="text-3xl lg:text-4xl font-bold text-zinc-900 tracking-tight normal-case shrink-0">Route Library</h3>
          <p className="text-zinc-500 font-medium text-sm mt-1">Manage game paths (Max 5).</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 w-full flex-1 md:ml-8">
          <div className="relative w-full flex-1 max-w-lg">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search routes..."
              className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 rounded-full py-2.5 pl-12 pr-4 text-sm text-zinc-900 font-semibold transition-all duration-200 outline-none placeholder:text-zinc-400"
            />
          </div>
          
          <div className="flex flex-col items-end gap-1 w-full sm:w-auto shrink-0">
            <button 
              onClick={handleCreateRoute}
              disabled={routes.length >= 5 || checkpoints.length < 5}
              className="flex items-center justify-center gap-2 bg-zinc-950 text-white w-full px-6 py-2.5 rounded-full font-semibold text-sm shadow-xl shadow-zinc-950/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Create Route ({routes.length}/5)</span>
            </button>
            {checkpoints.length < 5 && (
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest px-2">
                Requires 5 Checkpoints
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-2 flex flex-col gap-4">
        {filteredRoutes.length > 0 && (
          <div className="flex justify-end mb-1">
            <button 
              onClick={() => {
                if (selectedRoutes.size === filteredRoutes.length) {
                  setSelectedRoutes(new Set());
                } else {
                  setSelectedRoutes(new Set(filteredRoutes.map(r => r.id)));
                }
              }}
              className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-2"
            >
              {selectedRoutes.size === filteredRoutes.length && filteredRoutes.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        )}
        {filteredRoutes.length === 0 ? (
          <div className="text-center text-zinc-400 py-12 text-lg font-bold flex flex-col items-center justify-center gap-3">
            No routes found.
          </div>
        ) : (
          filteredRoutes.map((route) => {
            const totalSeconds = route.assignedCheckpoints.reduce((acc, cp) => acc + (cp.duration || 0), 0);
            const m = Math.floor(totalSeconds / 60);
            const s = totalSeconds % 60;
            const timeString = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            
            return (
            <div 
              key={route.id} 
              className={`group flex items-center gap-4 p-4 rounded-[1.5rem] transition-all shrink-0 w-full hover:shadow-sm border ${selectedRoutes.has(route.id) ? 'bg-white border-zinc-900 shadow-md ring-1 ring-zinc-900' : 'bg-zinc-50 border-zinc-100 hover:border-zinc-200'}`}
            >
              {/* Checkbox */}
              <div 
                className="shrink-0 pl-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRouteSelection(route.id);
                }}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${selectedRoutes.has(route.id) ? 'bg-zinc-900 border-zinc-900 text-white opacity-100' : 'border-zinc-300 opacity-0 group-hover:opacity-100 group-hover:border-zinc-400'}`}>
                  {selectedRoutes.has(route.id) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
              </div>
              
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl uppercase shadow-sm">
                  {route.name.substring(0, 2)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="font-bold text-zinc-900 text-lg truncate">{route.name}</h4>
                <div className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-zinc-400 mt-0.5">
                  <span className="truncate">{route.assignedCheckpoints.length} checkpoints</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300 shrink-0"></span>
                  <span className="truncate">{timeString}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300 shrink-0"></span>
                  <span className="truncate">ID: {route.id}</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 pr-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEditRoute(route); }}
                  className="p-2.5 bg-white rounded-full text-zinc-400 hover:text-blue-600 border border-zinc-100 hover:border-blue-400 transition-all shadow-sm hover:shadow"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteRoute(route.id); }}
                  className="p-2.5 bg-white rounded-full text-zinc-400 hover:text-red-500 border border-zinc-100 hover:border-red-400 transition-all shadow-sm hover:shadow"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </div>
          )})
        )}
      </div>
    </section>
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top Level Tabs */}
      <div className="flex items-center bg-white border border-zinc-100 shadow-sm rounded-full p-1.5 w-fit self-center md:self-start shrink-0 mb-2">
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === 'routes' ? 'bg-zinc-950 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Routes Library
          </button>
          <button
            onClick={() => setActiveTab('checkpoints')}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === 'checkpoints' ? 'bg-zinc-950 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Checkpoints Library
          </button>
        </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 bg-white border border-zinc-100 shadow-sm rounded-[2rem] md:rounded-[2.5rem] relative">
        {activeTab === 'routes' ? renderRoutesOverview() : renderCheckpointsTab()}
        
        {/* Bulk Action Bar */}
        {(selectedRoutes.size > 0 && activeTab === 'routes') || (selectedCheckpoints.size > 0 && activeTab === 'checkpoints') ? (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-top-4 z-50">
            <div className="font-semibold text-sm">
              {activeTab === 'routes' ? selectedRoutes.size : selectedCheckpoints.size} selected
            </div>
            <div className="w-px h-6 bg-zinc-700"></div>
            <button 
              onClick={() => activeTab === 'routes' ? handleBulkDeleteRoutes() : handleBulkDeleteCheckpoints()}
              className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Delete
            </button>
            <button 
              onClick={() => activeTab === 'routes' ? setSelectedRoutes(new Set()) : setSelectedCheckpoints(new Set())}
              className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors ml-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        ) : null}
      </div>

      <RouteModal
        isOpen={isRouteModalOpen}
        initialData={draftRoute}
        checkpoints={checkpoints}
        onClose={() => setIsRouteModalOpen(false)}
        onSave={handleSaveRoute}
      />

        {/* Route Delete Confirmation Modal */}
        <RouteDeleteModal 
          isOpen={isRouteDeleteModalOpen}
          routeName={deletingRouteIds.length > 1 ? `${deletingRouteIds.length} Routes` : (routes.find(r => r.id === deletingRouteIds[0])?.name || 'Untitled Route')}
          onClose={() => setIsRouteDeleteModalOpen(false)}
          onConfirm={handleConfirmDeleteRoute}
        />

      {/* Checkpoint Modal */}
      <CheckpointModal 
        isOpen={isCheckpointModalOpen}
        initialData={editingCheckpoint || null}
        onClose={() => setIsCheckpointModalOpen(false)}
        onSave={handleSaveCheckpoint}
      />

      {/* Delete Confirmation Modal */}
      <CheckpointDeleteModal 
        isOpen={isDeleteModalOpen}
        checkpointName={deletingCheckpointIds.length > 1 ? `${deletingCheckpointIds.length} Checkpoints` : (checkpoints.find(c => c.id === deletingCheckpointIds[0])?.title || 'Untitled Checkpoint')}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteCheckpoint}
        affectedRoutes={checkpointAffectedRoutes}
        onEditRoute={handleAffectedRouteEdit}
        onDeleteRoute={handleAffectedRouteDelete}
        onForceDeleteAll={handleForceDeleteCheckpoints}
      />
    </div>
  );
}
