'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import { db } from '@/lib/db';
import { getLoggedInUser } from '@/lib/auth';
import type { StoredSession } from '../types/score';
import { computeFromScores } from '../types/score';

/* ---------------- Lazy Charts ---------------- */
const ResponsiveContainer = dynamic(
  () => import('recharts').then(m => m.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(
  () => import('recharts').then(m => m.CartesianGrid),
  { ssr: false }
);
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false });

/* ---------------- Constants ---------------- */
const DISTANCES = [18, 20, 30, 50, 70, 90];
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export default function StatsPage() {
  const router = useRouter();
  const user = getLoggedInUser();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  /* 🚀 Prefetch sessions for instant navigation */
  useEffect(() => {
    router.prefetch('/sessions');
  }, [router]);

  /* ---------------- Load Stats (Cached) ---------------- */
  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    const load = async () => {
      /* 1️⃣ Try cache */
      const cached = await db.statsCache.get(user.username);
      if (cached && Date.now() - cached.computedAt < CACHE_TTL) {
        setStats(cached.data);
        setLoading(false);
        return;
      }

      /* 2️⃣ Compute fresh */
      const sessions = await db.sessions
        .where('userId')
        .equals(user.username)
        .toArray();

      const computed = computeStats(sessions);

      /* 3️⃣ Save cache */
      await db.statsCache.put({
        userId: user.username,
        computedAt: Date.now(),
        data: computed,
      });

      setStats(computed);
      setLoading(false);
    };

    load();
  }, [router, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading stats…
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen p-6 bg-slate-900 text-white">
      {/* Top bar */}
      <div className="max-w-5xl mx-auto flex justify-between mb-6">
        <button
          onClick={() => router.replace('/sessions')}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          ← Back to Sessions
        </button>

        <h1 className="text-xl font-bold">
          {user.archerName} {user.archerSurname}
        </h1>
      </div>

      {/* Cards */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mb-8">
        <StatCard label="Avg / Arrow" value={stats.overallAverage} />
        <StatCard label="10 / X %" value={`${stats.tenXPercent}%`} />
      </div>

      {/* Distance Chart */}
      <div className="max-w-5xl mx-auto bg-white text-black p-5 rounded-xl">
        <h2 className="font-bold mb-3">Average Score per Distance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.distanceChart}>
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

/* ---------------- Helpers ---------------- */

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl text-center">
      <p className="text-sm opacity-70">{label}</p>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </div>
  );
}

function computeStats(sessions: StoredSession[]) {
  let total = 0;
  let arrows = 0;
  let xCount = 0;

  const practice = sessions.filter(s => s.sessionType === 'PRACTICE');
  const tournament = sessions.filter(s => s.sessionType === 'TOURNAMENT');

  sessions.forEach(s => {
    const c = computeFromScores(s);
    total += c.totalScore;
    arrows += s.totalEnds * 6;
    xCount += c.xCount;
  });

  return {
    overallAverage: arrows ? +(total / arrows).toFixed(2) : 0,
    tenXPercent: arrows ? +((xCount / arrows) * 100).toFixed(1) : 0,
    distanceChart: DISTANCES.map(d => ({
      distance: d,
      Practice: practice
        .filter(s => s.distance === d)
        .reduce((sum, s) => sum + computeFromScores(s).totalScore, 0),
      Tournament: tournament
        .filter(s => s.distance === d)
        .reduce((sum, s) => sum + computeFromScores(s).totalScore, 0),
    })),
  };
}
