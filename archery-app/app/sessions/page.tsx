'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dexie from 'dexie';

import { getLoggedInUser } from '@/lib/auth';
import { db } from '@/lib/db';

type StoredSession = {
  id: string;
  userId: string;
  distance: number;
  sessionType?: string;
  totalEnds: number;
  bowType: string;
  completed: boolean;
  createdAt: number;
};


const SESSION_CACHE_TTL = 30_000; // 30 seconds

export default function SessionsPage() {
  const router = useRouter();

  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [userName, setUserName] = useState('');
  const [userSurname, setUserSurname] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const user = getLoggedInUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      setUserName(user.archerName);
      setUserSurname(user.archerSurname);

      /* ---------- 1️⃣ INSTANT CACHE LOAD ---------- */
      const cacheKey = `sessions-cache-${user.username}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < SESSION_CACHE_TTL) {
            setSessions(parsed.data);
            setLoading(false);
          }
        } catch {
          // ignore broken cache
        }
      }

      /* ---------- 2️⃣ FAST INDEXED QUERY ---------- */
      const freshSessions = await db.sessions
        .where('[userId+createdAt]')
        .between(
          [user.username, Dexie.minKey],
          [user.username, Dexie.maxKey]
        )
        .reverse()
        .toArray();

      if (!cancelled) {
        setSessions(freshSessions.map(session => ({
          ...session,
          id: String(session.id),
        })));
        setLoading(false);

        /* ---------- 3️⃣ UPDATE CACHE ---------- */
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            data: freshSessions,
          })
        );
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    router.replace('/login');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      {/* ---------- TOP BAR ---------- */}
      <div className="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-3">
        <div>
          <h1 className="text-2xl font-bold text-white">My Sessions</h1>
          <p className="text-sm text-gray-300">
            🏹 {userName} {userSurname}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push('/stats')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            📊 Stats
          </button>

          <button
            onClick={() => router.push('/sightSettings')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            🎯 Sight Settings
          </button>

          <button
            onClick={() => router.push('/sessions/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + New Session
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* ---------- CONTENT ---------- */}
      {loading && (
        <p className="text-gray-500">Loading sessions…</p>
      )}

      {!loading && sessions.length === 0 && (
        <p className="text-gray-600">
          No sessions yet. Start one!
        </p>
      )}

      {!loading &&
        sessions.map(session => (
          <div
            key={session.id}
            className="border rounded-lg p-4 bg-white text-black shadow cursor-pointer hover:bg-gray-50 transition"
            onClick={() =>
              router.push(`/score-dynamic?sessionId=${session.id}`)
            }
          >
            <div className="font-semibold">
              {session.distance}m — {session.sessionType ?? 'PRACTICE'}
            </div>

            <div className="text-sm text-gray-600">
              Ends: {session.totalEnds} · Bow: {session.bowType}
            </div>

            {session.completed && (
              <div className="text-green-600 text-sm font-bold mt-1">
                ✓ Completed
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
