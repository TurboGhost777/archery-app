'use client';

import { useState } from 'react';

type ArrowScore = 'M' | 'X' | number | null;

const ARROWS_PER_END = 6;
const TOTAL_ENDS = 6;

export default function ScorePage() {
  const [scores, setScores] = useState<ArrowScore[][]>(
    Array.from({ length: TOTAL_ENDS }, () =>
      Array.from({ length: ARROWS_PER_END }, () => null)
    )
  );

  const [activeArrow, setActiveArrow] = useState<{
    end: number;
    arrow: number;
  } | null>(null);

  function calculateArrowValue(score: ArrowScore): number {
    if (score === null) return 0;
    if (score === 'M') return 0;
    if (score === 'X') return 10;
    return score;
  }

  function calculateEndTotal(endIndex: number): number {
    const end = scores[endIndex];
    if (!end) return 0;

    return end.reduce<number>((sum, s) => {
      return sum + calculateArrowValue(s);
    }, 0);
  }

  function calculateGrandTotal(): number {
    return scores.reduce<number>((sum, _, endIndex) => {
      return sum + calculateEndTotal(endIndex);
    }, 0);
  }

  function setScore(endIndex: number, value: ArrowScore) {
    const updated = scores.map(end => [...end]);

    if (activeArrow) {
      updated[activeArrow.end][activeArrow.arrow] = value;
      setActiveArrow(null);
    } else {
      const arrowIndex = updated[endIndex].findIndex(a => a === null);
      if (arrowIndex !== -1) {
        updated[endIndex][arrowIndex] = value;
      }
    }

    setScores(updated);
  }

  function scoreButtonClass(value: ArrowScore) {
    if (value === 'M') return 'bg-red-800 text-white';
    if (value === 'X' || value === 10 || value === 9) return 'bg-yellow-400 text-black';
    if (value === 8 || value === 7) return 'bg-red-500 text-black';
    if (value === 6 || value === 5) return 'bg-blue-500 text-Blue-100';
    if (value === 4 || value === 3) return 'bg-black text-white';
    if (value === 2 || value === 1) return 'bg-white text-black border';

    return '';
  }

  const scoreButtons: ArrowScore[] = ['M', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'X'];

  return (
    <div className="min-h-screen bg-gray-200 p-4 text-black">
      <h1 className="text-2xl font-bold text-center mb-4">
        Archery Scoring
      </h1>

      <div className="text-center mb-6">
        <p className="text-lg font-semibold">
          Total Score: {calculateGrandTotal()} / 360
        </p>
      </div>

      <div className="space-y-4">
        {scores.map((end, endIndex) => (
          <div key={endIndex} className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between mb-2">
              <h2 className="font-bold text-lg">End {endIndex + 1}</h2>
              <span className="font-semibold">
                End Total: {calculateEndTotal(endIndex)}
              </span>
            </div>

            {/* Arrow display */}
            <div className="grid grid-cols-6 gap-2 mb-3">
              {end.map((arrow, arrowIndex) => (
                <button
                  key={arrowIndex}
                  onClick={() =>
                    setActiveArrow({ end: endIndex, arrow: arrowIndex })
                  }
                  className={`h-10 rounded-lg font-bold text-lg border
                    ${activeArrow?.end === endIndex &&
                    activeArrow?.arrow === arrowIndex
                      ? 'ring-2 ring-blue-500'
                      : ''}
                  `}
                >
                  {arrow ?? '-'}
                </button>
              ))}
            </div>

            {/* Score buttons */}
            <div className="grid grid-cols-6 gap-2">
              {scoreButtons.map(value => (
                <button
                  key={String(value)}
                  onClick={() => setScore(endIndex, value)}
                  className={`py-2 rounded-lg font-bold text-sm ${scoreButtonClass(
                    value
                  )}`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
