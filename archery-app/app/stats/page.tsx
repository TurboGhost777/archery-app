'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import type { StoredSession, ArrowScore } from '../types/score';

const DISTANCES = [18, 20, 30, 50, 70, 90];

/* ---------------- Helpers ---------------- */
function arrowValue(score: ArrowScore): number {
  if (score === null || score === 'M') return 0;
  if (score === 'X') return 10;
  return score;
}

type DistanceStats = {
  totalScore: number;
  totalArrows: number;
};

export default function StatsPage() {
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [archerName, setArcherName] = useState<string>('');
  const [archerSurname, setArcherSurname] = useState<string>('');
  const [bowType, setBowType] = useState<string>('');

  const [practiceStats, setPracticeStats] = useState<Record<number, number>>({});
  const [tournamentStats, setTournamentStats] = useState<Record<number, number>>({});
  const [overallAverage, setOverallAverage] = useState<number>(0);

  useEffect(() => {
    async function load() {
      const all = await db.sessions.toArray();
      if (!all.length) return;

      setSessions(all);

      // Set archer info from first session
      setArcherName(all[0].archerName);
      setArcherSurname(all[0].archerSurname);
      setBowType(all[0].bowType);

      // Separate practice and tournament sessions
      const practice: StoredSession[] = all.filter(s => s.sessionType === 'PRACTICE');
      const tournament: StoredSession[] = all.filter(s => s.sessionType === 'TOURNAMENT');

      // Compute stats
      setPracticeStats(computeStats(practice));
      setTournamentStats(computeStats(tournament));
      setOverallAverage(computeOverallAverage(all));
    }

    load();
  }, []);

  function computeStats(sessions: StoredSession[]): Record<number, number> {
    const stats: Record<number, DistanceStats> = {};

    for (const d of DISTANCES) {
      stats[d] = { totalScore: 0, totalArrows: 0 };
    }

    sessions.forEach(session => {
      const distance = session.distance;
      if (!stats[distance]) return;

      session.scores.forEach(end => {
        end.forEach(arrow => {
          stats[distance].totalScore += arrowValue(arrow);
          stats[distance].totalArrows += 1;
        });
      });
    });

    // Convert to average per distance
    const averages: Record<number, number> = {};
    for (const d of DISTANCES) {
      const s = stats[d];
      averages[d] = s.totalArrows ? +(s.totalScore / s.totalArrows).toFixed(2) : 0;
    }

    return averages;
  }

  function computeOverallAverage(sessions: StoredSession[]): number {
    let totalScore = 0;
    let totalArrows = 0;

    sessions.forEach(session => {
      session.scores.forEach(end => {
        end.forEach(arrow => {
          totalScore += arrowValue(arrow);
          totalArrows += 1;
        });
      });
    });

    return totalArrows ? +(totalScore / totalArrows).toFixed(2) : 0;
  }

  return (
    <div className="min-h-screen bg-gray-200 p-4 text-black">
      <h1 className="text-2xl font-bold text-center mb-4">
        {archerName} {archerSurname} – {bowType}
      </h1>

      <div className="mb-6">
        <p className="text-lg font-semibold text-center">
          Overall Average per Arrow: {overallAverage}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Practice Section */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-2">Practice Averages</h2>
          <table className="w-full table-auto border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Distance (m)</th>
                <th className="border px-2 py-1">Avg per Arrow</th>
              </tr>
            </thead>
            <tbody>
              {DISTANCES.map(d => (
                <tr key={d}>
                  <td className="border px-2 py-1 text-center">{d}</td>
                  <td className="border px-2 py-1 text-center">{practiceStats[d] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tournament Section */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-2">Tournament Averages</h2>
          <table className="w-full table-auto border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Distance (m)</th>
                <th className="border px-2 py-1">Avg per Arrow</th>
              </tr>
            </thead>
            <tbody>
              {DISTANCES.map(d => (
                <tr key={d}>
                  <td className="border px-2 py-1 text-center">{d}</td>
                  <td className="border px-2 py-1 text-center">{tournamentStats[d] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
