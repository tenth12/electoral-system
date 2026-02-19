'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    router.push('/auth/login');
  };

  return (
    <nav className="bg-blue-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="font-bold text-xl tracking-tight">Vote CS System</span>
            </Link>
          </div>
          <div className="flex bg-slate-100/10 px-4 py-1 rounded-full text-sm font-light">
             คณะวิทยาการคอมพิวเตอร์
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
      </div>
    </nav>
  );
}
