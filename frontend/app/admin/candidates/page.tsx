'use client';

import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';

interface User {
    _id: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                // Actually filter by role=candidate via API or client side if API ignores it
                const data = await adminService.getUsers('candidate');
                setCandidates(data);
            } catch (error) {
                console.error('Failed to fetch candidates', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800">Candidates</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95">
                    + Add Candidate
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates.map((candidate) => (
                    <div key={candidate._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center text-4xl mb-4">
                            👔
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{candidate.email}</h3>
                        <p className="text-slate-400 text-sm mb-4">Candidate ID: {candidate._id.slice(-6)}</p>
                        
                        <div className="w-full flex gap-2">
                            <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg font-bold text-sm transition-colors">
                                View Profile
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {candidates.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                     <div className="text-4xl mb-4">📭</div>
                     <p className="text-slate-500 font-medium">No candidates found.</p>
                </div>
            )}
        </div>
    );
}
