'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';

interface CandidateProfile {
    _id: string;
    displayName: string;
    slogan: string;
    bio: string;
    imageUrl: string;
    appliedAt: string;
}

export default function CandidateDashboard() {
    const [profile, setProfile] = useState<CandidateProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- เพิ่ม State สำหรับการแก้ไข ---
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        displayName: '',
        slogan: '',
        bio: '',
        imageUrl: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const fetchMyProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.sub;

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/candidates/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                // เตรียมข้อมูลใส่ Form เผื่อกดแก้ไข
                setEditForm({
                    displayName: data.displayName,
                    slogan: data.slogan,
                    bio: data.bio,
                    imageUrl: data.imageUrl
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProfile();
    }, []);

    // --- ฟังก์ชันสำหรับบันทึกข้อมูล ---
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const payload = JSON.parse(atob(token!.split('.')[1]));
            const userId = payload.sub;

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/candidates/user/${userId}`, {
                method: 'PATCH', // หรือ PUT ตามที่ตั้งไว้ใน Backend
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                const updatedData = await res.json();
                setProfile(updatedData);
                setIsEditing(false);
                alert('อัปเดตข้อมูลสำเร็จ');
            } else {
                alert('เกิดข้อผิดพลาดในการบันทึก');
            }
        } catch (error) {
            console.error('Update failed', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">กำลังโหลดข้อมูล...</div>;
    if (!profile) return <div className="text-center mt-20">ไม่พบข้อมูล</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            
            <main className="max-w-4xl mx-auto px-4 py-12 w-full">
                {/* Header Section */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Profile Image */}
                        <div className="w-40 h-40 bg-blue-100 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                            {profile.imageUrl ? (
                                <img src={profile.imageUrl} alt="Party Logo" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl">🏛️</div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-grow text-center md:text-left w-full">
                            <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-3">
                                สถานะ: ผู้สมัครรับเลือกตั้ง
                            </div>
                            
                            {isEditing ? (
                                <div className="space-y-3">
                                    <input 
                                        className="text-2xl font-bold w-full border-b-2 border-blue-500 outline-none p-1"
                                        value={editForm.displayName}
                                        onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                                        placeholder="ชื่อพรรค/ชื่อผู้สมัคร"
                                    />
                                    <input 
                                        className="text-lg text-blue-600 w-full border-b border-blue-300 outline-none p-1 italic"
                                        value={editForm.slogan}
                                        onChange={(e) => setEditForm({...editForm, slogan: e.target.value})}
                                        placeholder="สโลแกนพรรค"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{profile.displayName}</h1>
                                    <p className="text-xl text-blue-600 font-medium italic">"{profile.slogan}"</p>
                                </>
                            )}
                        </div>

                        <div className="flex-shrink-0 flex gap-2">
                            {isEditing ? (
                                <>
                                    <button 
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:bg-slate-400"
                                    >
                                        {isSaving ? 'บันทึก...' : 'บันทึก'}
                                    </button>
                                    <button 
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-2 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all"
                                    >
                                        ยกเลิก
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2 border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 rounded-xl font-bold transition-all"
                                >
                                    แก้ไขข้อมูล
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                📝 นโยบายและรายละเอียดพรรค
                            </h3>
                            {isEditing ? (
                                <textarea 
                                    className="w-full h-40 border-2 border-slate-200 rounded-xl p-4 outline-none focus:border-blue-500 transition-all"
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                    placeholder="เขียนนโยบายหรือรายละเอียดพรรคที่นี่..."
                                />
                            ) : (
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {profile.bio || 'ยังไม่ได้ระบุรายละเอียด'}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-blue-900 rounded-3xl p-6 text-white shadow-lg">
                            <h3 className="font-bold mb-4 opacity-80">ข้อมูลภาพรวม</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs opacity-60">วันที่ลงสมัคร</p>
                                    <p className="font-medium">{new Date(profile.appliedAt).toLocaleDateString('th-TH')}</p>
                                </div>
                                <div>
                                    <p className="text-xs opacity-60">คะแนนเสียงปัจจุบัน</p>
                                    <p className="text-2xl font-bold">-- คะแนน</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <p className="text-sm text-slate-500 text-center">
                                หากต้องการสละสิทธิ์การเลือกตั้ง <br/>โปรดติดต่อเจ้าหน้าที่ดูแลระบบ
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}