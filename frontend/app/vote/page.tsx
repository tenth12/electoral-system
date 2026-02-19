'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '../services/admin.service';
import Navbar from '../components/Navbar';

interface User {
    _id: string;
    email: string;
}

export default function VotePage() {
    const router = useRouter();
    const [candidates, setCandidates] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const profile = await adminService.getProfile();
                setUser(profile);
                
                // Fetch candidates
                const data = await adminService.getCandidates();
                setCandidates(data);
                
            } catch (error) {
                router.push('/auth/login');
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [router]);

    const handleVote = async (candidateId: string) => {
        if (!confirm('ยืนยันการลงคะแนนให้ผู้สมัครท่านนี้?')) return;
        
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/votes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ candidateId })
            });

            if (res.ok) {
                alert('ลงคะแนนเรียบร้อยแล้ว');
                setHasVoted(true);
            } else {
                const data = await res.json();
                alert(data.message || 'การลงคะแนนล้มเหลว');
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        }
    };

    if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-slate-600">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <Navbar />
            
            <main className="flex-grow max-w-5xl w-full mx-auto p-6 md:p-8">
                <header className="mb-10 text-center md:text-left border-b border-slate-200 pb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">บัตรลงคะแนนเลือกตั้ง</h1>
                    <p className="text-slate-500">
                        ผู้ใช้สิทธิ: <span className="font-semibold text-slate-700">{user?.email}</span>
                    </p>
                </header>

                <div>
                    <h2 className="text-lg font-semibold text-slate-700 mb-4 px-1 border-l-4 border-blue-900 pl-3">
                        รายชื่อผู้สมัคร
                    </h2>
                    
                    {candidates.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-lg border border-slate-200 text-slate-400">
                            ไม่พบรายชื่อผู้สมัคร
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {candidates.map((candidate) => (
                                <div key={candidate._id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-slate-100 text-slate-400 text-xl flex items-center justify-center rounded-md border border-slate-200">
                                            <span>รูป</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">{candidate.email}</h3>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide">ผู้สมัคร</p>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleVote(candidate._id)}
                                        disabled={hasVoted}
                                        className={`px-6 py-2 rounded-md font-medium text-sm transition-colors border
                                            ${hasVoted 
                                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                                                : 'bg-white text-blue-900 border-blue-900 hover:bg-blue-900 hover:text-white'
                                            }`}
                                    >
                                        {hasVoted ? 'ใช้สิทธิแล้ว' : 'ลงคะแนน X'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-12 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <p>
                        คำเตือน: การลงคะแนนสามารถทำได้เพียง 1 ครั้งเท่านั้น เมื่อกดยืนยันแล้วจะไม่สามารถแก้ไขผลการลงคะแนนได้
                        กรุณาตรวจสอบความถูกต้องก่อนกดปุ่มยืนยัน
                    </p>
                </div>
            </main>
        </div>
    );
}
