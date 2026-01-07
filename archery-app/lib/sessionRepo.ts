import { db } from './db';
import type { StoredSession } from '../app/types/score';

/* ---------- Scoring Types ---------- */
// Raw input allowed from UI
export type ArrowInput = 'M' | 'X' | number | null;

/* Convert UI value → numeric for DB */
function toNumber(v: ArrowInput): number | null {
  if (v === 'M') return 0;
  if (v === 'X') return 10;
  return v;
}

/* ---------- Create Session ---------- */
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

    /* numeric score matrix */
    scores: Array.from({ length: params.totalEnds }, () =>
      Array.from({ length: 6 }, () => null)
    ),

    /* NEW: X counter */
    xCount: 0,
  };

  await db.sessions.add(session);
  return id;
}

/* ---------- Save Arrow Score ---------- */
export async function saveScore(
  sessionId: string,
  endIndex: number,
  arrowIndex: number,
  value: ArrowInput
) {
  const session = await db.sessions.get(sessionId);
  if (!session) return;

  const numeric = toNumber(value);

  const updated = session.scores.map(e => [...e]);
  updated[endIndex][arrowIndex] = numeric;

  session.scores = updated;
  session.updatedAt = Date.now();

  if (value === 'X') {
    session.xCount += 1;
  }

  await db.sessions.put(session);
}

/* ---------- Load Session Scores ---------- */
export async function loadSessionScores(
  sessionId: string
): Promise<(number | null)[][]> {
  const session = await db.sessions.get(sessionId);
  return session?.scores ?? [];
}

/* ---------- Delete Arrow + Reverse X ---------- */
export async function deleteScore(
  sessionId: string,
  endIndex: number,
  arrowIndex: number
) {
  const session = await db.sessions.get(sessionId);
  if (!session) return;

  const current = session.scores[endIndex][arrowIndex];

  const updated = session.scores.map(e => [...e]);
  updated[endIndex][arrowIndex] = null;

  session.scores = updated;
  session.updatedAt = Date.now();

  if (current === 10) {
    await recalcX(sessionId);
  }

  await db.sessions.put(session);
}

/* ---------- Recalc X (safe source of truth) ---------- */
export async function recalcX(sessionId: string) {
  const s = await db.sessions.get(sessionId);
  if (!s) return;

  const all = await db.scores
    .where({ sessionId })
    .toArray();

  s.xCount = all.filter(a => a.value === 'X').length;
  s.updatedAt = Date.now();

  await db.sessions.put(s);
}

/* ---------- Mark Completed ---------- */
export async function completeSession(sessionId: string) {
  const session = await db.sessions.get(sessionId);
  if (!session) return;

  session.completed = true;
  session.updatedAt = Date.now();

  await db.sessions.put(session);
}

/* ---------- Validate before ending ---------- */
export async function canEndSession(sessionId: string) {
  const session = await db.sessions.get(sessionId);
  if (!session) return false;

  /* prevent partial ends */
  const hasPartial = session.scores.some(end =>
    end.some(a => a === null)
  );

  return !hasPartial;
}
