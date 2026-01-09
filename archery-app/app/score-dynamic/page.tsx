'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { db } from '@/lib/db';
import { getLoggedInUser } from '@/lib/auth';
import { saveScore, completeSession } from '@/lib/sessionRepo';

import type { StoredSession, ArrowScore } from '../types/score';

/* ---------------- CONSTANTS ---------------- */

const SCORE_BUTTONS: ArrowScore[] = ['M', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'X'];

/* ---------------- HELPERS ---------------- */

const arrowToNumber = (a: ArrowScore | null): number => {
  if (a === null) return 0;
  if (a === 'M') return 0;
  if (a === 'X') return 10;
  return a;
};

const getRingColor = (score: ArrowScore | null): string => {
  if (score === null) return 'bg-gray-100 text-black';
  if (score === 'X' || score === 10) return 'bg-yellow-400 text-black';
  if (score === 9 || score === 8) return 'bg-red-500 text-white';
  if (score === 7 || score === 6) return 'bg-blue-500 text-white';
  if (score === 5 || score === 4) return 'bg-black text-white';
  if (score === 3 || score === 2 || score === 1) return 'bg-gray-300 text-black';
  if (score === 'M') return 'bg-gray-400 text-black';
  return 'bg-gray-100 text-black';
};

export default function ScoreDynamicPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [session, setSession] = useState<StoredSession | null>(null);

  /* ---------------- LOAD SESSION ---------------- */

  useEffect(() => {
    const load = async () => {
      const user = getLoggedInUser();
      if (!user) return router.replace('/login');
      if (!sessionId) return router.replace('/sessions');

      const s = await db.sessions.get(sessionId);
      if (!s || s.userId !== user.username) {
        alert('Unauthorized session access');
        return router.replace('/sessions');
      }

      setSession(s);
    };

    load();
  }, [sessionId, router]);

  /* ---------------- SCORE UPDATE ---------------- */

  const handleScore = async (
    endIndex: number,
    arrowIndex: number,
    value: ArrowScore | null
  ) => {
    if (!session) return;
    await saveScore(session.id, endIndex, arrowIndex, value);
    const updated = await db.sessions.get(session.id);
    if (updated) setSession(updated);
  };

  if (!session) {
    return <div className="p-6 text-center text-black">Loading session...</div>;
  }

  /* ---------------- CALCULATIONS ---------------- */

  const allArrows = session.scores.flat();

  const currentScore = allArrows.reduce(
    (sum, a) => sum + arrowToNumber(a),
    0
  );

  const arrowsPerEnd = session.scores[0]?.length ?? 0;
  const maxScore = session.scores.length * arrowsPerEnd * 10;

  const total10s = allArrows.filter(a => a === 10 || a === 'X').length;
  const totalXs = allArrows.filter(a => a === 'X').length;

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-black">
            {session.distance}m · {session.sessionType}
          </h1>
          <div className="text-sm text-gray-700">
            Score: {currentScore}/{maxScore} | 10s: {total10s} | Xs: {totalXs}
          </div>
        </div>

        <button
          onClick={() => router.push('/sessions')}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Back
        </button>
      </div>

      {/* Score Grid */}
      {session.scores.map((end, endIndex) => {
        const nextArrowIndex = end.findIndex(a => a === null);
        const endTotal = end.reduce(
          (sum, a) => sum + arrowToNumber(a),
          0
        );

        return (
          <div
            key={endIndex}
            className="border rounded-lg p-4 bg-white shadow space-y-3"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-black">
                End {endIndex + 1}
              </h3>
              <span className="text-sm text-gray-600">
                End Total: {endTotal}
              </span>
            </div>

            {/* Arrow Boxes */}
            <div className="grid grid-cols-6 gap-2">
              {end.map((arrow, i) => (
                <div
                  key={i}
                  className={`h-12 rounded border flex items-center justify-center font-bold text-lg ${getRingColor(
                    arrow
                  )}`}
                >
                  {arrow ?? ''}
                </div>
              ))}
            </div>

            {/* Score Buttons */}
            <div className="grid grid-cols-6 gap-2">
              {SCORE_BUTTONS.map(score => (
                <button
                  key={String(score)}
                  disabled={nextArrowIndex === -1}
                  onClick={() =>
                    handleScore(endIndex, nextArrowIndex, score)
                  }
                  className={`py-2 rounded font-bold ${getRingColor(score)} ${
                    nextArrowIndex === -1
                      ? 'opacity-40 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>

            {/* Undo */}
            <button
              onClick={() => {
                const lastFilled = [...end]
                  .reverse()
                  .findIndex(a => a !== null);
                if (lastFilled === -1) return;
                const realIndex = end.length - 1 - lastFilled;
                handleScore(endIndex, realIndex, null);
              }}
              className="w-full bg-gray-300 text-black py-2 rounded"
            >
              Undo Last Arrow
            </button>
          </div>
        );
      })}

      {/* Complete Session */}
      {!session.completed && (
        <button
          onClick={async () => {
            await completeSession(session.id);
            router.push('/sessions');
          }}
          className="w-full bg-green-600 text-white py-3 rounded-lg"
        >
          Complete Session
        </button>
      )}
    </div>
  );
}
