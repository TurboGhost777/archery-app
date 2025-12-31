'use client';

import { useState } from 'react';

type ArrowScore = 'M' | 'X' | number | null;

const SCORE_VALUES: Record<string, number> = {
  M: 0,
  X: 10,
};

const ARROWS_PER_END = 6;
const TOTAL_ENDS = 6;

export default function ScorePage() {
  const [scores, setScores] = useState<ArrowScore[][]>(
    Array.from({ length: TOTAL_ENDS }, () =>
      Array.from({ length: ARROWS_PER_END }, () => null)
    )
  );

  function setArrowScore(endIndex: number, arrowIndex: number, value: ArrowScore) {
    const updated = [...scores];
    updated[endIndex][arrowIndex] = value;
    setScores(updated);
  }

  function calculateArrowValue(score: ArrowScore): number {
    if (score === null) return 0;
    if (typeof score === 'number') return score;
    return SCORE_VALUES[score];
  }

function calculateEndTotal(endIndex: number): number {
  const end = scores[endIndex];
  if (!end) return 0;

  return end.reduce<number>((sum, s) => {
    return sum + calculateArrowValue(s);
  }, 0);
}

 function calculateGrandTotal(): number {
  return scores.reduce((sum, _, endIndex) => {
    return sum + calculateEndTotal(endIndex);
  }, 0);
}
  const scoreButtons: (ArrowScore)[] = ['M', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'X'];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">
        Archery Scoring
      </h1>

      <div className="text-center mb-6">
        <p className="text-lg font-semibold">
          Total Score: <span className="text-green-600">{calculateGrandTotal()}</span> / 360
        </p>
      </div>

      <div className="space-y-4">
        {scores.map((end, endIndex) => (
          <div
            key={endIndex}
            className="bg-white rounded-xl shadow p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-lg">
                End {endIndex + 1}
              </h2>
              <span className="font-semibold">
                End Total: {calculateEndTotal(endIndex)}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2 mb-3">
              {end.map((arrow, arrowIndex) => (
                <div
                  key={arrowIndex}
                  className="h-10 flex items-center justify-center rounded-lg border font-bold text-lg bg-gray-50"
                >
                  {arrow ?? '-'}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-6 gap-2">
              {scoreButtons.map((value) => (
                <button
                  key={String(value)}
                  onClick={() => {
                    const arrowIndex = end.findIndex(a => a === null);
                    if (arrowIndex !== -1) {
                      setArrowScore(endIndex, arrowIndex, value);
                    }
                  }}
                  className={`py-2 rounded-lg font-bold text-sm
                    ${value === 'X' ? 'bg-yellow-400' :
                      value === 'M' ? 'bg-red-400 text-white' :
                      'bg-green-600 text-white'}
                  `}
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
