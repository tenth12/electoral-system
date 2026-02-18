'use client';

import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';

interface VoteSummary {
    _id: string; // Candidate ID
    count: number;
    candidateInfo: {
        email: string;
        role: string;
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
    }, []);

    if (isLoading) return <div>Loading...</div>;

    // Calculate max votes for progress bar
    const maxVotes = scores.length > 0 ? scores[0].count : 0;

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Live Results 🏆</h2>
                <p className="text-slate-500">Real-time voting scores.</p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-8">
                {scores.map((score, index) => (
                    <div key={score._id} className="relative">
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-sm">
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{score.candidateInfo.email}</h3>
                                    <p className="text-xs text-slate-400">Candidate</p>
                                </div>
                            </div>
                            <div className="text-2xl font-black text-blue-600">{score.count} <span className="text-sm font-medium text-slate-400">votes</span></div>
                        </div>
                        
                        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${maxVotes > 0 ? (score.count / maxVotes) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                ))}

                {scores.length === 0 && (
                    <div className="text-center text-slate-500 py-10">
                        No votes recorded yet.
                    </div>
                )}
            </div>
        </div>
    );
}
