'use client';

import React, { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAccountAction, updateAccountAction, bulkDeleteAccountsAction } from '@/app/admin/create-account/actions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import PinInput from '@/components/ui/PinInput';
import CreateAccountForm from '@/components/admin/CreateAccountForm';
import DeferredSearchInput from '@/components/ui/DeferredSearchInput';
import BulkImportModal from '@/components/admin/BulkImportModal';

const SwipeToConfirm = ({ onConfirm, isPending }: { onConfirm: () => void, isPending: boolean }) => {
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonWidth = 48; // w-12 = 48px

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPending) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || isPending) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const maxPosition = rect.width - buttonWidth - 8; // 8px total padding (p-1)
    let newPos = Math.max(0, Math.min(x - buttonWidth / 2, maxPosition));
    setPosition(newPos);
  };

  const [maxPosition, setMaxPosition] = useState(200);

  React.useEffect(() => {
    if (containerRef.current) {
      setMaxPosition(containerRef.current.getBoundingClientRect().width - buttonWidth - 8);
    }
  }, [buttonWidth]);

  const isReached = position >= maxPosition * 0.9;
  const showReadyState = isReached && !isPending;

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || isPending) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    if (isReached) {
      setPosition(maxPosition);
      onConfirm();
    } else {
      setPosition(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-[56px] rounded-full flex items-center p-1 overflow-hidden shadow-xl group transition-all duration-300 ${isPending || showReadyState ? 'bg-red-500 shadow-red-500/20' : 'bg-zinc-950 shadow-zinc-950/20'}`}
    >
      <div 
        className={`absolute left-0 top-0 bottom-0 rounded-full transition-all ${isPending || showReadyState ? 'bg-red-600' : 'bg-white/10'}`}
        style={{ width: `${position + buttonWidth + 8}px`, transitionDuration: isDragging ? '0ms' : '300ms' }}
      />
      
      {isPending || showReadyState ? (
        <span className="absolute inset-0 flex items-center justify-center font-bold text-sm pointer-events-none tracking-widest uppercase z-0 text-white animate-in fade-in zoom-in-95 duration-200">
          {isPending ? 'Deleting...' : 'Release to Delete'}
        </span>
      ) : (
        <span 
          className={`absolute inset-0 flex items-center justify-center font-bold text-sm pointer-events-none tracking-widest uppercase z-0 transition-opacity duration-300 ${isDragging ? 'opacity-30 text-white' : 'text-white'}`}
          style={{
            backgroundImage: isDragging ? 'none' : 'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.5) 100%)',
            backgroundSize: '200% auto',
            backgroundClip: isDragging ? 'border-box' : 'text',
            WebkitBackgroundClip: isDragging ? 'border-box' : 'text',
            WebkitTextFillColor: isDragging ? 'currentColor' : 'transparent',
            animation: isDragging ? 'none' : 'shimmer 2s linear infinite'
          }}
        >
          Slide to delete
        </span>
      )}
      
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ transform: `translateX(${position}px)`, transitionDuration: isDragging ? '0ms' : '300ms' }}
        className={`relative z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing touch-none transition-transform hover:scale-105 ${isPending || showReadyState ? 'text-red-500' : 'text-zinc-950'}`}
      >
        {isPending ? (
          <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}} />
    </div>
  );
};

export default function ActiveAccountsList({ initialProfiles }: { initialProfiles: any[] }) {
  const [editingProfile, setEditingProfile] = useState<any | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<any | null>(null);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editForm, setEditForm] = useState<{username: string, pin: string[], phonenumber: string}>({ 
    username: '', 
    pin: ['', '', '', '', '', ''], 
    phonenumber: '' 
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'admin' | 'user'>('user');

  useEffect(() => {
    const saved = localStorage.getItem('vd_activeTab');
    if (saved === 'admin' || saved === 'user') {
      setActiveTab(saved);
    }
  }, []);
  
  const handleTabChange = (tab: 'admin' | 'user') => {
    setActiveTab(tab);
    localStorage.setItem('vd_activeTab', tab);
    setSearchQuery('');
    setSelectedIds(new Set());
  };
  
  const [isPending, startTransition] = useTransition();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const profiles = initialProfiles;

  const handleEdit = (profile: any) => {
    setError('');
    setEditingProfile(profile);
    
    const passStr = profile.password ? profile.password.toString().padStart(6, '0') : '';
    const pinArray = [...passStr.split(''), '', '', '', '', '', ''].slice(0, 6);

    setEditForm({ 
      username: profile.username, 
      pin: pinArray, 
      phonenumber: profile.phonenumber ? profile.phonenumber.toString() : '' 
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (editId) {
      const profileToEdit = profiles.find(p => p.id === editId || p.loginId === editId || p.password?.toString() === editId);
      if (profileToEdit) {
        // Defer state updates to avoid set-state-in-effect
        setTimeout(() => {
          if (profileToEdit.role !== activeTab) {
            handleTabChange(profileToEdit.role);
          }
          handleEdit(profileToEdit);
        }, 0);
        
        // Remove the query param so it doesn't reopen if they close it
        router.replace('/admin/create-account', { scroll: false });
      }
    }
  }, [profiles, router, activeTab]);

  const filteredProfiles = profiles.filter(p => 
    p.role === activeTab && 
    (p.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
     (p.phonenumber && p.phonenumber.toString().includes(searchQuery)))
  );

  const adminCount = profiles.filter(p => p.role === 'admin').length;
  const teamCount = profiles.filter(p => p.role === 'user').length;

  const confirmDelete = () => {
    if (!deletingProfile) return;
    setError('');
    startTransition(() => {
      deleteAccountAction(deletingProfile.id).then((res) => {
        if (res.error) {
          setError(res.error);
        } else {
          setDeletingProfile(null);
        }
      });
    });
  };

  const handleInitiateDelete = (profile: any) => {
    setError('');
    setDeletingProfile(profile);
  };

  const submitEdit = () => {
    if (!editingProfile) return;
    setError('');
    
    const finalPin = editForm.pin.join('');
    if (finalPin.length > 0 && finalPin.length < 6) {
      setError('PIN must be exactly 6 digits.');
      return;
    }

    startTransition(() => {
      // Clean up empty fields to not update them
      const payload: any = {};
      if (editForm.username) payload.username = editForm.username;
      if (finalPin.length === 6) payload.password = finalPin;
      if (editForm.phonenumber) payload.phonenumber = editForm.phonenumber;
      
      updateAccountAction(editingProfile.id, payload).then((res) => {
        if (res.error) {
          setError(res.error);
        } else {
          setEditingProfile(null);
        }
      });
    });
  };

  const confirmBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setError('');
    startTransition(() => {
      bulkDeleteAccountsAction(Array.from(selectedIds)).then((res) => {
        if (res.error) {
          setError(res.error);
        } else {
          setDeletingBulk(false);
          setSelectedIds(new Set());
        }
      });
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProfiles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProfiles.map(p => p.id)));
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  return (
    <section className="bg-surface rounded-[2.5rem] p-5 lg:p-6 shadow-xl flex flex-col border border-zinc-100 w-full relative">
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
        <h3 className="font-display text-3xl lg:text-4xl font-bold text-surface-dark tracking-tight normal-case shrink-0">Active Accounts</h3>
        
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 w-full flex-1 md:ml-8">
          <div className="relative w-full flex-1 max-w-lg">
            <DeferredSearchInput
              placeholder={`Search ${activeTab === 'admin' ? 'admins' : 'teams'}...`}
              value={searchQuery}
              onSearch={setSearchQuery}
              className="bg-zinc-50 border border-zinc-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 rounded-full py-2.5 text-sm text-surface-dark font-medium transition-all duration-200 outline-none placeholder:text-zinc-400"
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
            />
          </div>
          
          <button 
            onClick={() => setIsBulkImportModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 w-full sm:w-auto px-6 py-2.5 rounded-full font-bold text-sm shadow hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all whitespace-nowrap shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <span>Bulk Import</span>
          </button>
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-surface-dark text-white w-full sm:w-auto px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all whitespace-nowrap shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Register Account</span>
          </button>
        </div>
      </div>

      {/* Tabs & Counts Row */}
      <div className="flex flex-row items-center justify-start gap-4 mb-3 shrink-0 pb-3 border-b border-zinc-100">
        <div className="flex gap-2 relative bg-zinc-50 p-1 rounded-full border border-zinc-100">
          <button 
            className={`flex items-center gap-2 px-6 py-2 text-sm font-bold tracking-wider uppercase rounded-full transition-all duration-300 ${activeTab === 'admin' ? 'bg-white shadow-sm text-surface-dark' : 'text-zinc-400 hover:text-surface-dark'}`}
            onClick={() => handleTabChange('admin')}
          >
            Admins
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${activeTab === 'admin' ? 'bg-brand-neon text-surface-dark' : 'bg-transparent text-zinc-400'}`}>{adminCount}</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-6 py-2 text-sm font-bold tracking-wider uppercase rounded-full transition-all duration-300 ${activeTab === 'user' ? 'bg-white shadow-sm text-surface-dark' : 'text-zinc-400 hover:text-surface-dark'}`}
            onClick={() => handleTabChange('user')}
          >
            Teams
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${activeTab === 'user' ? 'bg-brand-neon text-surface-dark' : 'bg-transparent text-zinc-400'}`}>{teamCount}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 pr-2 pb-2">
        {/* Selection Actions Row */}
        {filteredProfiles.length > 0 && (
          <div className="flex items-center justify-between py-2 px-1 mb-2 shrink-0">
            <button 
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selectedIds.size === filteredProfiles.length ? 'bg-brand-primary border-brand-primary text-white' : 'border-zinc-300 text-transparent'}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              {selectedIds.size === filteredProfiles.length ? 'Deselect All' : 'Select All'}
            </button>
            
            {selectedIds.size > 0 && (
              <button 
                onClick={() => {
                  setError('');
                  setDeletingBulk(true);
                }}
                className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Delete Selected ({selectedIds.size})
              </button>
            )}
          </div>
        )}

        {filteredProfiles.length === 0 && (
          <div className="text-center text-zinc-400 py-12 text-lg font-bold flex flex-col items-center justify-center gap-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
            No accounts found.
          </div>
        )}
        {filteredProfiles.map((profile, i) => {
          const isSelected = selectedIds.has(profile.id);
          return (
          <div key={profile.id} className={`group flex flex-col gap-3 p-4 rounded-[1.5rem] bg-zinc-50 border transition-all shrink-0 hover:shadow-sm ${isSelected ? 'border-brand-primary bg-brand-primary/5' : 'border-zinc-100 hover:border-zinc-200'}`}>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleSelection(profile.id)}
                className="shrink-0 flex items-center justify-center p-1"
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-primary border-brand-primary text-white' : 'border-zinc-300 text-transparent group-hover:border-zinc-400'}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </button>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-display text-xl shrink-0 uppercase font-bold shadow-sm relative ${profile.role === 'admin' ? 'bg-brand-primary' : 'bg-surface-dark'}`}>
                {profile.username.slice(0, 2)}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-brand-success border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-surface-dark text-lg truncate">{profile.username}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  {profile.phonenumber && (
                    <div className="font-bold text-zinc-400 text-xs tracking-wide truncate">{profile.phonenumber}</div>
                  )}
                  <div className="w-1 h-1 bg-zinc-300 rounded-full"></div>
                  <div className="flex items-center gap-1.5 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse"></div>
                    <div className="font-bold text-brand-success text-xs tracking-wide">Active Now</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 pr-2">
                <button onClick={() => handleEdit(profile)} className="p-2.5 bg-white rounded-full text-zinc-400 hover:text-brand-primary border border-zinc-100 hover:border-brand-primary transition-all disabled:opacity-50 shadow-sm hover:shadow" disabled={isPending}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button onClick={() => handleInitiateDelete(profile)} className="p-2.5 bg-white rounded-full text-zinc-400 hover:text-red-500 border border-zinc-100 hover:border-red-400 transition-all disabled:opacity-50 shadow-sm hover:shadow" disabled={isPending}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* Create Account Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[90dvh] flex flex-col animate-in zoom-in-95 duration-200">
            <CreateAccountForm onClose={() => setIsCreateModalOpen(false)} />
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkImportModalOpen && (
        <BulkImportModal onClose={() => setIsBulkImportModalOpen(false)} />
      )}

      {/* Edit Account Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-2xl border border-zinc-100 animate-in zoom-in-95 duration-200 flex flex-col gap-6">
            <button 
              onClick={() => setEditingProfile(null)} 
              disabled={isPending}
              className="absolute top-6 right-6 p-2 bg-zinc-50 text-zinc-400 hover:text-zinc-900 border border-zinc-100 hover:border-zinc-200 rounded-full transition-all disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="text-left mb-2 pr-10">
              <h3 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">Edit Account</h3>
              <p className="text-zinc-500 font-medium text-sm leading-relaxed">Update details for <span className="font-bold text-zinc-900">{editingProfile.username}</span></p>
            </div>
            
            <div className="flex flex-col gap-5">
              <Input 
                label="Username" 
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
                value={editForm.username} 
                onChange={e => setEditForm({...editForm, username: e.target.value})} 
              />
              
              <div className="flex flex-col gap-1 -mt-2">
                <PinInput pin={editForm.pin} onChange={(pin) => setEditForm({...editForm, pin})} isPending={isPending} isRequired={true} />
              </div>

              <Input 
                label="Contact Number" 
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>}
                value={editForm.phonenumber} 
                onChange={e => setEditForm({...editForm, phonenumber: e.target.value})} 
              />
              
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2 -mt-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  {error}
                </div>
              )}
              
              <div className="flex gap-4 mt-6">
                <button 
                  onClick={submitEdit} 
                  disabled={isPending} 
                  className="w-full bg-zinc-950 text-white rounded-full py-2.5 pl-6 pr-2.5 text-[15px] font-semibold transition-all duration-300 shadow-xl shadow-zinc-950/20 flex items-center justify-between group active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  <span className="tracking-wide">{isPending ? 'Saving...' : 'Save Changes'}</span>
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                    {isPending ? (
                      <svg className="animate-spin text-zinc-950" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-950"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-zinc-100 animate-in zoom-in-95 duration-200 flex flex-col gap-4 text-center">
            <button 
              onClick={() => setDeletingProfile(null)} 
              disabled={isPending}
              className="absolute top-6 right-6 p-2 bg-zinc-50 text-zinc-400 hover:text-zinc-900 border border-zinc-100 hover:border-zinc-200 rounded-full transition-all disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 mt-4 shadow-lg shadow-red-500/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </div>
            
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">Delete Account?</h3>
              <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-zinc-900">{deletingProfile.username}</span>? This action cannot be undone.
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2 text-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {error}
              </div>
            )}
            
            <div className="flex flex-col gap-3 mt-2">
              <SwipeToConfirm onConfirm={confirmDelete} isPending={isPending} />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {deletingBulk && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-zinc-100 animate-in zoom-in-95 duration-200 flex flex-col gap-4 text-center">
            <button 
              onClick={() => setDeletingBulk(false)} 
              disabled={isPending}
              className="absolute top-6 right-6 p-2 bg-zinc-50 text-zinc-400 hover:text-zinc-900 border border-zinc-100 hover:border-zinc-200 rounded-full transition-all disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 mt-4 shadow-lg shadow-red-500/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </div>
            
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">Delete {selectedIds.size} Accounts?</h3>
              <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                Are you sure you want to delete the selected accounts? This action cannot be undone.
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2 text-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {error}
              </div>
            )}
            
            <div className="flex flex-col gap-3 mt-2">
              <SwipeToConfirm onConfirm={confirmBulkDelete} isPending={isPending} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
