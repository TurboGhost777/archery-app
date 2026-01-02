import { db } from './db';
import type { StoredSession, StoredScore, ArrowScore } from '../app/types/score';

export async function createSession(session: StoredSession) {
  const existing = await db.sessions.get(session.id);
  if (!existing) {
    await db.sessions.put(session);
  }
}

export async function saveScore(
  sessionId: string,
  endIndex: number,
  arrowIndex: number,
  value: ArrowScore
) {
  await db.scores.put({
    sessionId,
    endIndex,
    arrowIndex,
    value,
  });

  await db.sessions.update(sessionId, {
    updatedAt: Date.now(),
    synced: false,
  });
}

export async function loadSessionScores(sessionId: string) {
  return db.scores.where('sessionId').equals(sessionId).toArray();
}

export async function deleteScore(
  sessionId: string,
  endIndex: number,
  arrowIndex: number
) {
  await db.scores
    .where({ sessionId, endIndex, arrowIndex })
    .delete();

  await db.sessions.update(sessionId, {
    updatedAt: Date.now(),
    synced: false,
  });
}

export async function completeSession(sessionId: string) {
  await db.sessions.update(sessionId, {
    completed: true,
    updatedAt: Date.now(),
    synced: false,
  });
}

export async function deleteSession(sessionId: string) {
  await db.scores.where('sessionId').equals(sessionId).delete();
  await db.sessions.delete(sessionId);
}

export async function listSessions() {
  return db.sessions
    .orderBy('createdAt')
    .reverse()
    .toArray();
}
