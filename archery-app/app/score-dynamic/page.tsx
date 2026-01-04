'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  saveScore,
  loadSessionScores,
  deleteScore,
  completeSession,
} from '@/lib/sessionRepo';
import { db } from '@/lib/db';
import type { StoredSession } from '../types/score';

type ArrowScore = 'M' | 'X' | number | null;

const ARROWS_PER_END = 6;

/* ---------------- Score Button Colors ---------------- */
function scoreButtonClass(value: ArrowScore) {
  if (value === 'M') return 'bg-red-800 text-white';
  if (value === 'X' || value === 10 || value === 9)
    return 'bg-yellow-400 text-black';
  if (value === 8 || value === 7) return 'bg-red-500 text-black';
  if (value === 6 || value === 5) return 'bg-blue-500 text-black';
  if (value === 4 || value === 3) return 'bg-black text-white';
  if (value === 2 || value === 1) return 'bg-white text-black border';
  return '';
}

export default function ScorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [session, setSession] = useState<StoredSession | null>(null);
  const [scores, setScores] = useState<ArrowScore[][]>([]);
  const [activeArrow, setActiveArrow] =
    useState<{ end: number; arrow: number } | null>(null);

  /* ---------------- Load session ---------------- */
  useEffect(() => {
    if (!sessionId) {
      router.push('/sessions');
      return;
    }

    const id = sessionId as string;

    async function load() {
      const s = await db.sessions.get(id);
      if (!s) {
        router.push('/sessions');
        return;
      }
      setSession(s);
    }

    load();
  }, [sessionId, router]);

  /* ---------------- Init score grid ---------------- */
  useEffect(() => {
    if (!session) return;

    setScores(
      Array.from({ length: session.totalEnds }, () =>
        Array.from({ length: ARROWS_PER_END }, () => null)
      )
    );
  }, [session]);

  /* ---------------- Resume saved arrows ---------------- */
  useEffect(() => {
    if (!sessionId || !scores.length) return;

    const id = sessionId as string;

    async function resume() {
      const stored = await loadSessionScores(id);
      if (!stored.length) return;

      setScores(prev => {
        const copy = prev.map(end => [...end]);

        for (let e = 0; e < stored.length; e++) {
          for (let a = 0; a < stored[e].length; a++) {
            copy[e][a] = stored[e][a];
          }
        }

        return copy;
      });
    }

    resume();
  }, [sessionId, scores.length]);

  /* ---------------- Helpers ---------------- */
  function arrowValue(score: ArrowScore): number {
    if (score === null || score === 'M') return 0;
    if (score === 'X') return 10;
    return score;
  }

  function endTotal(endIndex: number): number {
    return scores[endIndex].reduce<number>(
      (sum, arrow) => sum + arrowValue(arrow),
      0
    );
  }

  function grandTotal(): number {
    return scores.reduce<number>(
      (sum, _, i) => sum + endTotal(i),
      0
    );
  }

  function isSessionComplete(): boolean {
  return scores.every(end => end.every(a => a !== null));
}

  function endTens(endIndex: number): number {
    return scores[endIndex].filter(a => a === 10 || a === 'X').length;
  }

  function endXs(endIndex: number): number {
    return scores[endIndex].filter(a => a === 'X').length;
  }

  function isEndComplete(endIndex: number): boolean {
    return scores[endIndex].every(a => a !== null);
  }

  const isReadOnly = session?.completed === true;

  function setScore(endIndex: number, value: ArrowScore) {
    if (!sessionId || isReadOnly) return;
    const id = sessionId as string;

    const updated = scores.map(end => [...end]);

    let e = endIndex;
    let a = -1;

    if (activeArrow) {
      e = activeArrow.end;
      a = activeArrow.arrow;
      updated[e][a] = value;
      setActiveArrow(null);
    } else {
      if (isEndComplete(endIndex)) return;
      a = updated[endIndex].findIndex(x => x === null);
      if (a !== -1) updated[endIndex][a] = value;
    }

    if (a !== -1) {
      saveScore(id, e, a, value);
    }

    setScores(updated);
  }

  async function undoLastArrow() {
    if (!sessionId || isReadOnly) return;
    const id = sessionId as string;

    const updated = scores.map(end => [...end]);

    for (let e = scores.length - 1; e >= 0; e--) {
      for (let a = ARROWS_PER_END - 1; a >= 0; a--) {
        if (updated[e][a] !== null) {
          updated[e][a] = null;
          setScores(updated);
          await deleteScore(id, e, a);
          return;
        }
      }
    }
  }

  if (!session) {
    return <div className="p-4 text-center text-black">Loading session...</div>;
  }

  const scoreButtons: ArrowScore[] = [
    'M', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'X',
  ];

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-screen bg-gray-200 p-4 text-black">
      <h1 className="text-2xl font-bold text-center mb-2">
        {session.archerName} {session.archerSurname} – {session.bowType} –{' '}
        {session.distance}m
      </h1>

      <div className="text-center mb-4 space-x-2">
        <p className="text-lg font-semibold">Total: {grandTotal()}</p>

      {!isSessionComplete() && (
  <p className="text-sm text-red-600 mt-2">
    ⚠️ Complete all arrows before ending the session
  </p>
)}

        <button
          onClick={undoLastArrow}
          disabled={isReadOnly}
          className="mt-2 px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-40"
        >
          Undo
        </button>

        <button
          onClick={() => router.push('/sessions')}
          className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg"
        >
          Exit
        </button>

        {!session.completed && (
          <button
  disabled={!isSessionComplete()}
  onClick={async () => {
    if (!isSessionComplete()) return;

    await completeSession(sessionId!);
    router.push('/sessions');
  }}
  className={`mt-2 px-4 py-2 rounded-lg text-white ${
    isSessionComplete()
      ? 'bg-green-700'
      : 'bg-gray-400 cursor-not-allowed'
  }`}
>
  End Session
</button>

        )}
      </div>
            <div className="space-y-4">
        {scores.map((end, endIndex) => (
          <div
            key={endIndex}
            className={`bg-white rounded-xl shadow p-4 ${
              isEndComplete(endIndex) ? 'opacity-70' : ''
            }`}
          >
            <div className="flex justify-between mb-2">
              <h2 className="font-bold">End {endIndex + 1}</h2>
              <span className="font-semibold">
                End Total: {endTotal(endIndex)}
              </span>
            </div>

            <div className="flex justify-between mb-2 text-sm">
              <span>10s: {endTens(endIndex)}</span>
              <span>Xs: {endXs(endIndex)}</span>
              <span className="font-bold">
                {isEndComplete(endIndex) ? 'Completed' : 'In Progress'}
              </span>
            </div>

            {/* Arrow slots */}
            <div className="grid grid-cols-6 gap-2 mb-3">
              {end.map((arrow, arrowIndex) => (
                <button
                  key={arrowIndex}
                  disabled={isReadOnly}
                  onClick={() =>
                    setActiveArrow({ end: endIndex, arrow: arrowIndex })
                  }
                  className={`h-10 border rounded-lg font-bold ${
                    activeArrow?.end === endIndex &&
                    activeArrow?.arrow === arrowIndex
                      ? 'ring-2 ring-blue-500'
                      : ''
                  }`}
                >
                  {arrow ?? '-'}
                </button>
              ))}
            </div>

            {/* Score buttons */}
            {!isReadOnly && (
              <div className="grid grid-cols-6 gap-2">
                {scoreButtons.map(v => (
                  <button
                    key={String(v)}
                    onClick={() => setScore(endIndex, v)}
                    className={`py-2 rounded-lg font-bold ${scoreButtonClass(v)}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
