'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '../services/admin.service';

interface User {
    _id: string;
    email: string;
}

export default function VotePage() {
    const router = useRouter();
    const [candidates, setCandidates] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [hasVoted, setHasVoted] = useState(false); // Ideally check from backend but simplified here

    useEffect(() => {
        const init = async () => {
            try {
                const profile = await adminService.getProfile();
                setUser(profile);
                
                // Fetch candidates
                const data = await adminService.getCandidates();
                setCandidates(data);
                
                // Check if user voted? 
                // The backend throws error if voted again, so we handle that.
            } catch (error) {
                router.push('/auth/login');
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [router]);

    const handleVote = async (candidateId: string) => {
        if (!confirm('Are you sure you want to vote for this candidate?')) return;
        
        try {
            // We need a vote endpoint in adminService (which is really just apiService)
            // But adminService.getUsers is specific. 
            // We should use fetchWithAuth directly or add method.
            // Let's assume we add castVote to adminService or just use fetch here for speed.
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
                alert('Vote cast successfully!');
                setHasVoted(true);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to vote');
            }
        } catch (error) {
            alert('Error casting vote');
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="max-w-4xl mx-auto flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Election 2026 🗳️</h1>
                    <p className="text-slate-500">Welcome, {user?.email}</p>
                </div>
                <button 
                    onClick={() => {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        router.push('/auth/login');
                    }}
                    className="text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                >
                    Logout
                </button>
            </header>

            <main className="max-w-4xl mx-auto">
                <h2 className="text-xl font-bold text-slate-700 mb-6">Cast Your Vote</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {candidates.map((candidate) => (
                        <div key={candidate._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-blue-50 text-3xl flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">
                                    👤
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{candidate.email}</h3>
                                    <p className="text-xs text-slate-400">Candidate</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleVote(candidate._id)}
                                disabled={hasVoted}
                                className={`px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg
                                    ${hasVoted 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                                    }`}
                            >
                                {hasVoted ? 'Voted' : 'Vote'}
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
