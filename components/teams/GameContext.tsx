'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchTeamGameState, updateGameStart, updateCheckpointStatus } from '@/app/teams/actions';

export interface Checkpoint {
  id: string;
  title: string;
  verifyCode: string;
  targetLocation: string;
  hint: string;
  durationSeconds: number;
}

interface GameState {
  timeStarted: number | null;
  currentCheckpointIndex: number;
  isCompleted: boolean;
  assignmentId: number | null;
  hasStarted: boolean;
  showingPreQr: boolean; // true during the 5-second QR countdown before timer starts
  pendingBonusMs: number; // bonus time carried over from finishing previous checkpoint early
  activeBonusMs: number; // the bonus time currently applied to the active timer
}

interface GameContextType {
  teamName: string;
  gameState: GameState;
  checkpoints: Checkpoint[];
  currentCheckpoint: Checkpoint | null;
  verifyCode: (code: string) => Promise<boolean>;
  advanceCheckpoint: () => Promise<boolean>;
  beginTimer: () => void; // called after the 5-second QR display ends
  startGame: (code: string) => Promise<boolean>;
  resetGame: () => void;
  isLoading: boolean;
}

import { createClient } from '@/utils/supabase/client';

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ teamName, children }: { teamName: string; children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>({
    timeStarted: null,
    currentCheckpointIndex: 0,
    isCompleted: false,
    assignmentId: null,
    hasStarted: false,
    showingPreQr: false,
    pendingBonusMs: 0,
    activeBonusMs: 0,
  });
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel('admin-route-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'routes' }, () => {
        window.location.reload();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkpoints' }, () => {
        window.location.reload();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    async function loadState() {
      try {
        const data = await fetchTeamGameState(teamName);
        if (data) {
          setCheckpoints(data.checkpoints as Checkpoint[]);
          
          let currentIndex = 0;
          if (data.assignment.check1) currentIndex = 1;
          if (data.assignment.check2) currentIndex = 2;
          if (data.assignment.check3) currentIndex = 3;
          if (data.assignment.check4) currentIndex = 4;
          if (data.assignment.check5) currentIndex = 5;

          const isCompleted = currentIndex >= data.checkpoints.length && data.checkpoints.length > 0;
          
          let timeStarted: number | null = null;
          if (data.assignment.start) {
            const rawTimestamp = data.assignment.checkpoint_started_at || data.assignment.started_at;
            if (rawTimestamp) {
              const serverStart = new Date(rawTimestamp).getTime();
              const serverNow = data.serverNow ? new Date(data.serverNow).getTime() : Date.now();
              const serverTimeDelta = serverNow - Date.now();
              timeStarted = serverStart - serverTimeDelta;
            } else {
              timeStarted = Date.now();
            }
          }

          let loadedBonus = 0;
          if (typeof window !== 'undefined') {
            loadedBonus = parseInt(localStorage.getItem(`activeBonusMs_${teamName}`) || '0', 10);
          }
          
          setGameState({
            timeStarted,
            currentCheckpointIndex: isCompleted ? currentIndex - 1 : currentIndex,
            isCompleted,
            assignmentId: data.assignment.id,
            hasStarted: data.assignment.start,
            showingPreQr: false, // never re-show QR on page reload/re-login
            pendingBonusMs: 0,
            activeBonusMs: loadedBonus,
          });
        }
      } catch (e) {
        console.error("Error loading game state:", e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadState();
  }, [teamName]);

  const startGame = async (code: string) => {
    if (!gameState.assignmentId) return false;
    
    if (code.trim().toLowerCase() !== 'start') {
      return false; 
    }
    
    const success = await updateGameStart(gameState.assignmentId);
    if (success) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`activeBonusMs_${teamName}`, '0');
      }
      setGameState(prev => ({
        ...prev,
        hasStarted: true,
        showingPreQr: true,
        pendingBonusMs: 0,
        activeBonusMs: 0,
      }));
      return true;
    }
    return false;
  };

  const resetGame = () => {
    window.location.reload(); 
  };

  const currentCheckpoint = checkpoints[gameState.currentCheckpointIndex] || null;

  const advanceCheckpoint = async (): Promise<boolean> => {
    if (!currentCheckpoint || !gameState.assignmentId) return false;
    
    const checkIndex = gameState.currentCheckpointIndex + 1;
    const nextIndex = gameState.currentCheckpointIndex + 1;
    const isFinished = nextIndex >= checkpoints.length;
    
    // Calculate how much time they had remaining (early completion bonus)
    const elapsed = gameState.timeStarted ? Date.now() - gameState.timeStarted : 0;
    const TOTAL_MS = currentCheckpoint.durationSeconds * 1000;
    const remainingMs = Math.max(0, TOTAL_MS - elapsed);
    
    const success = await updateCheckpointStatus(gameState.assignmentId, checkIndex, isFinished, remainingMs);
    
    if (success) {
      setGameState(prev => ({
        ...prev,
        currentCheckpointIndex: isFinished ? prev.currentCheckpointIndex : nextIndex,
        isCompleted: isFinished,
        // For intermediate checkpoints: show QR countdown before starting next timer
        // For the final checkpoint: keep timeStarted as-is (game over display)
        timeStarted: isFinished ? prev.timeStarted : null,
        showingPreQr: !isFinished,
        pendingBonusMs: isFinished ? 0 : remainingMs,
      }));
      return true;
    }
    return false;
  };

  // Called by ModalsContainer after the 10-second pre-checkpoint QR countdown ends
  const beginTimer = () => {
    const bonus = gameState.pendingBonusMs;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`activeBonusMs_${teamName}`, bonus.toString());
    }
    setGameState(prev => ({
      ...prev,
      timeStarted: Date.now() + prev.pendingBonusMs,
      showingPreQr: false,
      activeBonusMs: bonus,
      pendingBonusMs: 0,
    }));
  };

  const verifyCode = async (code: string): Promise<boolean> => {
    if (!currentCheckpoint || !gameState.assignmentId) return false;
    
    if (currentCheckpoint.verifyCode.toLowerCase() === code.trim().toLowerCase()) {
      return await advanceCheckpoint();
    }
    return false;
  };

  if (!isLoaded) {
    return <div className="fixed inset-0 bg-[#F5F5F7] z-50 pointer-events-none" />;
  }

  return (
    <GameContext.Provider value={{
      teamName,
      gameState,
      checkpoints,
      currentCheckpoint,
      verifyCode,
      advanceCheckpoint,
      beginTimer,
      startGame,
      resetGame,
      isLoading: !isLoaded
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
