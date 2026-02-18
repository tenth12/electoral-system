'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function WelcomePage() {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        // Try fetching the root or products endpoint to see if it's alive
        // Using HEAD method might be efficiently but GET is safer if CORS allows
        const res = await fetch(`${apiUrl}`, { method: 'GET' }); 
        
        // Note: NestJS default root might return 404 but still be "online", 
        // or 200 "Hello World". We assume if we get ANY response (even error status logic), it is reachable.
        // But fetch throws only on network error (offline).
        setIsBackendOnline(true);
      } catch (error) {
        setIsBackendOnline(false);
      }
    };

    checkBackendStatus();
    
    // Optional: Poll every 10 seconds
    const interval = setInterval(checkBackendStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-6 relative overflow-hidden text-slate-700 font-sans">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="z-10 text-center max-w-4xl bg-white/60 backdrop-blur-xl p-12 rounded-[3rem] border-4 border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        <h1 className="text-5xl md:text-7xl font-black mb-6 text-slate-800 tracking-tight leading-tight">
          ระบบเลือกตั้ง คณะวิทยาการคอมพิวเตอร์ ปี 2569
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed italic">
          "ระบบเลือกตั้ง คณะวิทยาการคอมพิวเตอร์ ปี 2569"
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Link href="/auth/login" className="w-full sm:w-auto">
            <button className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2">
              เข้าสู่ระบบ
            </button>
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-6 text-slate-400 text-sm font-medium tracking-wide opacity-60">
        © 2026 ระบบเลือกตั้ง คณะวิทยาการคอมพิวเตอร์ ปี 2569
      </footer>
    </div>
  );
}
