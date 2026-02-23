'use client';

import { useEffect, useState } from 'react';
import { adminService } from '../services/admin.service';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        users: 0,
        candidates: 0,
        votes: 0
    });
    const [isVotingEnabled, setIsVotingEnabled] = useState(true);
    const [isStatusLoading, setIsStatusLoading] = useState(true);

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

        const fetchStatus = async () => {
            try {
                const status = await adminService.getVotingStatus();
                setIsVotingEnabled(status.isVotingEnabled);
            } catch (error) {
                console.error('Failed to fetch voting status', error);
            } finally {
                setIsStatusLoading(false);
            }
        };

        fetchStats();
        fetchStatus();
    }, []);

    const toggleVotingStatus = async () => {
        try {
            const newStatus = !isVotingEnabled;
            setIsVotingEnabled(newStatus); // Optimistic update
            await adminService.setVotingStatus(newStatus);
        } catch (error) {
            console.error('Failed to toggle voting status', error);
            setIsVotingEnabled(!isVotingEnabled); // Revert on failure
            alert('ไม่สามารถเปลี่ยนสถานะระบบได้');
        }
    };

    return (
        <div>
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Dashboard Overview</h2>
                    <p className="text-slate-500">Welcome to the election system administration.</p>
                </div>
                
                {/* Voting System Toggle */}
                {!isStatusLoading && (
                    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex flex-col text-right">
                            <span className="text-sm font-bold text-slate-700">ระบบเลือกตั้งและรับสมัคร</span>
                            <span className={`text-xs font-medium ${isVotingEnabled ? 'text-green-600' : 'text-red-500'}`}>
                                {isVotingEnabled ? 'เปิดใช้งาน' : 'ปิดการใช้งาน'}
                            </span>
                        </div>
                        <button 
                            onClick={toggleVotingStatus}
                            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isVotingEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isVotingEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Users" 
                    value={stats.users} 
                    icon="👥" 
                    color="bg-indigo-500" 
                    onClick={() => router.push('/admin/users')}
                />
                <StatCard 
                    title="Candidates" 
                    value={stats.candidates} 
                    icon="👔" 
                    color="bg-pink-500" 
                    onClick={() => router.push('/admin/candidates')}
                />
                <StatCard 
                    title="Total Votes" 
                    value={stats.votes} 
                    icon="🗳️" 
                    color="bg-amber-500" 
                    onClick={() => router.push('/admin/scores')}
                />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, onClick }: { title: string, value: number, icon: string, color: string, onClick?: () => void }) {
    return (
        <div 
            onClick={onClick}
            className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        >
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
