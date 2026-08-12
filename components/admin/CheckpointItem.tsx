import React from 'react';

export interface CheckpointData {
  id: string;
  index?: number;
  title: string;
  description?: string;
  verification: string;
  qrhint: string;
  apphint: string;
  created_at?: string;
}

interface CheckpointItemProps {
  checkpoint: CheckpointData;
  isLast?: boolean;
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
  onPrintQR?: (id: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export default function CheckpointItem({ checkpoint, onEdit, onRemove, onPrintQR, selectable = false, selected = false, onSelect }: CheckpointItemProps) {
  return (
    <div className={`relative ${checkpoint.index ? 'pl-8 md:pl-12' : ''} w-full group`}>
      {/* Timeline Node - Only show if index exists */}
      {checkpoint.index && (
        <div className="absolute left-0 top-6 -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white border-4 border-zinc-950 shadow-sm z-10 transition-transform group-hover:scale-110">
          <span className="font-bold text-zinc-950">{checkpoint.index}</span>
        </div>
      )}

      {/* Card Content (Read-Only Tile) */}
      <div 
        className={`group flex items-center gap-4 p-4 rounded-[1.5rem] transition-all shrink-0 w-full hover:shadow-sm border ${selected ? 'bg-white border-zinc-900 shadow-md ring-1 ring-zinc-900' : 'bg-zinc-50 border-zinc-100 hover:border-zinc-200'}`}
      >
        {selectable && (
          <div 
            className="shrink-0 pl-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(checkpoint.id);
            }}
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${selected ? 'bg-zinc-900 border-zinc-900 text-white opacity-100' : 'border-zinc-300 opacity-0 group-hover:opacity-100 group-hover:border-zinc-400'}`}>
              {selected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
            </div>
          </div>
        )}
        
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl uppercase shadow-sm">
            {(checkpoint.title || 'U').substring(0, 2)}
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 className="font-bold text-zinc-900 text-lg truncate">{checkpoint.title || 'Untitled Checkpoint'}</h4>
          <div className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-zinc-400 mt-0.5">
            <span className="truncate">{checkpoint.description || checkpoint.verification}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-300 shrink-0"></span>
            <span className="truncate">ID: {checkpoint.id}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 pr-2">
          {onEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(checkpoint.id); }}
              className="p-2.5 bg-white rounded-full text-zinc-400 hover:text-blue-600 border border-zinc-100 hover:border-blue-400 transition-all shadow-sm hover:shadow"
              title="Edit Checkpoint"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
          )}
          {onRemove && (
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(checkpoint.id); }}
              className="p-2.5 bg-white rounded-full text-zinc-400 hover:text-red-500 border border-zinc-100 hover:border-red-400 transition-all shadow-sm hover:shadow"
              title="Delete Checkpoint"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          )}
          {onPrintQR && (
            <button 
              onClick={(e) => { e.stopPropagation(); onPrintQR(checkpoint.id); }}
              className="p-2.5 bg-white rounded-full text-zinc-400 hover:text-zinc-900 border border-zinc-100 hover:border-zinc-300 transition-all shadow-sm hover:shadow"
              title="Print QR Code"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
