'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { db } from '@/lib/db';

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Please enter username and password');
      return;
    }

    const user = await db.users.where('username').equals(username).first();
    if (!user) {
      alert('User not found!');
      return;
    }

    if (user.password !== password) {
      alert('Incorrect password!');
      return;
    }

    // Save logged-in user temporarily
    localStorage.setItem('loggedInUser', JSON.stringify(user));

    alert('Login successful!');
    router.push('/sessions'); // redirect to sessions page
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md text-black">
        <h1 className="text-2xl font-bold text-center mb-4">
          Welcome, please sign in below
        </h1>

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

          <button
            onClick={handleLogin}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </div>

        <div className="flex justify-between text-sm">
          <button
            onClick={() => router.push('/forgot-password')}
            className="text-blue-700 hover:underline"
          >
            Forgotten password
          </button>

          <button
            onClick={() => router.push('/signup')}
            className="text-blue-700 hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
