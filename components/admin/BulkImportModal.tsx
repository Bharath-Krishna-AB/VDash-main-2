'use client';

import React, { useState } from 'react';
import { bulkCreateAccountsAction } from '@/app/admin/create-account/actions';

interface BulkImportModalProps {
  onClose: () => void;
}

type ImportResult = { username: string; status: 'created' | 'skipped' | 'error'; reason?: string };

export default function BulkImportModal({ onClose }: BulkImportModalProps) {
  const [inputText, setInputText] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleImport = async () => {
    setErrorMsg('');
    setResults(null);

    const lines = inputText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      setErrorMsg('Please enter at least one account.');
      return;
    }

    const rows = lines.map(line => {
      const parts = line.split(',');
      const username = parts[0]?.trim() || '';
      const password = parts[1]?.trim() || '';
      const role = parts[2]?.trim() || '';
      const phonenumber = parts[3]?.trim() || '';
      return { username, password, role, phonenumber };
    });

    setIsPending(true);
    
    try {
      const response = await bulkCreateAccountsAction(rows);
      if (response.error) {
        setErrorMsg(response.error);
      } else if (response.results) {
        setResults(response.results);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setIsPending(false);
    }
  };

  const createdCount = results?.filter(r => r.status === 'created').length || 0;
  const skippedCount = results?.filter(r => r.status === 'skipped').length || 0;
  const errorCount = results?.filter(r => r.status === 'error').length || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-6 lg:p-10 shadow-2xl border border-zinc-100 flex flex-col max-h-[90dvh]">
        <button 
          onClick={onClose} 
          disabled={isPending}
          className="absolute top-6 right-6 p-3 bg-white text-zinc-400 hover:text-surface-dark border border-zinc-100 hover:border-zinc-200 rounded-full shadow-sm hover:shadow active:scale-95 transition-all z-20 disabled:opacity-50"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="mb-6 shrink-0">
          <h3 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">Bulk Import Accounts</h3>
          <p className="text-zinc-500 font-medium text-sm leading-relaxed">
            Create multiple team/volunteer accounts at once.
          </p>
        </div>

        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pr-2">
          {!results ? (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-zinc-700 tracking-wide">
                  Paste accounts (one per line)
                </label>
                <p className="text-xs text-zinc-500 mb-1">
                  Format: <code>username,password,role,phonenumber</code><br/>
                  Example: <code>volunteer1,123456,user,5550100</code> (Role and phonenumber are optional)
                </p>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isPending}
                  className="w-full h-64 p-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all resize-none font-mono text-sm text-zinc-800"
                  placeholder="volunteer1,123456,user,5550100&#10;volunteer2,654321,admin,5550200"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100">
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={isPending || inputText.trim() === ''}
                className="mt-2 w-full bg-zinc-950 text-white rounded-full py-3 px-6 text-[15px] font-semibold transition-all duration-300 shadow-xl shadow-zinc-950/20 active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                    Processing...
                  </>
                ) : (
                  'Process Import'
                )}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 items-center justify-around text-center">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-brand-success">{createdCount}</span>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Created</span>
                </div>
                <div className="w-px h-10 bg-zinc-200"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-zinc-500">{skippedCount}</span>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Skipped</span>
                </div>
                <div className="w-px h-10 bg-zinc-200"></div>
                <div className="flex flex-col">
                  <span className={`text-3xl font-bold ${errorCount > 0 ? 'text-red-500' : 'text-zinc-500'}`}>{errorCount}</span>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Errors</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="font-bold text-zinc-900 text-sm">Detailed Results</h4>
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[40vh] pr-2">
                  {results.map((res, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        res.status === 'created' ? 'bg-green-50 border-green-100' : 
                        res.status === 'skipped' ? 'bg-zinc-50 border-zinc-200' : 
                        'bg-red-50 border-red-100'
                      }`}
                    >
                      <div className="font-mono text-sm font-semibold truncate max-w-[200px]" title={res.username}>
                        {res.username}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-xs font-bold uppercase tracking-widest ${
                          res.status === 'created' ? 'text-green-600' : 
                          res.status === 'skipped' ? 'text-zinc-500' : 
                          'text-red-600'
                        }`}>
                          {res.status}
                        </span>
                        {res.reason && (
                          <span className="text-[10px] text-zinc-500 mt-0.5">{res.reason}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onClose}
                className="mt-2 w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-full py-3 px-6 text-[15px] font-bold transition-all duration-200 active:scale-[0.98]"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
