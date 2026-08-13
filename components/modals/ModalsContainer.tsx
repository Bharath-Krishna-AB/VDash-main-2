'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useGame } from '@/components/teams/GameContext';
import HelpModal from './HelpModal';
import ContactsModal from './ContactsModal';
import HexQrModal from './HexQrModal';
import HintModal from './HintModal';
import LogoutModal from './LogoutModal';

export default function ModalsContainer() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { gameState, beginTimer } = useGame();

  const currentModal = searchParams?.get('modal');

  // ── URL-driven modals ──────────────────────────────────────────────────────
  const helpModalActive = currentModal === 'help';
  const contactsModalActive = currentModal === 'contacts';
  const hexQrModalActive = currentModal === 'qr' || currentModal === 'verify';
  const hintModalActive = currentModal === 'hint';
  const logoutModalActive = currentModal === 'logout';

  // ── Pre-checkpoint QR countdown ───────────────────────────────────────────
  const [countdown, setCountdown] = useState(10);
  const [prevCheckpointIdx, setPrevCheckpointIdx] = useState(gameState.currentCheckpointIndex);

  if (gameState.currentCheckpointIndex !== prevCheckpointIdx) {
    setPrevCheckpointIdx(gameState.currentCheckpointIndex);
    setCountdown(10);
  }

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep a stable ref to beginTimer so the interval closure never goes stale
  const beginTimerRef = useRef(beginTimer);
  useEffect(() => { beginTimerRef.current = beginTimer; }, [beginTimer]);

  useEffect(() => {
    // Clear any previous countdown immediately
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!gameState.showingPreQr) return;

    // Clear any leftover ?modal=verify/qr from the URL so HexQrModal's
    // savedMode resets from 'input' back to 'display' for the new checkpoint.
    router.replace(pathname || '/', { scroll: false });

    // Use a mutable local variable inside the interval
    let remaining = countdown;

    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        beginTimerRef.current();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  // Re-run when a new checkpoint's QR phase starts (index changes) or showingPreQr toggles
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.showingPreQr, gameState.currentCheckpointIndex]);

  // ── Overlay / close ───────────────────────────────────────────────────────
  const isOverlayActive =
    helpModalActive || contactsModalActive || hexQrModalActive ||
    hintModalActive || logoutModalActive || gameState.showingPreQr;

  const closeModal = () => {
    // Do not allow closing while the pre-checkpoint QR countdown is running
    if (gameState.showingPreQr) return;
    router.replace(pathname || '/', { scroll: false });
  };

  // When showingPreQr, force QR modal open in display mode with the countdown
  const qrActive = gameState.showingPreQr || hexQrModalActive;
  const qrMode = gameState.showingPreQr
    ? 'display'
    : (currentModal === 'qr' ? 'display' : 'input');
  const qrAutoCountdown = gameState.showingPreQr ? countdown : undefined;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-md z-[299] transition-opacity duration-300 ease-out ${isOverlayActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeModal}
      />
      <HelpModal active={helpModalActive} onClose={closeModal} />
      <ContactsModal active={contactsModalActive} onClose={closeModal} />
      <HexQrModal
        active={qrActive}
        mode={qrMode}
        onClose={closeModal}
        autoCountdown={qrAutoCountdown}
      />
      <HintModal active={hintModalActive} onClose={closeModal} />
      <LogoutModal active={logoutModalActive} onClose={closeModal} />
    </>
  );
}
