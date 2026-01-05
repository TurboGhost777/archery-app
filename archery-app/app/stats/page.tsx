'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import type { StoredSession, ArrowScore } from '../types/score';

const DISTANCES = [18, 20, 30, 50, 70, 90];

/* ---------------- Helpers ---------------- */
function arrowValue(score: ArrowScore): number {
  if (score === null || score === 'M') return 0;
  if (score === 'X') return 10;
  return score;
}

function isTenOrX(score: ArrowScore): boolean {
  return score === 10 || score === 'X';
}

type DistanceStats = {
  totalScore: number;
  totalArrows: number;
};

export default function StatsPage() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(true);

  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [archerName, setArcherName] = useState('');
  const [archerSurname, setArcherSurname] = useState('');
  const [bowType, setBowType] = useState('');

  const [practiceStats, setPracticeStats] = useState<Record<number, number>>({});
  const [tournamentStats, setTournamentStats] = useState<Record<number, number>>({});
  const [overallAverage, setOverallAverage] = useState(0);
  const [tenXPercent, setTenXPercent] = useState(0);

  useEffect(() => {
    async function load() {
      const all = await db.sessions.toArray();
      if (!all.length) return;

      setSessions(all);
      setArcherName(all[0].archerName);
      setArcherSurname(all[0].archerSurname);
      setBowType(all[0].bowType);

      setPracticeStats(computeStats(all.filter(s => s.sessionType === 'PRACTICE')));
      setTournamentStats(computeStats(all.filter(s => s.sessionType === 'TOURNAMENT')));
      setOverallAverage(computeOverallAverage(all));
      setTenXPercent(computeTenXPercentage(all));
    }

    load();
  }, []);

  function computeStats(sessions: StoredSession[]): Record<number, number> {
    const stats: Record<number, DistanceStats> = {};
    DISTANCES.forEach(d => (stats[d] = { totalScore: 0, totalArrows: 0 }));

    sessions.forEach(session => {
      if (!stats[session.distance]) return;
      session.scores.forEach(end =>
        end.forEach(arrow => {
          stats[session.distance].totalScore += arrowValue(arrow);
          stats[session.distance].totalArrows++;
        })
      );
    });

    const averages: Record<number, number> = {};
    DISTANCES.forEach(d => {
      const s = stats[d];
      averages[d] = s.totalArrows ? +(s.totalScore / s.totalArrows).toFixed(2) : 0;
    });

    return averages;
  }

  function computeOverallAverage(sessions: StoredSession[]): number {
    let total = 0;
    let arrows = 0;

    sessions.forEach(s =>
      s.scores.forEach(end =>
        end.forEach(a => {
          total += arrowValue(a);
          arrows++;
        })
      )
    );

    return arrows ? +(total / arrows).toFixed(2) : 0;
  }

  function computeTenXPercentage(sessions: StoredSession[]): number {
    let tens = 0;
    let arrows = 0;

    sessions.forEach(s =>
      s.scores.forEach(end =>
        end.forEach(a => {
          if (a !== null) {
            arrows++;
            if (isTenOrX(a)) tens++;
          }
        })
      )
    );

    return arrows ? +((tens / arrows) * 100).toFixed(1) : 0;
  }

  function bestDistance(stats: Record<number, number>): number | null {
    let best: number | null = null;
    let bestValue = 0;

    for (const d of DISTANCES) {
      if ((stats[d] ?? 0) > bestValue) {
        bestValue = stats[d];
        best = d;
      }
    }
    return best;
  }

  const bestPractice = bestDistance(practiceStats);
  const bestTournament = bestDistance(tournamentStats);

  const bg = darkMode
    ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white'
    : 'bg-gray-100 text-black';

  return (
    <div className={`min-h-screen p-6 ${bg}`}>
      {/* Top bar */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-6">
        <button
          onClick={() => router.push('/sessions')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          ← Back to Sessions
        </button>

        <button
          onClick={() => setDarkMode(v => !v)}
          className="px-4 py-2 rounded-lg border"
        >
          {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-6">
        <h1 className="text-3xl font-extrabold">
          {archerName} {archerSurname}
        </h1>
        <p className="opacity-80">{bowType}</p>
      </div>

      {/* Stat cards */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-600 text-white rounded-2xl p-6 shadow text-center">
          <p className="text-sm uppercase opacity-90">Overall Avg / Arrow</p>
          <p className="text-4xl font-bold mt-2">{overallAverage}</p>
        </div>

        <div className="bg-purple-600 text-white rounded-2xl p-6 shadow text-center">
          <p className="text-sm uppercase opacity-90">10 / X Percentage</p>
          <p className="text-4xl font-bold mt-2">{tenXPercent}%</p>
        </div>
      </div>

      {/* Tables */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Practice */}
        <div className="bg-white text-black rounded-2xl shadow p-5">
          <h2 className="text-xl font-bold mb-3 text-blue-700">
            Practice (Best: {bestPractice ?? '-'}m)
          </h2>

          {DISTANCES.map(d => (
            <div
              key={d}
              className={`flex justify-between py-2 border-b ${
                d === bestPractice ? 'bg-blue-100 font-bold' : ''
              }`}
            >
              <span>{d}m</span>
              <span>{practiceStats[d] ?? 0}</span>
            </div>
          ))}
        </div>

        {/* Tournament */}
        <div className="bg-white text-black rounded-2xl shadow p-5">
          <h2 className="text-xl font-bold mb-3 text-red-700">
            Tournament (Best: {bestTournament ?? '-'}m)
          </h2>

          {DISTANCES.map(d => (
            <div
              key={d}
              className={`flex justify-between py-2 border-b ${
                d === bestTournament ? 'bg-red-100 font-bold' : ''
              }`}
            >
              <span>{d}m</span>
              <span>{tournamentStats[d] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
