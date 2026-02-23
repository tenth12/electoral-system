'use client';

import { useEffect, useState, Suspense } from 'react';
import Navbar from '../../components/Navbar';
import { useSearchParams } from 'next/navigation';

interface CandidateProfile {
    _id: string;
    candidateNumber: number;
    displayName: string;
    slogan: string;
    imageUrl: string;
    appliedAt: string;
}

function CandidateDashboardContent() {
    const searchParams = useSearchParams();
    const queryId = searchParams.get('id');

    const [profile, setProfile] = useState<CandidateProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        displayName: '',
        slogan: '',
        imageUrl: ''
    });
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const fetchMyProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const payload = JSON.parse(atob(token.split('.')[1]));
            const loggedInUserId = payload.sub;
            
            // If viewing someone else's profile via queryId, otherwise view own
            const targetUserId = queryId || loggedInUserId;
            setIsOwnProfile(targetUserId === loggedInUserId);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/candidates/user/${targetUserId}`, {
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
                    
                    // --- Delete old image if it exists and is different ---
                    if (profile?.imageUrl && profile.imageUrl !== currentImageUrl) {
                        try {
                            await fetch(`${apiUrl}/candidates/image?imageUrl=${encodeURIComponent(profile.imageUrl)}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                        } catch (err) {
                            console.error('Failed to delete old image', err);
                        }
                    }
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

    const handleVote = async () => {
        if (!confirm('ยืนยันการลงคะแนนให้ผู้สมัครท่านนี้?')) return;

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/votes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ candidateId: profile?._id })
            });

            if (res.ok) {
                alert('ลงคะแนนเรียบร้อยแล้ว');
            } else {
                const data = await res.json();
                alert(data.message || 'การลงคะแนนล้มเหลว');
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">กำลังโหลดข้อมูล...</div>;
    if (!profile) return <div className="text-center mt-20">ไม่พบข้อมูล</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />
            
            <main className="max-w-4xl mx-auto px-4 py-12 w-full">
                <div className="bg-blue-100 rounded-[2.5rem] p-10 md:p-14 shadow-sm border border-slate-100 relative overflow-hidden">
                    
                    {/* Badge หมายเลข - ดีไซน์ให้เด่นขึ้น */}
                    <div className="absolute top-0 right-0 bg-slate-900 text-white px-12 py-6 rounded-bl-[2.5rem] shadow-xl flex flex-col items-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">CANDIDATE NO.</p>
                        <p className="text-5xl font-black">{profile.candidateNumber}</p>
                    </div>

                    <div className="flex flex-col items-center md:items-start gap-10">
                        {/* รูปภาพพรรค */}
                        <div className="relative group">
                            <div className="w-52 h-52 bg-slate-50 rounded-[2.5rem] overflow-hidden shadow-inner border-8 border-white ring-1 ring-slate-200">
                                {previewUrl ? (
                                    <img 
                                        src={previewUrl} 
                                        alt="Candidate" 
                                        className={`w-full h-full object-cover ${!isEditing ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                                        onClick={() => !isEditing && setIsImageModalOpen(true)}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-7xl">🏛️</div>
                                )}
                            </div>
                            {isEditing && (
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-[2.5rem] cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                                    <span className="text-white text-sm font-bold bg-blue-600 px-5 py-2.5 rounded-full shadow-2xl">เปลี่ยนรูปภาพ</span>
                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </label>
                            )}
                        </div>

                        {/* ข้อมูลพรรค */}
                        <div className="w-full">
                            {isEditing ? (
                                <div className="space-y-6 max-w-xl">
                                    <div className="group">
                                        <label className="text-[10px] font-black text-blue-600 uppercase ml-1 tracking-widest">ชื่อผู้สมัคร / ชื่อพรรค</label>
                                        <input 
                                            className="text-3xl font-bold w-full border-b-2 border-slate-200 focus:border-blue-600 outline-none p-2 bg-transparent transition-colors text-black"
                                            value={editForm.displayName}
                                            onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="text-[10px] font-black text-blue-600 uppercase ml-1 tracking-widest">สโลแกน</label>
                                        <input 
                                            className="text-xl text-slate-600 w-full border-b-2 border-slate-200 focus:border-blue-600 outline-none p-2 italic bg-transparent transition-colors"
                                            value={editForm.slogan}
                                            onChange={(e) => setEditForm({...editForm, slogan: e.target.value})}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-tight">
                                        {profile.displayName}
                                    </h1>
                                    <p className="text-2xl text-blue-600 font-medium italic opacity-90 leading-relaxed">
                                        "{profile.slogan}"
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ปุ่มกด */}
                        {isOwnProfile && (
                            <div className="flex gap-4 w-full md:w-auto pt-6">
                                {isEditing ? (
                                    <>
                                        <button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-300">
                                            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                                        </button>
                                        <button onClick={() => { setIsEditing(false); setPreviewUrl(profile.imageUrl); }} className="flex-1 md:flex-none px-10 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                                            ยกเลิก
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="w-full md:w-auto px-12 py-5 bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900 rounded-2xl font-black transition-all text-lg shadow-sm hover:shadow-md">
                                        แก้ไขข้อมูลโปรไฟล์
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer ย่อส่วน */}
                    <div className="mt-16 pt-8 border-t border-slate-50 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Candidate</span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-300 uppercase tracking-tighter">
                            Joined Since: {new Date(profile.appliedAt).toLocaleDateString('th-TH')}
                        </p>
                    </div>
                </div>
            </main>

            {/* Modal ดูรูปภาพขนาดใหญ่ */}
            {isImageModalOpen && previewUrl && (
                <div 
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setIsImageModalOpen(false)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
                        <button 
                            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors"
                            onClick={() => setIsImageModalOpen(false)}
                        >
                            ✕
                        </button>
                        <img 
                            src={previewUrl} 
                            alt="Candidate Fullsize" 
                            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border-4 border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CandidateDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">กำลังโหลดข้อมูล...</div>}>
            <CandidateDashboardContent />
        </Suspense>
    );
}