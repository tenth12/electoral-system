'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';

interface CandidateProfile {
    _id: string;
    candidateNumber: number;
    displayName: string;
    slogan: string;
    imageUrl: string;
    appliedAt: string;
}

export default function CandidateDashboard() {
    const [profile, setProfile] = useState<CandidateProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        displayName: '',
        slogan: '',
        imageUrl: ''
    });
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
                setEditForm({
                    displayName: data.displayName,
                    slogan: data.slogan,
                    imageUrl: data.imageUrl
                });
                setPreviewUrl(data.imageUrl);
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchMyProfile(); }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const payload = JSON.parse(atob(token!.split('.')[1]));
            const userId = payload.sub;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

            let currentImageUrl = editForm.imageUrl;

            if (selectedFile) {
                const fileData = new FormData();
                fileData.append('file', selectedFile);
                const uploadRes = await fetch(`${apiUrl}/candidates/upload`, {
                    method: 'POST',
                    body: fileData
                });
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    currentImageUrl = uploadData.imageUrl;
                }
            }

            const res = await fetch(`${apiUrl}/candidates/user/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...editForm, imageUrl: currentImageUrl })
            });

            if (res.ok) {
                const updatedData = await res.json();
                setProfile(updatedData);
                setIsEditing(false);
                setSelectedFile(null);
                alert('อัปเดตข้อมูลสำเร็จ');
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
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />
            
            <main className="max-w-4xl mx-auto px-4 py-12 w-full">
                {/* Profile Card - ปรับให้โชว์ข้อมูลหลักครบในที่เดียว */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
                    
                    {/* Badge หมายเลข */}
                    <div className="absolute top-0 right-0 bg-blue-600 text-white px-10 py-5 rounded-bl-[2rem] shadow-lg flex flex-col items-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">หมายเลข</p>
                        <p className="text-5xl font-black">{profile.candidateNumber}</p>
                    </div>

                    <div className="flex flex-col items-center md:items-start gap-8">
                        {/* รูปภาพพรรค */}
                        <div className="relative group">
                            <div className="w-48 h-48 bg-slate-100 rounded-[2rem] overflow-hidden shadow-inner border-4 border-white ring-1 ring-slate-100">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Candidate" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl">🏛️</div>
                                )}
                            </div>
                            {isEditing && (
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[2rem] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-bold bg-blue-600 px-4 py-2 rounded-full shadow-lg">เปลี่ยนรูปภาพ</span>
                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </label>
                            )}
                        </div>

                        {/* ข้อมูลพรรค */}
                        <div className="w-full">
                            {isEditing ? (
                                <div className="space-y-4 max-w-xl">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">ชื่อผู้สมัคร / ชื่อพรรค</label>
                                        <input 
                                            className="text-3xl font-bold w-full border-b-2 border-blue-500 outline-none p-2 bg-blue-50/30 rounded-t-lg"
                                            value={editForm.displayName}
                                            onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">สโลแกน</label>
                                        <input 
                                            className="text-xl text-blue-600 w-full border-b-2 border-blue-300 outline-none p-2 italic bg-blue-50/30 rounded-t-lg"
                                            value={editForm.slogan}
                                            onChange={(e) => setEditForm({...editForm, slogan: e.target.value})}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full mb-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        สถานะ: กำลังเปิดรับลงคะแนน
                                    </div>
                                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">{profile.displayName}</h1>
                                    <p className="text-2xl text-blue-600 font-medium italic">"{profile.slogan}"</p>
                                </div>
                            )}
                        </div>

                        {/* ปุ่มกด */}
                        <div className="flex gap-3 w-full md:w-auto pt-4">
                            {isEditing ? (
                                <>
                                    <button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:bg-slate-400">
                                        {isSaving ? 'กำลังบันทึก...' : 'ยืนยันการแก้ไข'}
                                    </button>
                                    <button onClick={() => { setIsEditing(false); setPreviewUrl(profile.imageUrl); }} className="flex-1 md:flex-none px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                                        ยกเลิก
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="w-full md:w-auto px-10 py-4 border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 rounded-2xl font-bold transition-all text-lg">
                                    แก้ไขข้อมูลพรรค
                                </button>
                            )}
                        </div>
                    </div>

                    {/* สถิติแบบย่อด้านล่าง */}
                    <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">คะแนนโหวต</p>
                            <p className="text-3xl font-black text-blue-600">0</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">ลำดับปัจจุบัน</p>
                            <p className="text-3xl font-black text-slate-800">--</p>
                        </div>
                        <div className="md:col-span-2 text-right self-end">
                            <p className="text-xs text-slate-300">ลงทะเบียนเมื่อ {new Date(profile.appliedAt).toLocaleDateString('th-TH')}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}