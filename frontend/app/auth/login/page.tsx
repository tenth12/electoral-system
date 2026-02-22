'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Turnstile from 'react-turnstile';
import Navbar from '../../components/Navbar';

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
            } else if (payload.role === 'candidate') {
                router.push('/candidates/info');
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">เข้าสู่ระบบ</h1>
            <p className="text-slate-500 text-sm mt-2">โปรดระบุอีเมลและรหัสผ่านเพื่อยืนยันตัวตน</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-sm">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">อีเมลสถาบัน</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="example@university.ac.th"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-center my-4">
              <Turnstile
                sitekey="0x4AAAAAACfcnUOEVtyg9Xdy"
                onVerify={(token) => setTurnstileToken(token)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-md shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          
        </div>
      </div>
    </div>
  );
}