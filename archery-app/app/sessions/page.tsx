'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dexie from 'dexie';

import { db } from '@/lib/db';
import { getLoggedInUser } from '@/lib/auth';
import type { StoredSession } from '../types/score';

export default function SessionsPage() {
  const router = useRouter();

  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [userName, setUserName] = useState('');
  const [userSurname, setUserSurname] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const user = getLoggedInUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      // 👤 Set archer name instantly (no DB wait)
      setUserName(user.archerName);
      setUserSurname(user.archerSurname);

      // ⚡ FAST indexed query
      const userSessions = await db.sessions
        .where('[userId+createdAt]')
        .between(
          [user.username, Dexie.minKey],
          [user.username, Dexie.maxKey]
        )
        .reverse()
        .toArray();

      if (!cancelled) {
        setSessions(userSessions);
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
      {/* Top bar */}
      <div className="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-3">
        {/* Left */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            My Sessions
          </h1>
          <p className="text-sm text-gray-300">
            🏹 {userName} {userSurname}
          </p>
        </div>

        {/* Right */}
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/stats')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            📊 Stats
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

      {/* Sessions */}
      {sessions.length === 0 && (
        <p className="text-gray-600">
          No sessions yet. Start one!
        </p>
      )}

      {sessions.map(session => (
        <div
          key={session.id}
          className="border rounded-lg p-4 bg-white text-black shadow cursor-pointer hover:bg-gray-50"
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
