'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';

interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  align?: 'center' | 'start' | 'end';
  padding?: number;
  borderRadius?: number | string;
  clipPathUrl?: string;
  icon: React.ReactNode;
}

const STEPS: TutorialStep[] = [
  {
    targetId: 'tutorial-hint',
    title: 'Need a Lifeline?',
    content: 'Stuck on a tricky clue? Tap here to unlock a hint. Keep in mind, this lifeline only appears when time is running out!',
    position: 'top',
    align: 'start',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>
  },
  {
    targetId: 'tutorial-verify',
    title: 'Verify Arrival',
    content: 'Found the location? Enter your secret passcode here to verify your arrival and unlock the next stage.',
    position: 'top',
    align: 'center',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" /><path d="m21 2-9.6 9.6" /><circle cx="7.5" cy="15.5" r="5.5" /></svg>
  },
  {
    targetId: 'tutorial-contact',
    title: 'HQ Comms',
    content: 'Lost or have an emergency? Open a direct communication channel to the administrators for instant support.',
    position: 'top',
    align: 'center',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z" /><path d="M21 11h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2z" /><path d="M21 16v2a4 4 0 0 1-4 4h-5" /><path d="M1 14a10.5 10.5 0 0 1 21 0" /></svg>
  },
  {
    targetId: 'tutorial-qr',
    title: 'Scan for Clues',
    content: 'Ready to move on? Display this QR code to be scanned to unlock vital clues for your next stage.',
    position: 'top',
    align: 'end',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" /></svg>
  },
  {
    targetId: 'tutorial-logout',
    title: 'Exit Protocol',
    content: 'Logging out will reset your route assignment and progress will NOT be stored in the cloud. Use with caution!',
    position: 'top',
    align: 'end',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
  }
];

export default function AppTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const isNewLogin = searchParams.get('tutorial') === 'true';

    if (isNewLogin) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        window.history.replaceState({}, '', pathname);
      }, 800); // slightly longer delay for initial load animation

      return () => clearTimeout(timer);
    }
  }, [searchParams, pathname]);

  const updateTargetRect = useCallback(() => {
    if (!isVisible) return;
    const step = STEPS[currentStep];
    const el = document.getElementById(step.targetId);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    } else {
      setTargetRect(null);
    }
  }, [currentStep, isVisible]);

  useEffect(() => {
    // Defer initial calculation to prevent synchronous set-state-in-effect
    const initTimer = setTimeout(() => updateTargetRect(), 0);
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, { capture: true, passive: true });

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, { capture: true });
    };
  }, [updateTargetRect]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = STEPS[currentStep];

  // Fluid positioning constants
  let tooltipTop = 0;
  let tooltipLeft = 0;
  const TOOLTIP_WIDTH = typeof window !== 'undefined' ? Math.min(260, window.innerWidth - 32) : 260;
  const MARGIN = 12; // Tighter margin

  if (targetRect) {
    if (step.position === 'top') {
      tooltipTop = targetRect.top - MARGIN;
    } else if (step.position === 'bottom') {
      tooltipTop = targetRect.bottom + MARGIN;
    } else if (step.position === 'center') {
      tooltipTop = targetRect.top + (targetRect.height / 2);
    } else {
      tooltipTop = targetRect.top + (targetRect.height / 2);
    }

    if (step.position === 'left') {
      tooltipLeft = targetRect.left - TOOLTIP_WIDTH - MARGIN;
    } else if (step.position === 'right') {
      tooltipLeft = targetRect.right + MARGIN;
    } else if (step.position === 'center') {
      tooltipLeft = targetRect.left + (targetRect.width / 2) - (TOOLTIP_WIDTH / 2);
    } else {
      if (step.align === 'start') {
        tooltipLeft = targetRect.left;
      } else if (step.align === 'end') {
        tooltipLeft = targetRect.right - TOOLTIP_WIDTH;
      } else {
        tooltipLeft = targetRect.left + (targetRect.width / 2) - (TOOLTIP_WIDTH / 2);
      }
    }

    // Viewport bounding to ensure complete visibility
    tooltipLeft = Math.max(16, Math.min(window.innerWidth - TOOLTIP_WIDTH - 16, tooltipLeft));

    // Height bounding (estimated height of minimal card is much smaller)
    const EST_HEIGHT = 140;
    if (step.position === 'top') {
      tooltipTop = Math.max(16 + EST_HEIGHT, tooltipTop);
    } else if (step.position === 'bottom') {
      tooltipTop = Math.min(window.innerHeight - EST_HEIGHT - 16, tooltipTop);
    }
  }

  const isCircle = targetRect && targetRect.width === targetRect.height;
  const stepPadding = step.padding !== undefined ? step.padding : 12;
  const targetRadius = step.borderRadius !== undefined
    ? step.borderRadius
    : (isCircle ? "50%" : "32");

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-auto overflow-hidden">
      {/* Dynamic Animated Glass Backdrop */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="cutout-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - stepPadding}
                y={targetRect.top - stepPadding}
                width={targetRect.width + (stepPadding * 2)}
                height={targetRect.height + (stepPadding * 2)}
                rx={targetRadius}
                clipPath={step.clipPathUrl}
                fill="black"
                className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              />
            )}
          </mask>

          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#ffffff" />
          </marker>
        </defs>

        {/* Dark overlay for focus */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(9,9,11,0.85)"
          mask="url(#cutout-mask)"
          className="transition-all duration-700"
        />

      </svg>

      {/* Minimal Premium Light Tooltip */}
      <div
        className="absolute bg-white/95 backdrop-blur-xl border border-zinc-200/60 text-zinc-900 rounded-[20px] p-3 sm:p-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] w-[calc(100vw-32px)] sm:w-[260px] max-w-[260px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 flex flex-col"
        style={{
          left: tooltipLeft,
          top: step.position === 'top' ? 'auto' : (step.position === 'center' ? '50%' : tooltipTop),
          bottom: step.position === 'top' ? (typeof window !== 'undefined' ? window.innerHeight - tooltipTop : 0) : 'auto',
          transform: step.position === 'center' ? 'translateY(-50%)' : 'none'
        }}
      >
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="font-bold text-[14px] tracking-tight text-zinc-900">{step.title}</h3>
          <button
            onClick={handleComplete}
            className="text-zinc-400 hover:text-zinc-600 transition-colors p-1 -mr-1.5 -mt-1 rounded-full hover:bg-zinc-100"
            aria-label="Close tutorial"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <p className="text-zinc-500 text-[12px] font-medium leading-relaxed mb-4">
          {step.content}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex gap-1.5">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${idx === currentStep ? 'w-4 bg-zinc-900' : 'w-1.5 bg-zinc-200'
                  }`}
              />
            ))}
          </div>

          <div className="flex gap-1.5 items-center">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-2.5 py-1.5 rounded-full font-bold text-[11px] text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-3.5 py-1.5 rounded-full font-bold text-[11px] bg-zinc-900 text-white hover:bg-zinc-800 transition-colors active:scale-95 shadow-sm shadow-zinc-900/20"
            >
              {currentStep === STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
