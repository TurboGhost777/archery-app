'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSession } from '@/lib/sessionRepo';

export default function NewSessionPage() {
  const router = useRouter();

  const [distance, setDistance] = useState(70);
  const [totalEnds, setTotalEnds] = useState(6);
  const [sessionType, setSessionType] = useState<'PRACTICE' | 'TOURNAMENT'>('PRACTICE');


  const handleStart = async () => {
    const sessionId = await createSession({
      distance,
      totalEnds,   // stays the same// stays the same
      bowType: 'COMPOUND', 
      sessionType: sessionType ?? 'PRACTICE',
// stays the same
    });

    router.push(`/score-dynamic?sessionId=${sessionId}`);
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-black">
        New Session
      </h1>

      <div>
        <label className="block text-black mb-1">
          Distance (meters)
        </label>
        <input
          type="number"
          value={distance}
          onChange={e => setDistance(Number(e.target.value))}
          className="w-full border rounded-lg p-2 bg-white text-black"
        />
      </div>

      <div>
  <label className="block text-black mb-1">
    Session Type
  </label>
  <select
    value={sessionType}
    onChange={e =>
      setSessionType(e.target.value as 'PRACTICE' | 'TOURNAMENT')
    }
    className="w-full border rounded-lg p-2 bg-white text-black"
  >
    <option value="PRACTICE">Practice</option>
    <option value="TOURNAMENT">Tournament</option>
  </select>
</div>


      <div>
        <label className="block text-black mb-1">
          Total Ends
        </label>
        <input
          type="number"
          value={totalEnds}
          onChange={e => setTotalEnds(Number(e.target.value))}
          className="w-full border rounded-lg p-2 bg-white text-black"
        />
      </div>

      <button
        onClick={handleStart}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Start Session
      </button>
    </div>
  );
}
