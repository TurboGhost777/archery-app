'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLoggedInUser } from '@/lib/auth';
import { createSession } from '@/lib/sessionRepo';

export default function NewSessionPage() {
  const router = useRouter();
  const user = getLoggedInUser();

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  const [bowType, setBowType] =
    useState<'COMPOUND' | 'RECURVE' | 'BAREBOW'>('COMPOUND');

  const [distance, setDistance] = useState<number | ''>(18);
  const [totalEnds, setTotalEnds] = useState<number | ''>(6);

  const [sessionType, setSessionType] =
    useState<'PRACTICE' | 'TOURNAMENT'>('PRACTICE');

  const startSession = async () => {
    if (!user) return;

    if (distance === '' || totalEnds === '') {
      alert('Please fill in all fields');
      return;
    }

    const session = await createSession(
      user.username,       // userId
      user.name,           // archerName (from login)
      user.surname,        // archerSurname (from login)
      bowType,
      distance,
      totalEnds,
      6,                   // arrows per end
      sessionType
    );

    router.push(`/score-dynamic?sessionId=${session.id}`);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Start New Session</h1>

      {/* Bow Type */}
      <select
        value={bowType}
        onChange={e =>
          setBowType(e.target.value as 'COMPOUND' | 'RECURVE' | 'BAREBOW')
        }
        className="w-full p-2 border rounded"
      >
        <option value="COMPOUND">Compound</option>
        <option value="RECURVE">Recurve</option>
        <option value="BAREBOW">Barebow</option>
      </select>

      {/* Distance */}
      <input
        type="number"
        placeholder="Distance (m)"
        value={distance}
        onChange={e =>
          setDistance(e.target.value === '' ? '' : Number(e.target.value))
        }
        className="w-full p-2 border rounded"
      />

      {/* Total Ends */}
      <input
        type="number"
        placeholder="Total Ends"
        value={totalEnds}
        onChange={e =>
          setTotalEnds(e.target.value === '' ? '' : Number(e.target.value))
        }
        className="w-full p-2 border rounded"
      />

      {/* Session Type */}
      <select
        value={sessionType}
        onChange={e =>
          setSessionType(e.target.value as 'PRACTICE' | 'TOURNAMENT')
        }
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
