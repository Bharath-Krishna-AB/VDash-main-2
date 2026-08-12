import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { RouteData } from './RouteManager';
import { CheckpointData } from '../CheckpointItem';

interface RouteModalProps {
  isOpen: boolean;
  initialData: RouteData | null;
  checkpoints: CheckpointData[];
  onClose: () => void;
  onSave: (data: RouteData) => void;
}

export default function RouteModal({ isOpen, initialData, checkpoints, onClose, onSave }: RouteModalProps) {
  const [formData, setFormData] = useState<RouteData | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen && initialData) {
      setFormData(initialData);
    } else if (!isOpen) {
      setFormData(null);
    }
  }

  if (!isOpen || !formData) return null;

  const toggleCheckpoint = (cpId: string) => {
    const isAssigned = formData.assignedCheckpoints.some(c => c.id === cpId);
    let newAssigned = [...formData.assignedCheckpoints];
    
    if (isAssigned) {
      newAssigned = newAssigned.filter(c => c.id !== cpId);
    } else {
      if (newAssigned.length >= 5) return;
      newAssigned.push({ id: cpId, duration: 60 });
    }
    
    setFormData({ ...formData, assignedCheckpoints: newAssigned });
  };

  const isSavable = formData.assignedCheckpoints.length === 5 && formData.name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 border border-zinc-100">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 p-6 md:p-8 border-b border-zinc-100 shrink-0 bg-white z-10">
          <div className="flex-1 max-w-lg">
            <h2 className="font-bold text-3xl tracking-tight text-zinc-900 mb-4">
              {initialData && initialData.name !== 'New Custom Route' ? 'Edit Route' : 'Create Route'}
            </h2>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              label="Route Name"
              placeholder="e.g. Freshman Orientation" 
            />
          </div>
          <div className="flex flex-col gap-4 md:items-end shrink-0">
            <div className="flex flex-col gap-1 items-end">
              <span className="text-zinc-400 font-bold text-xs tracking-widest uppercase">Assigned Checkpoints</span>
              <span className={`text-4xl font-display font-bold ${isSavable ? 'text-green-500' : 'text-zinc-900'}`}>
                {formData.assignedCheckpoints.length} <span className="text-2xl text-zinc-300">/ 5</span>
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full font-bold text-zinc-500 hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(formData)}
                disabled={!isSavable}
                className="bg-zinc-950 text-white font-bold py-2.5 px-6 rounded-full shadow-lg shadow-zinc-950/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
              >
                Save Route
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-zinc-50/50">
          <div className="flex flex-col gap-8 max-w-3xl mx-auto">
            {/* Available Checkpoints */}
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-xl tracking-tight text-zinc-900">Available Checkpoints</h4>
              <p className="text-sm font-semibold text-zinc-500">Select exactly 5 global checkpoints to assign to this route.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {checkpoints.map(cp => {
                  const isAssigned = formData.assignedCheckpoints.some(c => c.id === cp.id);
                  return (
                    <div 
                      key={cp.id}
                      onClick={() => toggleCheckpoint(cp.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        isAssigned 
                          ? 'border-zinc-900 bg-white shadow-md' 
                          : 'border-zinc-100 bg-white hover:border-zinc-300'
                      } ${!isAssigned && formData.assignedCheckpoints.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-bold text-zinc-900 text-[15px] truncate">{cp.title || 'Untitled'}</span>
                        <span className="text-[11px] font-bold text-zinc-400 tracking-widest uppercase truncate">{cp.verification}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isAssigned ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-200'
                      }`}>
                        {isAssigned && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        )}
                      </div>
                    </div>
                  );
                })}
                {checkpoints.length === 0 && (
                  <div className="col-span-full p-8 text-center text-zinc-400 font-bold border-2 border-dashed border-zinc-200 rounded-[1.5rem]">
                    No global checkpoints created yet. Go to the Checkpoints tab to create some!
                  </div>
                )}
              </div>
            </div>
            
            {/* Route Flow */}
            {formData.assignedCheckpoints.length > 0 && (
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-xl tracking-tight text-zinc-900">Route Flow & Duration</h4>
                <div className="flex flex-col gap-3">
                  {formData.assignedCheckpoints.map((ac, idx) => {
                    const cp = checkpoints.find(c => c.id === ac.id);
                    if (!cp) return null;
                    return (
                      <div key={ac.id} className="flex items-center gap-4 bg-white border border-zinc-200 shadow-sm p-3 pr-4 rounded-[1.25rem] transition-all hover:shadow-md hover:border-zinc-300">
                        <div className="w-10 h-10 bg-zinc-100 text-zinc-900 rounded-xl flex items-center justify-center font-display font-bold text-lg flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 font-bold text-zinc-900 text-base truncate">{cp.title}</div>
                        
                        {/* Premium Duration UX */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={(e) => {
                               e.stopPropagation();
                               const newArr = [...formData.assignedCheckpoints];
                               newArr[idx].duration = Math.max(0, ac.duration - 10);
                               setFormData({ ...formData, assignedCheckpoints: newArr });
                            }}
                            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          </button>
                          
                          <div className="relative w-24">
                            <input
                              type="number"
                              min="0"
                              value={ac.duration}
                              onChange={(e) => {
                                const newArr = [...formData.assignedCheckpoints];
                                newArr[idx].duration = parseInt(e.target.value) || 0;
                                setFormData({ ...formData, assignedCheckpoints: newArr });
                              }}
                              className="w-full bg-white border-2 border-zinc-200 rounded-xl py-2 px-3 pr-8 text-center font-bold text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs pointer-events-none">
                              sec
                            </span>
                          </div>
                          
                          <button 
                            onClick={(e) => {
                               e.stopPropagation();
                               const newArr = [...formData.assignedCheckpoints];
                               newArr[idx].duration = ac.duration + 10;
                               setFormData({ ...formData, assignedCheckpoints: newArr });
                            }}
                            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
