import React from 'react';
import { CheckpointData } from '../CheckpointItem';

interface PrintQRModalProps {
  isOpen: boolean;
  checkpoint: CheckpointData | null;
  onClose: () => void;
}

export default function PrintQRModal({ isOpen, checkpoint, onClose }: PrintQRModalProps) {
  if (!isOpen || !checkpoint) return null;

  const handlePrint = () => {
    window.print();
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  // Use 'scan' as a placeholder teamName because the landing page requires this structure
  // but doesn't actually depend on the teamName for rendering the checkpoint data.
  const qrValue = `${origin}/teams/scan/qr/${checkpoint.id}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <style type="text/css" media="print">
        {`
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding-top: 100px;
          }
          .no-print {
            display: none !important;
          }
        `}
      </style>

      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md transition-opacity no-print"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden flex flex-col p-8 items-center animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-zinc-50 text-zinc-400 hover:text-zinc-900 border border-zinc-100 hover:border-zinc-200 rounded-full transition-all z-10 no-print"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <h2 className="font-bold text-2xl tracking-tight text-zinc-900 mb-2 text-center no-print">
          Print Checkpoint
        </h2>
        <p className="text-zinc-500 font-medium text-sm mb-8 text-center no-print">
          {checkpoint.title}
        </p>

        <div id="print-area" className="flex flex-col items-center justify-center mb-6">
          <div className="bg-white p-4 border border-zinc-200 rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrValue)}`}
              alt="QR code"
              className="w-48 h-48 sm:w-56 sm:h-56 block rounded-xl mix-blend-multiply"
            />
          </div>
          
          <div className="hidden print:flex flex-col items-center mt-8">
            <h1 className="text-4xl font-bold text-zinc-900 mb-2 tracking-tight text-center">{checkpoint.title}</h1>
            <p className="text-xl text-zinc-500 font-medium text-center">Scan to verify checkpoint arrival</p>
          </div>
        </div>

        <button 
          onClick={handlePrint}
          className="w-full py-3 bg-zinc-950 text-white rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all no-print flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print QR Code
        </button>
      </div>
    </div>
  );
}
