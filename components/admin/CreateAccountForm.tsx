'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import PinInput from '@/components/ui/PinInput';
import { createAccountAction } from '@/app/admin/create-account/actions';

interface CreateAccountFormProps {
  onClose?: () => void;
}

export default function CreateAccountForm({ onClose }: CreateAccountFormProps = {}) {
  const [accountType, setAccountType] = useState<'team' | 'admin'>('team');
  const [isLoading, setIsLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [contactNumber, setContactNumber] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const payload = {
        username,
        password: pin.join(''),
        role: accountType === 'team' ? 'user' : 'admin',
        phonenumber: contactNumber,
      };

      const result = await createAccountAction(payload);

      if (result.error) {
        throw new Error(result.error);
      }

      setSuccessMsg(`Successfully created ${accountType} account for ${payload.username}`);
      // Clear form
      setUsername('');
      setPin(['', '', '', '', '', '']);
      setContactNumber('');
      if (onClose) {
        setTimeout(onClose, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-[2.5rem] p-6 lg:p-10 shadow-2xl h-full border border-zinc-100 flex flex-col relative overflow-y-auto">
      {onClose && (
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-3 bg-white text-zinc-400 hover:text-surface-dark border border-zinc-100 hover:border-zinc-200 rounded-full shadow-sm hover:shadow active:scale-95 transition-all z-20"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      )}
      <div className="mb-8 mt-12 text-left shrink-0">
        <h3 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">Register Account</h3>
        <p className="text-zinc-500 font-medium text-sm leading-relaxed">Provide information to generate secure login credentials for a new user.</p>
      </div>

      <form onSubmit={handleCreateAccount} className="flex flex-col gap-5 lg:gap-6 flex-1 min-h-0 justify-center max-w-md mx-auto w-full">
        
        {errorMsg && (
          <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm border border-red-200">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm border border-green-200">
            {successMsg}
          </div>
        )}

        {/* Username Field */}
        <Input 
          label={accountType === 'team' ? "Team Name" : "Username"}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
          type="text" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={accountType === 'team' ? "e.g. Alpha Squad" : "e.g. admin_johndoe"}
          required
        />
        
        {/* Password Field */}
        <PinInput pin={pin} onChange={setPin} isPending={isLoading} />

        {/* Account Type Selector */}
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-sm uppercase text-zinc-500 tracking-widest font-bold ml-2">Account Role</label>
          <div className="relative flex bg-zinc-50 rounded-[2rem] p-1.5 border border-zinc-100">
            {/* Sliding Background */}
            <div 
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[1.5rem] shadow-sm transition-transform duration-300 ease-out border border-zinc-100"
              style={{ transform: accountType === 'admin' ? 'translateX(100%)' : 'translateX(0)' }}
            />
            
            {/* Team Option */}
            <label className="relative z-10 flex-1 flex items-center justify-center py-2.5 cursor-pointer rounded-[1.5rem] transition-colors duration-200">
              <input 
                type="radio" 
                name="accountType" 
                value="team" 
                checked={accountType === 'team'}
                onChange={() => {
                  setAccountType('team');
                  setPin(['', '', '', '', '', '']); // Reset password to enforce length/pattern differences
                }}
                className="sr-only"
              />
              <span className={`text-sm font-bold tracking-wide transition-colors duration-300 relative z-10 ${accountType === 'team' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-900'}`}>Team</span>
            </label>

            {/* Admin Option */}
            <label className="relative z-10 flex-1 flex items-center justify-center py-2.5 cursor-pointer rounded-[1.5rem] transition-colors duration-200">
              <input 
                type="radio" 
                name="accountType" 
                value="admin" 
                checked={accountType === 'admin'}
                onChange={() => {
                  setAccountType('admin');
                  setPin(['', '', '', '', '', '']); // Reset password to enforce length/pattern differences
                }}
                className="sr-only"
              />
              <span className={`text-sm font-bold tracking-wide transition-colors duration-300 relative z-10 ${accountType === 'admin' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-900'}`}>Admin</span>
            </label>
          </div>
        </div>

        {/* Contact Number */}
        <Input 
          label="Contact Number"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>}
          type="text" 
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          placeholder="e.g. 555-0100"
          required
        />

        <div className="mt-4 shrink-0">
          <button
            type="submit" 
            disabled={isLoading}
            className="mt-4 w-full bg-zinc-950 text-white rounded-full py-2.5 pl-6 pr-2.5 text-[15px] font-semibold transition-all duration-300 shadow-xl shadow-zinc-950/20 flex items-center justify-between group active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            <span className="tracking-wide">{isLoading ? 'Creating...' : `Create ${accountType === 'team' ? 'Team' : 'Admin'}`}</span>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              {!isLoading ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-950">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              ) : (
                <svg className="animate-spin text-zinc-950" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
              )}
            </div>
          </button>
        </div>
      </form>
    </section>
  );
}
