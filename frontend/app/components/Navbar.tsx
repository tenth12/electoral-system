'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    router.push('/auth/login');
  };

  return (
    <nav className="bg-blue-900 text-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="font-bold text-xl tracking-tight">Vote CS System</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-slate-100/10 px-4 py-1 rounded-full text-sm font-light">
               สาขาวิทยาการคอมพิวเตอร์
            </div>

            <div className="bg-slate-500/10 px-4 py-1 rounded-full text-sm font-light">
              <Link href="/results">
                ผลการเลือกตั้ง
              </Link>
            </div>

            <div>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                  ออกจากระบบ
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="ml-4 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-800 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute w-full bg-blue-900 border-t border-blue-800 shadow-xl">
          <div className="px-4 pt-4 pb-6 space-y-4 text-center flex flex-col items-center">
            <div className="bg-slate-100/10 px-4 py-2 rounded-full text-sm font-light w-full max-w-xs">
               สาขาวิทยาการคอมพิวเตอร์
            </div>

            <Link href="/results" className="bg-slate-500/10 px-4 py-2 rounded-full text-sm font-light w-full max-w-xs block hover:bg-slate-500/20" onClick={() => setIsMobileMenuOpen(false)}>
              ผลการเลือกตั้ง
            </Link>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-white bg-red-600/80 hover:bg-red-700/80 px-4 py-2 rounded-md text-sm font-medium w-full max-w-xs transition-colors"
              >
                ออกจากระบบ
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="text-white bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-md text-sm font-medium w-full max-w-xs block transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
