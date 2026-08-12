import React from 'react';
import RouteItem, { RouteItemProps } from './RouteItem';

export interface RouteData extends Omit<RouteItemProps, 'onClick' | 'onDelete'> {
  id: string;
}

interface RouteListProps {
  routes: RouteData[];
  onSelectRoute?: (id: string) => void;
  onDeleteRoute?: (id: string) => void;
  onCreateRoute?: () => void;
}

export default function RouteList({ routes, onSelectRoute, onDeleteRoute, onCreateRoute }: RouteListProps) {
  return (
    <div className="w-full h-full flex flex-col bg-surface rounded-[2rem] border-2 border-zinc-100 shadow-xl overflow-hidden min-h-0">
      <div className="p-6 lg:p-8 pb-4 flex justify-between items-center shrink-0 border-b-2 border-zinc-50 mb-4">
        <h2 className="text-3xl font-display font-bold text-surface-dark tracking-tight [-webkit-text-stroke:1px_currentColor]">Routes List</h2>
        <button 
          onClick={onCreateRoute}
          className="bg-surface-dark text-white p-2.5 rounded-full hover:bg-brand-primary transition-all shadow-sm hover:shadow hover:-translate-y-0.5"
          title="Create New Route"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
      <div className="overflow-y-auto px-4 pb-4 flex flex-col gap-2 flex-1 min-h-0">
        {routes.map((route) => (
          <RouteItem 
            key={route.id}
            name={route.name}
            checkpointsCount={route.checkpointsCount}
            isActive={route.isActive}
            onClick={() => onSelectRoute?.(route.id)}
            onDelete={() => onDeleteRoute?.(route.id)}
          />
        ))}
      </div>
    </div>
  );
}
