'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { db } from '@/lib/db';

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [archerName, setArcherName] = useState('');
  const [archerSurname, setArcherSurname] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('');
  const [club, setClub] = useState('');
  const [email, setEmail] = useState('');

  const handleSignup = async () => {
    if (!username || !password || !archerName || !archerSurname || !age || !gender) {
      alert('Please fill in all required fields!');
      return;
    }

    // Check if username already exists
    const existing = await db.users.where('username').equals(username).first();
    if (existing) {
      alert('Username already exists!');
      return;
    }

    await db.users.add({
      username,
      password, // In a real app, hash this
      archerName,
      archerSurname,
      age: Number(age),
      gender: gender as 'MALE' | 'FEMALE',
      club,
      email,
      createdAt: Date.now(),
    });

    alert('Signup successful!');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md text-black">
        <h1 className="text-2xl font-bold text-center mb-4">Create your account</h1>

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

          <select
            value={gender}
            onChange={e => setGender(e.target.value as any)}
            className="w-full border rounded-lg p-2 bg-white text-black"
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>

          <input
            type="text"
            placeholder="Club (optional)"
            value={club}
            onChange={e => setClub(e.target.value)}
            className="w-full border rounded-lg p-2 bg-white text-black"
          />

          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded-lg p-2 bg-white text-black"
          />

          <button
            onClick={handleSignup}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
          >
            Sign Up
          </button>
        </div>

        <div className="flex justify-between text-sm">
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
