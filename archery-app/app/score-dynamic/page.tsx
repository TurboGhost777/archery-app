'use client';
import { useState } from 'react';

type ArrowScore = 'M' | 'X' | number | null;

interface ArcherInfo {
  name: string;
  surname: string;
  bowType: string;
  distance: number;
  totalEnds: number;
}

interface ScorePageProps {
  archer: ArcherInfo;
}

export default function ScorePage({ archer }: ScorePageProps) {
  const ARROWS_PER_END = 6;
  const [scores, setScores] = useState<ArrowScore[][]>(
    Array.from({ length: archer.totalEnds }, () =>
      Array.from({ length: ARROWS_PER_END }, () => null)
    )
  );
  const [activeArrow, setActiveArrow] = useState<{ end: number; arrow: number } | null>(null);

  // --- Scoring functions ---
  function calculateArrowValue(score: ArrowScore): number {
    if (score === null) return 0;
    if (score === 'M') return 0;
    if (score === 'X') return 10;
    return score;
  }

  function calculateEndTotal(endIndex: number): number {
    const end = scores[endIndex];
    if (!end) return 0;
    return end.reduce<number>((sum, s) => sum + calculateArrowValue(s), 0);
  }

  function calculateGrandTotal(): number {
    return scores.reduce<number>((sum, _, endIndex) => sum + calculateEndTotal(endIndex), 0);
  }

  function isEndComplete(endIndex: number): boolean {
    return scores[endIndex].every(score => score !== null);
  }

  function setScore(endIndex: number, value: ArrowScore) {
    const updated = scores.map(end => [...end]);

    if (activeArrow) {
      updated[activeArrow.end][activeArrow.arrow] = value;
      setActiveArrow(null);
    } else {
      if (isEndComplete(endIndex)) return;

      const arrowIndex = updated[endIndex].findIndex(a => a === null);
      if (arrowIndex !== -1) updated[endIndex][arrowIndex] = value;
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
    if (value === 'X' || value === 10 || value === 9) return 'bg-yellow-400 text-black';
    if (value === 8 || value === 7) return 'bg-red-500 text-black';
    if (value === 6 || value === 5) return 'bg-blue-500 text-black';
    if (value === 4 || value === 3) return 'bg-black text-white';
    if (value === 2 || value === 1) return 'bg-white text-black border';
    return '';
  }

  function calculateEndCounts(endIndex: number) {
  const end = scores[endIndex];
  if (!end) return { tens: 0, xs: 0 };
  let tens = 0;
  let xs = 0;

  for (const score of end) {
    if (score === 'X') {
      tens += 1;
      xs += 1;
    } else if (score === 10) {
      tens += 1;
    }
  }

  return { tens, xs };
}

function calculateGrandCounts() {
  let totalTens = 0;
  let totalXs = 0;

  scores.forEach((_, endIndex) => {
    const { tens, xs } = calculateEndCounts(endIndex);
    totalTens += tens;
    totalXs += xs;
  });

  return { totalTens, totalXs };
}

  const scoreButtons: ArrowScore[] = ['M', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'X'];

  // --- Render scoring page ---
  return (
    <div className="min-h-screen bg-gray-200 p-4 text-black">
      <h1 className="text-2xl font-bold text-center mb-2">
        {archer.name} {archer.surname} - {archer.bowType} - {archer.distance}m
      </h1>

    <div className="text-center mb-4">
  {(() => {
    const { totalTens, totalXs } = calculateGrandCounts();
    return (
      <p className="text-lg font-semibold">
        Total Score: {calculateGrandTotal()} / {scores.length * ARROWS_PER_END * 10} | 
        10s: {totalTens} | Xs: {totalXs}
      </p>
    );
  })()}

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

          return (
            <div
              key={endIndex}
              className={`bg-white rounded-xl shadow p-4 ${complete ? 'opacity-70' : ''}`}
            >
              <div className="flex justify-between mb-2">
  <h2 className="font-bold text-lg">End {endIndex + 1}</h2>
  {(() => {
    const { tens, xs } = calculateEndCounts(endIndex);
    return (
      <span className="font-semibold">
        End Total: {calculateEndTotal(endIndex)} | 10s: {tens} | Xs: {xs}
      </span>
    );
  })()}
</div>

              <div className="grid grid-cols-6 gap-2 mb-3">
                {scores[endIndex].map((arrow, arrowIndex) => (
                  <button
                    key={arrowIndex}
                    onClick={() => setActiveArrow({ end: endIndex, arrow: arrowIndex })}
                    className={`h-10 rounded-lg font-bold text-lg border ${
                      activeArrow?.end === endIndex && activeArrow?.arrow === arrowIndex
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
                    onClick={() => setScore(endIndex, value as ArrowScore)}
                    disabled={complete && !activeArrow}
                    className={`py-2 rounded-lg font-bold text-sm ${scoreButtonClass(value as ArrowScore)} ${
                      complete && !activeArrow ? 'opacity-50 cursor-not-allowed' : ''
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
