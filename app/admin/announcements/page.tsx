'use client';

import React, { useState, useEffect } from 'react';
import { broadcastAnnouncement, getAvailableRoutes } from './actions';

export default function AdminAnnouncementsPage() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [routeId, setRouteId] = useState<string>('');
  const [routes, setRoutes] = useState<{id: string, title: string}[]>([]);

  useEffect(() => {
    async function loadRoutes() {
      const data = await getAvailableRoutes();
      setRoutes(data);
    }
    loadRoutes();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('loading');
    try {
      await broadcastAnnouncement(message.trim(), routeId === '' ? null : routeId);
      setStatus('success');
      setMessage('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-dark border-[3px] border-zinc-100 rounded-[2.5rem] p-6 sm:p-8 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight uppercase">Broadcast Announcement</h2>
          <p className="text-sm font-semibold text-zinc-400 mt-1">Send a live popup message to all active teams.</p>
        </div>
      </div>

      <form onSubmit={handleSend} className="flex flex-col flex-1 min-h-0 gap-5">
        <select
          value={routeId}
          onChange={(e) => setRouteId(e.target.value)}
          className="w-full rounded-[1.5rem] bg-zinc-900 border-[3px] border-zinc-800 text-white p-4 focus:outline-none focus:border-zinc-700 transition-colors font-medium appearance-none"
          disabled={status === 'loading'}
        >
          <option value="">All Teams (Default)</option>
          {routes.map(r => (
            <option key={r.id} value={r.id}>{r.title}</option>
          ))}
        </select>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your announcement here..."
          className="w-full flex-1 min-h-[200px] resize-none rounded-[1.5rem] bg-zinc-900 border-[3px] border-zinc-800 text-white p-5 focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-500 font-medium"
          disabled={status === 'loading'}
        />

        <button
          type="submit"
          disabled={!message.trim() || status === 'loading'}
          className="w-full py-4 rounded-full font-bold transition-all duration-300 ease-out active:scale-[0.98] text-lg bg-zinc-100 text-surface-dark hover:bg-white disabled:opacity-50 disabled:active:scale-100 mt-auto"
        >
          {status === 'loading' ? 'Broadcasting...' : status === 'success' ? 'Broadcast Sent!' : 'Send Broadcast'}
        </button>
        {status === 'error' && (
          <p className="text-red-500 text-center text-sm font-bold mt-2">Failed to send announcement. Please try again.</p>
        )}
      </form>
    </div>
  );
}
