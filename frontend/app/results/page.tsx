'use client';

import { useEffect, useState } from 'react';

interface VoteSummary {
    _id: string; // Candidate ID
    count: number;
    candidateInfo?: {
        email: string;
        role: string;
    };
    candidateDetails?: {
        displayName: string;
        slogan: string;
        imageUrl: string;
        candidateNumber: number;
    };
}

export default function PublicResultsPage() {
    const [scores, setScores] = useState<VoteSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isVotingOpen, setIsVotingOpen] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchPublicScores = async () => {
            try {
                // We'll create a dedicated public fetch function in a moment
                // For now, let's use a direct fetch to the new endpoint
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/votes/public-summary`);
                const result = await response.json();
                
                if (result.isVotingOpen) {
                    setIsVotingOpen(true);
                    setMessage(result.message);
                } else {
                    setIsVotingOpen(false);
                    // Sort by count descending
                    const sortedScores = result.data.sort((a: any, b: any) => b.count - a.count);
                    setScores(sortedScores);
                }
            } catch (error) {
                console.error('Failed to fetch public scores', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicScores();
        
        // Refresh every 5 seconds
        const interval = setInterval(fetchPublicScores, 5000);

        return () => clearInterval(interval);
    }, []);

    if (isLoading) return <div className="p-8 text-center text-slate-500 font-sarabun">กำลังโหลดข้อมูล...</div>;

    if (isVotingOpen) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 font-sarabun bg-slate-50">
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center max-w-3xl mx-auto space-y-8 mt-[-10vh]">
                    <div className="w-24 h-24 bg-blue-50 text-blue-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">ระบบกำลังเปิดให้ลงคะแนนเสียง</h2>
                    <div className="w-16 h-1 bg-blue-800 mx-auto rounded-full"></div>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-xl mx-auto">
                        {message || 'โปรดรอจนกว่าจะสิ้นสุดระยะเวลาการลงคะแนน จึงจะสามารถเข้าชมผลการนับคะแนนอย่างเป็นทางการได้'}
                    </p>
                </div>
                <div className="flex justify-center mt-8">
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-8 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors font-semibold"
                >
                    กลับหน้าแรก
                </button>
            </div>
            </div>
        );
    }

    // Calculate max votes for progress bar
    const maxVotes = scores.length > 0 ? scores[0].count : 0;

    return (
        <div className="min-h-screen bg-slate-50 py-12 font-sarabun">
            <div className="max-w-5xl mx-auto p-4 md:p-8">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">ประกาศผลการเลือกตั้ง</h1>
                    <div className="w-24 h-1.5 bg-blue-800 mx-auto rounded-full mb-6 relative">
                        <div className="absolute inset-0 bg-blue-800 rounded-full animate-pulse opacity-50"></div>
                    </div>
                    <p className="text-lg text-slate-600">ผลการนับคะแนนอย่างเป็นทางการ (อัปเดตล่าสุด: {new Date().toLocaleString()})</p>
                </header>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-blue-900 px-8 py-5 border-b border-blue-800">
                        <h2 className="text-xl font-bold text-white tracking-wide">สรุปผลคะแนนรวม</h2>
                    </div>
                    
                    <div className="p-8 space-y-8">
                        {scores.map((score, index) => {
                            const details = score.candidateDetails || {} as any;
                            const info = score.candidateInfo || {} as any;

                            
                            return (
                                <div key={score._id} className="relative group bg-white border border-slate-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-6">
                                        <div className="flex items-center gap-6">
                                            {/* Rank Badge */}
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl shadow-inner shrink-0 ${
                                                index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white border-2 border-yellow-200' : 
                                                index === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 border-2 border-slate-100' :
                                                index === 2 ? 'bg-gradient-to-br from-orange-200 to-orange-400 text-white border-2 border-orange-100' : 
                                                'bg-slate-100 text-slate-500'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            
                                            {/* Profile Image */}
                                            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-sm bg-slate-100 shrink-0">
                                                {details.imageUrl ? (
                                                    <img src={details.imageUrl} alt={details.displayName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-blue-900 text-white text-xs px-3 py-1 rounded-sm font-semibold uppercase tracking-wider">
                                                        หมายเลข {details.candidateNumber || '-'}
                                                    </span>
                                                    {index === 0 && (
                                                        <span className="text-yellow-500 text-sm font-bold animate-pulse">ชนะเลิศอันดับ 1</span>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-2xl text-slate-900">{details.displayName || 'ไม่ระบุชื่อ'}</h3>
                                                <p className="text-slate-600 mt-1">{details.slogan || 'ไม่มีคำขวัญ'}</p>
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className="text-left md:text-right ml-20 md:ml-0">
                                            <div className="text-4xl font-extrabold text-blue-900">
                                                {score.count.toLocaleString()} <span className="text-lg font-normal text-slate-500 ml-1">คะแนน</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner mt-4">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                                'bg-gradient-to-r from-blue-700 to-blue-900'
                                            }`}
                                            style={{ width: `${maxVotes > 0 ? (score.count / maxVotes) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-right mt-2 text-xs text-slate-400 font-semibold tracking-wider">
                                        {maxVotes > 0 ? ((score.count / maxVotes) * 100).toFixed(1) : 0}% ของคะแนนอันดับ 1
                                    </div>
                                </div>
                            );
                        })}

                        {scores.length === 0 && (
                            <div className="text-center text-slate-500 py-20 bg-slate-50 rounded-xl border border-slate-200">
                                <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-lg font-medium">ยังไม่มีข้อมูลคะแนนในระบบ</p>
                            </div>
                        )}
                    </div>
                    <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 text-center text-sm text-slate-500">
                        {/* Auto update time could be shown here */}
                        ระบบอัปเดตผลคะแนนอัตโนมัติ 
                    </div>
                </div>
            </div>
            <div className="flex justify-center mt-8">
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-8 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors font-semibold"
                >
                    กลับหน้าแรก
                </button>
            </div>
        </div>
    );
}
