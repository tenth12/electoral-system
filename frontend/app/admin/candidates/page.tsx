'use client';

import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    email: string;
    role: string;
    createdAt: string;
    displayName: string;
}

interface Candidate {
    _id: string;
    candidateNumber: number;
    displayName: string;
    slogan: string;
    imageUrl?: string;
    userId: User;
}

export default function CandidatesPage() {
    const router = useRouter();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                // Fetch directly from the /candidates endpoint to get displayName and other profile info
                const res = await adminService.getCandidates();
                setCandidates(res);
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
            <h1 className="text-3xl font-bold text-slate-800">Candidates</h1>
            <br />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates.map((candidate) => (
                    <div key={candidate._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <div className="w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-slate-100 flex items-center justify-center bg-slate-50 relative group">
                            {candidate.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={candidate.imageUrl}
                                    alt={candidate.displayName}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                            ) : (
                                <div className="text-4xl">👔</div>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{candidate.userId?.email || 'N/A'}</h3>
                        <p className="text-slate-400 text-sm mb-4">Candidate Name: {candidate.displayName}</p>
                        <p className="text-slate-400 text-sm mb-4">Candidate ID: {candidate.candidateNumber}</p>
                        
                        <div className="w-full flex gap-2">
                            <button 
                                onClick={() => router.push(`/candidates/info?id=${candidate.userId?._id}`)}
                                className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg font-bold text-sm transition-colors"
                            >
                                View Profile
                            </button> 
                            <button 
                                onClick={async () => {
                                    if (window.confirm(`Are you sure you want to delete candidate ${candidate.displayName}? This action cannot be undone.`)) {
                                        try {
                                            await adminService.deleteCandidate(candidate.userId._id);
                                            setCandidates(prev => prev.filter(c => c._id !== candidate._id));
                                            alert('Candidate deleted successfully');
                                        } catch (error) {
                                            console.error('Error deleting candidate:', error);
                                            alert('Failed to delete candidate');
                                        }
                                    }
                                }}
                                className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold text-sm transition-colors"
                            >
                                Delete
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
