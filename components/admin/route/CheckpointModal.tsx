import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CheckpointData } from '../CheckpointItem';

interface CheckpointModalProps {
  isOpen: boolean;
  initialData: CheckpointData | null;
  onClose: () => void;
  onSave: (data: CheckpointData) => void;
}

export default function CheckpointModal({ isOpen, initialData, onClose, onSave }: CheckpointModalProps) {
  const [formData, setFormData] = useState<CheckpointData | null>(null);

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

  const handleChange = (field: keyof CheckpointData, value: string | number) => {
    setFormData((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = () => {
    if (formData) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 border border-zinc-100">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-zinc-50 text-zinc-400 hover:text-zinc-900 border border-zinc-100 hover:border-zinc-200 rounded-full transition-all z-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* Header */}
        <div className="p-6 md:p-8 border-b border-zinc-100 flex flex-col shrink-0 pr-16">
          <div>
            <h2 className="font-bold text-3xl tracking-tight text-zinc-900">
              {initialData && initialData.title ? 'Edit Checkpoint' : 'Add Checkpoint'}
            </h2>
            <p className="text-zinc-500 font-medium text-sm mt-1">Configure the details for this location</p>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="md:col-span-2">
              <Input 
                label="Checkpoint Title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Library Entrance" 
              />
            </div>
            <div className="md:col-span-2">
              <Input 
                label="Verify Code"
                value={formData.verification}
                onChange={(e) => handleChange('verification', e.target.value)}
                placeholder="e.g. 123456" 
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase text-zinc-500 tracking-widest font-bold flex items-center gap-2 ml-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect x="7" y="7" width="10" height="10"></rect></svg>
                QR Code Clue
              </label>
              <textarea 
                value={formData.apphint}
                onChange={(e) => handleChange('apphint', e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200/60 rounded-[1.25rem] px-5 py-4 font-semibold text-zinc-900 min-h-[120px] focus:outline-none focus:border-zinc-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(24,24,27,0.05)] transition-all resize-none placeholder:text-zinc-400" 
                placeholder="Enter text to embed inside the QR code..." 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase text-zinc-500 tracking-widest font-bold flex items-center gap-2 ml-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                App Hint
              </label>
              <textarea 
                value={formData.qrhint}
                onChange={(e) => handleChange('qrhint', e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200/60 rounded-[1.25rem] px-5 py-4 font-semibold text-zinc-900 min-h-[120px] focus:outline-none focus:border-zinc-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(24,24,27,0.05)] transition-all resize-none placeholder:text-zinc-400" 
                placeholder="Hint shown inside the app when teams are stuck..." 
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 md:p-8 border-t border-zinc-100 flex justify-end gap-3 shrink-0 bg-white">
          <button 
            type="button" 
            onClick={handleSave} 
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-950 text-white font-semibold shadow-xl shadow-zinc-950/20 hover:scale-105 active:scale-95 transition-all"
          >
            Save Checkpoint
          </button>
        </div>
      </div>
    </div>
  );
}
