'use client';

import { useEffect, useState } from 'react';
import type { ScorePageProps } from '../types/scorePageProps';
import { saveScore, loadSessionScores, createSession } from '@/lib/sessionRepo';

type ArrowScore = 'M' | 'X' | number | null;

export default function ScorePage({ archer, sessionId }: ScorePageProps) {
  const ARROWS_PER_END = 6;

  const [scores, setScores] = useState<ArrowScore[][]>(
    Array.from({ length: archer.totalEnds }, () =>
      Array.from({ length: ARROWS_PER_END }, () => null)
    )
  );

  const [activeArrow, setActiveArrow] =
    useState<{ end: number; arrow: number } | null>(null);

  // --- Create session once ---
  useEffect(() => {
    createSession({
      id: sessionId,
      archerName: archer.name,
      archerSurname: archer.surname,
      bowType: archer.bowType,
      distance: archer.distance,
      totalEnds: archer.totalEnds,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: false,
    });
  }, [sessionId, archer]);

  // --- Resume saved scores ---
  useEffect(() => {
    async function resumeScores() {
      const stored = await loadSessionScores(sessionId);
      if (!stored.length) return;

      setScores(prev => {
        const copy = prev.map(end => [...end]);
        for (const s of stored) {
          copy[s.endIndex][s.arrowIndex] = s.value;
        }
        return copy;
      });
    }

    resumeScores();
  }, [sessionId]);

  // --- Helper functions ---
  function calculateArrowValue(score: ArrowScore): number {
    if (score === null || score === 'M') return 0;
    if (score === 'X') return 10;
    return score as number;
  }

  function calculateEndTotal(endIndex: number): number {
    return scores[endIndex].reduce<number>(
      (sum, s) => sum + calculateArrowValue(s),
      0
    );
  }

  function calculateGrandTotal(): number {
    return scores.reduce(
      (sum, _, endIndex) => sum + calculateEndTotal(endIndex),
      0
    );
  }

  function calculateEndTens(endIndex: number): number {
    return scores[endIndex].filter(
      score => score === 10 || score === 'X'
    ).length;
  }

  function calculateEndXs(endIndex: number): number {
    return scores[endIndex].filter(score => score === 'X').length;
  }

  function isEndComplete(endIndex: number): boolean {
    return scores[endIndex].every(score => score !== null);
  }

  function setScore(endIndex: number, value: ArrowScore) {
    const updated = scores.map(end => [...end]);

    let targetEnd = endIndex;
    let targetArrow = -1;

    if (activeArrow) {
      targetEnd = activeArrow.end;
      targetArrow = activeArrow.arrow;
      updated[targetEnd][targetArrow] = value;
      setActiveArrow(null);
    } else {
      if (isEndComplete(endIndex)) return;
      targetArrow = updated[endIndex].findIndex(a => a === null);
      if (targetArrow !== -1) {
        updated[endIndex][targetArrow] = value;
      }
    }

    if (targetArrow !== -1) {
      saveScore(sessionId, targetEnd, targetArrow, value);
    }

    setScores(updated);
  }

  function undoLastArrow() {
    const updated = scores.map(end => [...end]);
    for (let e = scores.length - 1; e >= 0; e--) {
      for (let a = ARROWS_PER_END - 1; a >= 0; a--) {
        if (updated[e][a] !== null) {
          updated[e][a] = null;
          setScores(updated);
          return;
        }
      }
    }
  }

  function scoreButtonClass(value: ArrowScore) {
    if (value === 'M') return 'bg-red-800 text-white';
    if (value === 'X' || value === 10 || value === 9)
      return 'bg-yellow-400 text-black';
    if (value === 8 || value === 7) return 'bg-red-500 text-black';
    if (value === 6 || value === 5) return 'bg-blue-500 text-black';
    if (value === 4 || value === 3) return 'bg-black text-white';
    if (value === 2 || value === 1)
      return 'bg-white text-black border';
    return '';
  }

  const scoreButtons: ArrowScore[] = [
    'M',
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    'X',
  ];

  const tens = scores.reduce(
    (sum, _, endIndex) => sum + calculateEndTens(endIndex),
    0
  );
  const xs = scores.reduce(
    (sum, _, endIndex) => sum + calculateEndXs(endIndex),
    0
  );

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-200 p-4 text-black">
      <h1 className="text-2xl font-bold text-center mb-2">
        {archer.name} {archer.surname} – {archer.bowType} – {archer.distance}m
      </h1>

      <div className="text-center mb-4">
        <p className="text-lg font-semibold">
          Total Score: {calculateGrandTotal()}
        </p>
        <p className="text-lg font-semibold">
          10s (including X): {tens}
        </p>
        <p className="text-lg font-semibold">Xs: {xs}</p>
        <button
          onClick={undoLastArrow}
          className="mt-2 px-4 py-2 bg-gray-700 text-white rounded-lg"
        >
          Undo Last Arrow
        </button>
      </div>

      <div className="space-y-4">
        {scores.map((end, endIndex) => {
          const complete = isEndComplete(endIndex);
          const endTens = end.filter(a => a === 10 || a === 'X').length;
          const endXs = end.filter(a => a === 'X').length;

          return (
            <div
              key={endIndex}
              className={`bg-white rounded-xl shadow p-4 ${
                complete ? 'opacity-70' : ''
              }`}
            >
              <div className="flex justify-between mb-2">
                <h2 className="font-bold text-lg">
                  End {endIndex + 1}
                </h2>
                <span className="font-semibold">
                  End Total: {calculateEndTotal(endIndex)}
                </span>
              </div>

              <div className="flex justify-between mb-2 text-sm">
                <span>10s (including X): {endTens}</span>
                <span>Xs: {endXs}</span>
              </div>

              <div className="grid grid-cols-6 gap-2 mb-3">
                {end.map((arrow, arrowIndex) => (
                  <button
                    key={arrowIndex}
                    onClick={() =>
                      setActiveArrow({ end: endIndex, arrow: arrowIndex })
                    }
                    className={`h-10 rounded-lg font-bold text-lg border ${
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

              <div className="grid grid-cols-6 gap-2">
                {scoreButtons.map(value => (
                  <button
                    key={String(value)}
                    onClick={() => setScore(endIndex, value)}
                    disabled={complete && !activeArrow}
                    className={`py-2 rounded-lg font-bold text-sm ${scoreButtonClass(
                      value
                    )} ${
                      complete && !activeArrow
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
