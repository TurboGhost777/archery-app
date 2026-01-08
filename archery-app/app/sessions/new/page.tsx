'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLoggedInUser } from '@/lib/auth';
import { createSession } from '@/lib/sessionRepo';
import type { ArrowScore } from '@/app/types/score';

export default function NewSessionPage() {
  const router = useRouter();
  const user = getLoggedInUser();

  const [archerName, setArcherName] = useState('');
  const [archerSurname, setArcherSurname] = useState('');
  const [bowType, setBowType] = useState<'COMPOUND' | 'RECURVE' | 'BAREBOW'>('COMPOUND');
  const [distance, setDistance] = useState<number>(18);
  const [totalEnds, setTotalEnds] = useState<number>(6);
  const [sessionType, setSessionType] = useState<'PRACTICE' | 'TOURNAMENT'>('PRACTICE');

  const startSession = async () => {
    if (!user) return alert('Not logged in');

    const session = await createSession(
      user.username,
      archerName,
      archerSurname,
      bowType,
      distance, // already a number
      totalEnds, // already a number
      6, // arrows per end (hardcoded for now)
      sessionType,
    );

    router.push(`/score-dynamic?sessionId=${session.id}`);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Start New Session</h1>

      <input
        type="text"
        placeholder="Archer Name"
        value={archerName}
        onChange={e => setArcherName(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Archer Surname"
        value={archerSurname}
        onChange={e => setArcherSurname(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <select
        value={bowType}
        onChange={e => setBowType(e.target.value as 'COMPOUND' | 'RECURVE' | 'BAREBOW')}
        className="w-full p-2 border rounded"
      >
        <option value="COMPOUND">Compound</option>
        <option value="RECURVE">Recurve</option>
        <option value="BAREBOW">Barebow</option>
      </select>

      <input
        type="number"
        placeholder="Distance"
        value={distance}
        onChange={e => setDistance(parseInt(e.target.value))}
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        placeholder="Total Ends"
        value={totalEnds}
        onChange={e => setTotalEnds(parseInt(e.target.value))}
        className="w-full p-2 border rounded"
      />

      <select
        value={sessionType}
        onChange={e => setSessionType(e.target.value as 'PRACTICE' | 'TOURNAMENT')}
        className="w-full p-2 border rounded"
      >
        <option value="PRACTICE">Practice</option>
        <option value="TOURNAMENT">Tournament</option>
      </select>

      <button
        onClick={startSession}
        className="w-full py-2 bg-blue-600 text-white rounded"
      >
        Start Session
      </button>
    </div>
  );
}
