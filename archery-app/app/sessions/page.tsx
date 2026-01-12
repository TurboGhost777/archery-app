'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { db } from '@/lib/db';
import { getLoggedInUser } from '@/lib/auth';
import type { StoredSession } from '../types/score';

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [userName, setUserName] = useState('');
  const [userSurname, setUserSurname] = useState('');

  useEffect(() => {
    const load = async () => {
      const user = getLoggedInUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      setUserName(user.name);
      setUserSurname(user.surname);

      /* 🔑 ONLY load this user's sessions */
      const userSessions = await db.sessions
        .where('userId')
        .equals(user.username)
        .reverse()
        .sortBy('createdAt');

      setSessions(userSessions);
    };

    load();
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      {/* Top bar */}
      <div className="grid grid-cols-3 items-center">
        {/* Left */}
        <h1 className="text-2xl font-bold text-black">
          My Sessions
        </h1>

        {/* Center */}
        <div className="text-center font-semibold text-gray-800">
          {userName} {userSurname}
        </div>

        {/* Right */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => router.push('/stats')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            📊 Stats
          </button>

          <button
            onClick={() => router.push('/sessions/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            + New Session
          </button>
        </div>
      </div>

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
