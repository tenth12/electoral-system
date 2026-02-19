'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Turnstile from 'react-turnstile';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken }),
      });

      if (res.ok) {
        const data = await res.json();
        const accessToken = data.access_token;
        localStorage.setItem('accessToken', accessToken);
        if (data.refresh_token) {
            localStorage.setItem('refreshToken', data.refresh_token);
        }
        
        // Decode token to find role
        try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            if (payload.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/vote');
            }
        } catch (e) {
            // Fallback
            router.push('/vote');
        }
      } else {
        const data = await res.json();
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 border border-white/50">
        <h1 className="text-3xl font-black text-center text-slate-800 mb-2">Welcome Back! 👋</h1>
        <p className="text-center text-slate-400 mb-8">เข้าสู่ระบบเพื่อจัดการคลังแสง</p>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all font-bold"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all font-bold"
            />
          </div>

          <div className="flex justify-center mb-4">
            <Turnstile
              sitekey="0x4AAAAAACfcnUOEVtyg9Xdy"
              onVerify={(token) => setTurnstileToken(token)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? 'Loading...' : 'Login 🔐'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          ยังไม่มีบัญชี?{' '}
          <Link href="/auth/signup" className="text-blue-500 font-bold hover:underline">
            สมัครสมาชิก
          </Link>
        </div>
      </div>
    </div>
  );
}
