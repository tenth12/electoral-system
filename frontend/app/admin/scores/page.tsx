'use client';

import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';

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

export default function ScoresPage() {
    const [scores, setScores] = useState<VoteSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const data = await adminService.getVoteSummary();
                // Sort by count descending
                setScores(data.sort((a: any, b: any) => b.count - a.count));
            } catch (error) {
                console.error('Failed to fetch scores', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchScores();
        
        // Refresh every 5 seconds
        const interval = setInterval(fetchScores, 5000);

        return () => clearInterval(interval);
    }, []);

    if (isLoading) return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>;

    // Calculate max votes for progress bar
    const maxVotes = scores.length > 0 ? scores[0].count : 0;

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800">ผลการนับคะแนน (Live Results) 🏆</h2>
                <p className="text-slate-500">ผลการลงคะแนนแบบเรียลไทม์</p>
            </header>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-10">
                {scores.map((score, index) => {
                    const details = score.candidateDetails || {} as any;
                    const info = score.candidateInfo || {} as any;
                    
                    return (
                        <div key={score._id} className="relative group">
                            <div className="flex flex-col md:flex-row justify-between md:items-end mb-4 gap-4">
                                <div className="flex items-center gap-6">
                                    {/* Rank Badge */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-md shrink-0 ${
                                        index === 0 ? 'bg-amber-400 text-white' : 
                                        index === 1 ? 'bg-slate-300 text-slate-700' :
                                        index === 2 ? 'bg-orange-300 text-white' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    
                                    {/* Profile Image */}
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 shrink-0">
                                        {details.imageUrl ? (
                                            <img src={details.imageUrl} alt={details.displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl">🏛️</div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-blue-100 text-blue-800 text-[15px] px-2 py-0.5 rounded-full font-bold">
                                                เบอร์ {details.candidateNumber || '-'}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-2xl text-slate-800">{details.displayName  || 'ไม่ทราบชื่อ'}</h3>
                                        <h2 className='text-sm text-blue-600 italic'>"{info.email}"</h2>
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="text-left md:text-right ml-18 md:ml-0">
                                    <div className="text-4xl font-black text-blue-600 bg-blue-50 px-6 py-2 rounded-2xl inline-block">
                                        {score.count} <span className="text-sm font-medium text-slate-500">คะแนน</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                        index === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                        'bg-gradient-to-r from-blue-500 to-indigo-600'
                                    }`}
                                    style={{ width: `${maxVotes > 0 ? (score.count / maxVotes) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}

                {scores.length === 0 && (
                    <div className="text-center text-slate-500 py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                         <div className="text-6xl mb-4">📊</div>
                        ยังไม่มีการลงคะแนนในขณะนี้
                    </div>
                )}
            </div>
        </div>
    );
}
