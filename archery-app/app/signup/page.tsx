'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [archerName, setArcherName] = useState('');
  const [archerSurname, setArcherSurname] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md text-black">

        <h1 className="text-2xl font-bold text-center mb-4">
          Create your account
        </h1>

        {/* ---------- All inputs in ONE column ---------- */}
        <div className="grid grid-cols-1 gap-3 mb-4">

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full border rounded-lg p-2 bg-white text-black"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded-lg p-2 bg-white text-black"
          />

          <input
            type="text"
            placeholder="Name"
            value={archerName}
            onChange={e => setArcherName(e.target.value)}
            className="w-full border rounded-lg p-2 bg-white text-black"
          />

          <input
            type="text"
            placeholder="Surname"
            value={archerSurname}
            onChange={e => setArcherSurname(e.target.value)}
            className="w-full border rounded-lg p-2 bg-white text-black"
          />

          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={e =>
              setAge(e.target.value === '' ? '' : Number(e.target.value))
            }
            className="w-full border rounded-lg p-2 bg-white text-black"
          />

          {/* ---------- Gender Dropdown ---------- */}
          <select
            value={gender}
            onChange={e => setGender(e.target.value as any)}
            className="w-full border rounded-lg p-2 bg-white text-black"
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>

          <button
            onClick={() => {
              // TEMP LOGIC ONLY FOR PHASE 1
              console.log('Signup clicked', {
                username,
                password,
                archerName,
                archerSurname,
                age,
                gender,
              });
            }}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
          >
            Sign Up
          </button>

        </div>

        {/* ---------- Smaller navigation buttons ---------- */}
        <div className="flex justify-between text-sm">

          <button
            onClick={() => router.push('/forgot-password')}
            className="text-blue-700 hover:underline"
          >
            Forgotten password
          </button>

          <button
            onClick={() => router.push('/login')}
            className="text-blue-700 hover:underline"
          >
            Back to Login
          </button>

        </div>

      </div>
    </div>
  );
}
