import { db } from './db';
import type { StoredSession, ArrowScore } from '../app/types/score';

/* ---------------- Create a new session ---------------- */
export async function createSession(params: {
  archerName?: string;
  archerSurname?: string;
  bowType?: 'COMPOUND' | 'RECURVE' | 'BAREBOW';
  distance: number;
  totalEnds: number;
  sessionType?: 'PRACTICE' | 'TOURNAMENT';
}) {
  const id = crypto.randomUUID();

  const session: StoredSession = {
    id,
    archerName: params.archerName ?? 'New',
    archerSurname: params.archerSurname ?? 'Archer',
    bowType: params.bowType ?? 'COMPOUND',
    distance: params.distance,
    totalEnds: params.totalEnds,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    synced: false,
    completed: false,
    sessionType: params.sessionType ?? 'PRACTICE',
    scores: Array.from({ length: params.totalEnds }, () =>
      Array.from({ length: 6 }, () => null)
    ),
  };

  await db.sessions.add(session); 
  return id;
}

/* ---------------- Save an arrow score ---------------- */
export async function saveScore(
  sessionId: string,
  endIndex: number,
  arrowIndex: number,
  value: ArrowScore
) {
  const session = await db.sessions.get(sessionId);
  if (!session) return;

  // Deep copy scores
  const updated = session.scores.map(end => [...end]);
  updated[endIndex][arrowIndex] = value;

  session.scores = updated;
  session.updatedAt = Date.now();

  await db.sessions.put(session);
}

/* ---------------- Load all scores for a session ---------------- */
export async function loadSessionScores(sessionId: string): Promise<ArrowScore[][]> {
  const session = await db.sessions.get(sessionId);
  return session?.scores ?? [];
}

/* ---------------- Delete a specific arrow ---------------- */
export async function deleteScore(sessionId: string, endIndex: number, arrowIndex: number) {
  const session = await db.sessions.get(sessionId);
  if (!session) return;

  const updated = session.scores.map(end => [...end]);
  updated[endIndex][arrowIndex] = null;

  session.scores = updated;
  session.updatedAt = Date.now();

  await db.sessions.put(session);
}

/* ---------------- Mark a session as completed ---------------- */
export async function completeSession(sessionId: string) {
  const session = await db.sessions.get(sessionId);
  if (!session) return;

  session.completed = true;
  session.updatedAt = Date.now();

  await db.sessions.put(session);
}
