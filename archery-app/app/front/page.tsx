'use client';
import { useState } from 'react';
import ScorePageDynamic from '../score-dynamic/page'; // import the new dynamic scoring page

export default function FrontPage() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [bowType, setBowType] = useState('');
  const [distance, setDistance] = useState<number | ''>('');
  const [totalEnds, setTotalEnds] = useState<number | ''>('');
  const [started, setStarted] = useState(false);

  function startScoring() {
    setStarted(true);
  }

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-200 p-4">
        <h1 className="text-3xl font-bold mb-6">Archery Setup</h1>

        <div className="space-y-4 w-full max-w-sm">
           <input
           type="text"
           placeholder="Name"
           value={name}
           onChange={e => setName(e.target.value)}
           className="w-full max-w-sm border rounded-lg p-2 bg-white text-black"
           />

          <input
            type="text"
            placeholder="Bow Type"
            value={bowType}
            onChange={e => setBowType(e.target.value)}
            className="w-full max-w-sm border rounded-lg p-2 bg-white text-black"
          />
          <input
            type="number"
            placeholder="Distance (default 30m)"
            value={distance}
            onChange={e => setDistance(Number(e.target.value))}
            className="w-full max-w-sm border rounded-lg p-2 bg-white text-black"
          />
          <input
            type="number"
            placeholder="Total Ends (default 6)"
            value={totalEnds}
            onChange={e => setTotalEnds(Number(e.target.value))}
            className="w-full max-w-sm border rounded-lg p-2 bg-white text-black"
          />

          <button
            onClick={startScoring}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold"
          >
            Start Scoring
          </button>
        </div>
      </div>
    );
  }

  return (
    <ScorePageDynamic
      archer={{
        name,
        surname,
        bowType,
        distance: distance || 30,
        totalEnds: totalEnds || 6
      }}
    />
  );
}
