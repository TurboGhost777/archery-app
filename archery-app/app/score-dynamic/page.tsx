'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { db } from '@/lib/db';
import { getLoggedInUser } from '@/lib/auth';
import { saveScore, completeSession } from '@/lib/sessionRepo';

import type { StoredSession, ArrowScore } from '../types/score';

export default function ScoreDynamicPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [session, setSession] = useState<StoredSession | null>(null);

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

  // Converts ArrowScore to numeric value for calculation
  const arrowToNumber = (a: ArrowScore): number => (a === null || a === 'M' ? 0 : a === 'X' ? 10 : a);

  const handleScore = async (endIndex: number, arrowIndex: number, value: ArrowScore) => {
    if (!session) return;
    await saveScore(session.id, endIndex, arrowIndex, value);
    const updated = await db.sessions.get(session.id);
    if (updated) setSession(updated);
  };

  if (!session) return <div className="p-6 text-center text-black">Loading session...</div>;

  // Flatten all arrows (cast to ArrowScore[])
  const allArrows = session.scores.flat() as ArrowScore[];

  const currentScore = allArrows.reduce<number>((sum, a) => sum + arrowToNumber(a), 0);
  const maxScore = session.scores.length * (session.scores[0]?.length ?? 0) * 10;

  const total10s = allArrows.filter(a => a === 10 || a === 'X').length;
  const totalXs = allArrows.filter(a => a === 'X').length;

  const getRingColor = (score: ArrowScore) => {
    if (score === null) return 'bg-gray-100';
    if (score === 'X' || score === 10) return 'bg-yellow-400';
    if (score === 9 || score === 8) return 'bg-red-500';
    if (score === 7 || score === 6) return 'bg-blue-500';
    if (score === 5 || score === 4) return 'bg-black text-white';
    if (score === 3 || score === 2 || score === 1) return 'bg-gray-300';
    if (score === 'M') return 'bg-gray-200';
    return 'bg-gray-100';
  };

  const getNextScore = (current: ArrowScore): ArrowScore => {
    if (current === null) return 10;
    if (typeof current === 'number') return current === 10 ? 9 : (current - 1) as ArrowScore;
    if (current === 'X') return 'M';
    if (current === 'M') return null;
    return 10;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
        <div>
          <h1 className="text-xl font-bold text-black">
            {session.distance}m · {session.sessionType}
          </h1>
          <div className="text-sm text-gray-700 mt-1">
            Score: {currentScore}/{maxScore} | 10s: {total10s} | Xs: {totalXs}
          </div>
        </div>
        <button onClick={() => router.push('/sessions')} className="px-4 py-2 bg-gray-600 text-white rounded">
          Back
        </button>
      </div>

      {/* Score Grid */}
      {session.scores.map((end, endIndex) => (
        <div key={endIndex} className="border rounded-lg p-3 bg-white shadow">
          <h3 className="font-semibold mb-2">End {endIndex + 1}</h3>
          <div className="grid grid-cols-6 gap-2">
            {end.map((arrow, arrowIndex) => (
              <button
                key={arrowIndex}
                className={`p-3 rounded-lg text-center font-bold ${getRingColor(arrow)}`}
                onClick={() => handleScore(endIndex, arrowIndex, getNextScore(arrow))}
              >
                {arrow ?? ''}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Complete Button */}
      {!session.completed && (
        <button
          onClick={async () => {
            await completeSession(session.id);
            router.push('/sessions');
          }}
          className="w-full bg-green-600 text-white py-2 rounded-lg mt-4"
        >
          Complete Session
        </button>
      )}
    </div>
  );
}
