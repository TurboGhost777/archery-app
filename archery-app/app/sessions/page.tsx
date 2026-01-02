'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import type { StoredSession } from '../types/score';

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<StoredSession[]>([]);

  useEffect(() => {
    async function loadSessions() {
      const all = await db.sessions.toArray();
      // Sort newest first
      all.sort((a, b) => b.createdAt - a.createdAt);
      setSessions(all);
    }

    loadSessions();
  }, []);

  function handleSessionClick(session: StoredSession) {
    // Navigate to score page with sessionId query param
    router.push(`/score-dynamic?sessionId=${session.id}`);
  }

  function formatDate(ts: number) {
    const d = new Date(ts);
    return d.toLocaleString();
  }

  return (
    <div className="min-h-screen bg-gray-200 p-4 text-black">
      <h1 className="text-2xl font-bold mb-4 text-center">Sessions</h1>

      <div className="space-y-2">
        {sessions.map(session => (
          <div
            key={session.id}
            className="bg-white rounded-lg shadow p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
            onClick={() => handleSessionClick(session)}
          >
            <div>
              <div className="font-bold">
                {session.archerName} {session.archerSurname} – {session.bowType} – {session.distance}m
              </div>
              <div className="text-sm text-gray-600">Created: {formatDate(session.createdAt)}</div>
            </div>

            <div className="text-xs">
              {session.completed ? (
                <span className="text-green-600 font-bold">Completed</span>
              ) : (
                <span className="text-orange-600 font-bold">In Progress</span>
              )}
            </div>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No sessions yet.
          </div>
        )}
      </div>

      <div className="text-center mt-6">
        <button
          onClick={async () => {
            // Create a new session with a random ID
            const id = crypto.randomUUID();
            await db.sessions.put({
              id,
              archerName: 'New',
              archerSurname: 'Archer',
              bowType: 'COMPOUND',
              distance: 18,
              totalEnds: 12,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              synced: false,
              completed: false,
            });
            router.push(`/score-dynamic?sessionId=${id}`);
          }}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg"
        >
          Start New Session
        </button>
      </div>
    </div>
  );
}
