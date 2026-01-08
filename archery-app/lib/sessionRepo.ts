// lib/sessionRepo.ts
'use client';

import { db } from '@/lib/db';
import type { StoredSession, ArrowScore } from '@/app/types/score';

// Helper: convert ArrowScore to numeric value for totals
export const arrowToNumber = (a: ArrowScore): number => {
  if (a === null || a === 'M') return 0;
  if (a === 'X') return 10;
  return typeof a === 'number' ? a : 0;
};

// Create a new session
export const createSession = async (
  userId: string,
  archerName: string,
  archerSurname: string,
  bowType: 'COMPOUND' | 'RECURVE' | 'BAREBOW',
  distance: number,
  totalEnds: number,
  arrowsPerEnd: number,
  sessionType: 'PRACTICE' | 'TOURNAMENT'
): Promise<StoredSession> => {
  const newSession: StoredSession = {
    id: crypto.randomUUID(),
    userId,
    archerName,
    archerSurname,
    bowType,
    distance,
    totalEnds,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    synced: false,
    completed: false,
    sessionType,
    scores: Array.from({ length: totalEnds }, () =>
      Array.from({ length: arrowsPerEnd }, () => null as ArrowScore)
    ),
    xCount: 0,
  };

  await db.sessions.add(newSession);
  return newSession;
};

// Save/update a score
export const saveScore = async (
  sessionId: string,
  endIndex: number,
  arrowIndex: number,
  value: ArrowScore
) => {
  const session = await db.sessions.get(sessionId);
  if (!session) return;

  session.scores[endIndex][arrowIndex] = value;
  session.updatedAt = Date.now();
  await db.sessions.put(session);
};

// Complete a session
export const completeSession = async (sessionId: string) => {
  const session = await db.sessions.get(sessionId);
  if (!session) return;

  session.completed = true;
  session.updatedAt = Date.now();
  await db.sessions.put(session);
};

// Load all sessions for a user
export const loadUserSessions = async (userId: string) => {
  return await db.sessions.where('userId').equals(userId).toArray();
};

// Optional: calculate total score for a session
export const calculateTotal = (session: StoredSession): number => {
  return session.scores.flat().reduce((sum: number, a: ArrowScore) => sum + arrowToNumber(a), 0);
};

// Optional: count Xs
export const countXs = (session: StoredSession): number => {
  return session.scores.flat().filter(a => a === 'X').length;
};

// Optional: count 10s (10 + X)
export const countTens = (session: StoredSession): number => {
  return session.scores.flat().filter(a => a === 10 || a === 'X').length;
};
