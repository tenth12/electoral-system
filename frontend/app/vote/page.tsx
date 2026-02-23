'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '../services/admin.service';
import Navbar from '../components/Navbar';

// ปรับ Interface ให้ตรงกับข้อมูลจริง
interface Candidate {
    _id: string;
    candidateNumber: number;
    displayName: string;
    slogan: string;
    imageUrl: string;
}

export default function VotePage() {
    const router = useRouter();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const profile = await adminService.getProfile();
                setUser(profile);
                
                // 1. ดึงรายชื่อผู้สมัคร (แนะนำให้ใช้ API /candidates เพื่อเอาข้อมูล Candidate โดยตรง)
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                const res = await fetch(`${apiUrl}/candidates`);
                if (res.ok) {
                    const data = await res.json();
                    // เรียงลำดับตามหมายเลข 1, 2, 3...
                    setCandidates(data.sort((a: any, b: any) => a.candidateNumber - b.candidateNumber));
                }
                
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

    if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <Navbar />
            
            <main className="flex-grow max-w-5xl w-full mx-auto p-6 md:p-8">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 mb-1">บัตรลงคะแนนอิเล็กทรอนิกส์</h1>
                        <p className="text-slate-500 text-sm">ตรวจสอบข้อมูลผู้สมัครและเลือกคนที่คุณไว้วางใจ</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">ผู้ใช้สิทธิ</p>
                        <p className="text-slate-700 font-semibold">{user?.email}</p>
                    </div>
                </header>

                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-2 bg-blue-900 rounded-full"></div>
                        <h2 className="text-xl font-bold text-slate-800">รายชื่อผู้สมัครรับเลือกตั้ง</h2>
                    </div>
                    
                    {candidates.length === 0 ? (
                        <div className="text-center p-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                            <p className="text-5xl mb-4">🗳️</p>
                            <p>ขณะนี้ยังไม่มีผู้สมัครเปิดรับลงคะแนน</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {candidates.map((candidate) => (
                                <div key={candidate._id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all flex flex-col sm:flex-row items-center gap-6">
                                    
                                    {/* หมายเลขผู้สมัคร */}
                                    <div className="flex-shrink-0 w-20 h-20 bg-blue-900 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-blue-200">
                                        <span className="text-[10px] font-bold uppercase opacity-70">เบอร์</span>
                                        <span className="text-3xl font-black">{candidate.candidateNumber}</span>
                                    </div>

                                    {/* รูปภาพผู้สมัคร */}
                                    <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                                        {candidate.imageUrl ? (
                                            <img 
                                                src={candidate.imageUrl} 
                                                alt={candidate.displayName} 
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl">🏛️</div>
                                        )}
                                    </div>

                                    {/* ข้อมูล */}
                                    <div className="flex-grow text-center sm:text-left">
                                        <h3 className="font-bold text-xl text-slate-800">{candidate.displayName}</h3>
                                        <p className="text-blue-600 text-sm italic mb-4">"{candidate.slogan}"</p>
                                        
                                        <button 
                                            onClick={() => handleVote(candidate._id)}
                                            disabled={hasVoted}
                                            className={`w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold text-sm transition-all border-2
                                                ${hasVoted 
                                                    ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' 
                                                    : 'bg-white text-blue-900 border-blue-900 hover:bg-blue-900 hover:text-white active:scale-95'
                                                }`}
                                        >
                                            {hasVoted ? 'ใช้สิทธิแล้ว' : 'ลงคะแนน X'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-12 p-6 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-4">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <h4 className="font-bold text-red-900 mb-1">กฎการลงคะแนน</h4>
                        <p className="text-sm text-red-700 leading-relaxed">
                            คุณสามารถลงคะแนนได้เพียง 1 ครั้งต่อการเลือกตั้ง 1 รอบเท่านั้น ระบบจะบันทึกข้อมูลการโหวตของคุณเป็นความลับ แต่ไม่สามารถย้อนกลับมาแก้ไขได้หลังจากยืนยันไปแล้ว
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}