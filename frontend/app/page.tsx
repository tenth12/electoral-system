'use client';

import Link from 'next/link';
import Navbar from './components/Navbar';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl w-full">
          {/* Logo or Emblem Area */}
          <div className="mx-auto w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center mb-8 shadow-lg">
            <span className="text-4xl">🏛️</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4 leading-tight">
            ระบบเลือกตั้งออนไลน์
          </h1>
          <h2 className="text-xl md:text-2xl font-medium text-slate-600 mb-12">
            สาขาวิทยาการคอมพิวเตอร์ ประจำปี 2569
          </h2>

          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 mb-8 max-w-lg mx-auto">
            <p className="text-slate-500 mb-6 leading-relaxed">
              ยินดีต้อนรับสู่ระบบการลงคะแนนเสียงอิเล็กทรอนิกส์ที่มีความปลอดภัยและโปร่งใส 
              กรุณาเข้าสู่ระบบเพื่อใช้สิทธิของท่าน
            </p>

            <Link href="/auth/login" className="block w-full">
              <button className="w-full px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-md font-medium transition-colors shadow-sm">
                เข้าสู่ระบบเพื่อลงคะแนน
              </button>
            </Link>
          </div>

          <footer className="text-slate-400 text-sm mt-12">
            © 2026 คณะวิทยาการคอมพิวเตอร์ | ระบบเลือกตั้งอิเล็กทรอนิกส์
          </footer>
        </div>
      </main>
    </div>
  );
}
