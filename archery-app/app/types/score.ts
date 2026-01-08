// app/types/score.ts
export type ArrowScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'X' | 'M' | null;

export type StoredScore = {
  sessionId: string;
  endIndex: number;
  arrowIndex: number;
  value: ArrowScore;
  scores: (number | null)[][]; // full session matrix (6 arrows per end)
};

export type StoredSession = {
  id: string;
  userId: string;

  archerName: string;
  archerSurname: string;
  bowType: 'COMPOUND' | 'RECURVE' | 'BAREBOW';
  distance: number;
  totalEnds: number;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
  completed: boolean;
  sessionType?: 'PRACTICE' | 'TOURNAMENT';
  scores: ArrowScore[][];// numeric values stored for scoring
  xCount: number; // total Xs in the session
};

/* ------------------- Helpers for score calculations ------------------- */

/**
 * Convert an ArrowScore to numeric value for total calculation
 */
export function arrowValue(score: ArrowScore): number {
  if (score === null || score === 'M') return 0;
  if (score === 'X') return 10;
  return score;
}

/**
 * Check if the arrow is an X (counts for xCount)
 */
export function isX(score: ArrowScore): boolean {
  return score === 'X';
}

/**
 * Compute stats for a session: total score, best end, X count
 */
export function computeFromScores(session: StoredSession) {
  let totalScore = 0;
  let xCount = 0;
  let bestEnd = 0;
  const endScores: number[] = [];

  session.scores.forEach((end, idx) => {
    let endTotal = 0;
    end.forEach(arrow => {
      endTotal += arrowValue(arrow);
      if (isX(arrow)) xCount++;
    });
    endScores.push(endTotal);
    if (endTotal > bestEnd) bestEnd = endTotal;
    totalScore += endTotal;
  });

  const avgPerEnd = session.totalEnds ? +(totalScore / session.totalEnds).toFixed(2) : 0;

  return {
    totalScore,
    xCount,
    bestEnd,
    avgPerEnd,
    endScores,
  };
}
