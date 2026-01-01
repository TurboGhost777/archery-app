import { db } from './db';
import type { StoredSession, StoredScore, ArrowScore } from '../app/types/score';

export async function createSession(session: StoredSession) {
  await db.sessions.put(session);
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
