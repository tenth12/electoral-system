'use client';

import { useEffect, useState } from 'react';
import { adminService } from '../services/admin.service';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        candidates: 0,
        votes: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Parallel fetch for dashboard stats
                const [users, candidates, votesSummary] = await Promise.all([
                    adminService.getUsers(),
                    adminService.getCandidates(),
                    adminService.getVoteSummary()
                ]);

                // Calculate total votes from summary
                const totalVotes = votesSummary.reduce((acc: number, curr: any) => acc + curr.count, 0);

                setStats({
                    users: users.length,
                    candidates: candidates.length,
                    votes: totalVotes
                });
            } catch (error) {
                console.error('Failed to fetch stats', error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Dashboard Overview</h2>
                <p className="text-slate-500">Welcome to the election system administration.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Users" 
                    value={stats.users} 
                    icon="👥" 
                    color="bg-indigo-500" 
                />
                <StatCard 
                    title="Candidates" 
                    value={stats.candidates} 
                    icon="👔" 
                    color="bg-pink-500" 
                />
                <StatCard 
                    title="Total Votes" 
                    value={stats.votes} 
                    icon="🗳️" 
                    color="bg-amber-500" 
                />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: string, color: string }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-wider mb-1">{title}</p>
                <h3 className="text-4xl font-black text-slate-800">{value}</h3>
            </div>
            <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-indigo-100 text-white`}>
                {icon}
            </div>
        </div>
    );
}
