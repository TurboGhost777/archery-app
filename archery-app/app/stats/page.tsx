'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import type { StoredSession, ArrowScore } from '../types/score';
import { computeFromScores } from '../types/score';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const DISTANCES = [18, 20, 30, 50, 70, 90];

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
  const [bestEndPractice, setBestEndPractice] = useState(0);
  const [bestEndTournament, setBestEndTournament] = useState(0);

  const [xChartData, setXChartData] = useState<
    { distance: number; Practice: number; Tournament: number }[]
  >([]);

  useEffect(() => {
    async function load() {
      const all = await db.sessions.toArray();
      if (!all.length) return;

      setSessions(all);
      setArcherName(all[0].archerName);
      setArcherSurname(all[0].archerSurname);
      setBowType(all[0].bowType);

      const practice = all.filter(s => s.sessionType === 'PRACTICE');
      const tournament = all.filter(s => s.sessionType === 'TOURNAMENT');

      setPracticeStats(computeDistanceAverages(practice));
      setTournamentStats(computeDistanceAverages(tournament));

      setOverallAverage(computeOverallAverage(all));
      setTenXPercent(computeTenXPercentage(all));

      setBestEndPractice(computeBestEnd(practice));
      setBestEndTournament(computeBestEnd(tournament));

      setXChartData(computeXChartData(practice, tournament));
    }

    load();
  }, []);

  /* ---------------- Helpers ---------------- */

  function computeDistanceAverages(sessions: StoredSession[]): Record<number, number> {
    const stats: Record<number, { total: number; arrows: number }> = {};
    DISTANCES.forEach(d => (stats[d] = { total: 0, arrows: 0 }));

    sessions.forEach(session => {
      if (!stats[session.distance]) return;
      const computed = computeFromScores(session);
      stats[session.distance].total += computed.totalScore;
      stats[session.distance].arrows += session.totalEnds * 6;
    });

    const averages: Record<number, number> = {};
    DISTANCES.forEach(d => {
      const s = stats[d];
      averages[d] = s.arrows ? +(s.total / s.arrows).toFixed(2) : 0;
    });

    return averages;
  }

  function computeOverallAverage(sessions: StoredSession[]): number {
    let total = 0;
    let arrows = 0;

    sessions.forEach(session => {
      const computed = computeFromScores(session);
      total += computed.totalScore;
      arrows += session.totalEnds * 6;
    });

    return arrows ? +(total / arrows).toFixed(2) : 0;
  }

  function computeTenXPercentage(sessions: StoredSession[]): number {
    let xCount = 0;
    let arrows = 0;

    sessions.forEach(session => {
      const computed = computeFromScores(session);
      xCount += computed.xCount;
      arrows += session.totalEnds * 6;
    });

    return arrows ? +((xCount / arrows) * 100).toFixed(1) : 0;
  }

  function computeBestEnd(sessions: StoredSession[]): number {
    let best = 0;
    sessions.forEach(session => {
      const computed = computeFromScores(session);
      if (computed.bestEnd > best) best = computed.bestEnd;
    });
    return best;
  }

  function computeXChartData(
    practice: StoredSession[],
    tournament: StoredSession[]
  ): { distance: number; Practice: number; Tournament: number }[] {
    return DISTANCES.map(d => {
      const practiceX = practice
        .filter(s => s.distance === d)
        .reduce((sum, s) => sum + computeFromScores(s).xCount, 0);

      const tournamentX = tournament
        .filter(s => s.distance === d)
        .reduce((sum, s) => sum + computeFromScores(s).xCount, 0);

      return { distance: d, Practice: practiceX, Tournament: tournamentX };
    });
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
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mb-8">
        {/* Practice */}
        <div className="bg-white text-black rounded-2xl shadow p-5">
          <h2 className="text-xl font-bold mb-3 text-blue-700">
            Practice (Best End: {bestEndPractice}, Best Distance: {bestPractice ?? '-'}m)
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
            Tournament (Best End: {bestEndTournament}, Best Distance: {bestTournament ?? '-'}m)
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

      {/* Xs Chart */}
      <div className="max-w-5xl mx-auto mt-8 bg-white p-5 rounded-2xl shadow text-black">
        <h2 className="text-xl font-bold mb-3 text-indigo-700">Xs Per Distance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={xChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="distance" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Practice" fill="#3b82f6" />
            <Bar dataKey="Tournament" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
