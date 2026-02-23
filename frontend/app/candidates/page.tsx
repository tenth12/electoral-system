'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

export default function CandidateSignUpPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // --- เพิ่ม State สำหรับไฟล์รูปภาพ ---
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: '',
        slogan: '',
        bio: '',
        imageUrl: ''
    });

    // ฟังก์ชันจัดการการเลือกไฟล์
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // สร้าง Preview ให้ผู้ใช้ดู
        }
    };

    const handleSignUpCandidate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password.length < 6) {
            return alert('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        }
        
        const confirmApply = confirm('ยืนยันการลงทะเบียนเป็นผู้สมัครรับเลือกตั้ง? ข้อมูลส่วนที่ 2 จะถูกเผยแพร่ต่อสาธารณะ');
        if (!confirmApply) return;

        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            let finalImageUrl = '';

            // --- 1. อัปโหลดรูปภาพก่อน (ถ้ามีการเลือกไฟล์) ---
            if (selectedFile) {
                const fileData = new FormData();
                fileData.append('file', selectedFile);

                const uploadRes = await fetch(`${apiUrl}/candidates/upload`, {
                    method: 'POST',
                    body: fileData, // ห้ามใส่ Content-Type header เมื่อส่ง FormData
                });

                if (uploadRes.ok) {
                    const uploadResult = await uploadRes.json();
                    finalImageUrl = uploadResult.imageUrl; // ได้ URL มาจาก Backend
                } else {
                    throw new Error('การอัปโหลดรูปภาพล้มเหลว');
                }
            }

            // --- 2. ส่งข้อมูลสมัครสมาชิกพร้อม URL รูปภาพ ---
            const res = await fetch(`${apiUrl}/candidates/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...formData, 
                    imageUrl: finalImageUrl 
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert(`ลงทะเบียนสำเร็จ! คุณคือผู้สมัครหมายเลข: ${data.candidateNumber}`);
                router.push('/auth/login');
            } else {
                alert(data.message || 'การสมัครล้มเหลว กรุณาลองใหม่');
            }
        } catch (error: any) {
            console.error('Signup Error:', error);
            alert(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <Navbar />
            <main className="flex-grow max-w-2xl w-full mx-auto p-6 md:py-12">
                <form onSubmit={handleSignUpCandidate} className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-100">
                    <div className="h-28 bg-gradient-to-br from-indigo-600 to-blue-600 flex flex-col justify-center px-8 text-white">
                        <h1 className="text-2xl font-bold">สมัครรับเลือกตั้ง</h1>
                        <p className="text-indigo-100 text-sm">สร้างบัญชีและลงทะเบียนผู้สมัครในขั้นตอนเดียว</p>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Section 1: Account */}
                        <section className="space-y-4">
                            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                <h3 className="font-bold text-slate-700">ข้อมูลบัญชีผู้ใช้</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">อีเมล</label>
                                    <input required type="email" value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">รหัสผ่าน</label>
                                    <input required type="password" value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Candidate Info & Image */}
                        <section className="space-y-4 pt-2">
                            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                <h3 className="font-bold text-slate-700">ข้อมูลการเลือกตั้ง</h3>
                            </div>

                            {/* --- ส่วนอัปโหลดรูปภาพ --- */}
                            <div className="flex flex-col items-center gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                {previewUrl ? (
                                    <img src={previewUrl} className="w-24 h-24 rounded-xl object-cover shadow-md" alt="Preview" />
                                ) : (
                                    <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm">🖼️</div>
                                )}
                                <div className="text-center">
                                    <label className="cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-all">
                                        เลือกรูปภาพพรรค/ผู้สมัคร
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                    <p className="text-[10px] text-slate-400 mt-2">ไฟล์ JPG, PNG ขนาดไม่เกิน 2MB</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ชื่อผู้สมัคร/ชื่อพรรค</label>
                                <input required type="text" value={formData.displayName}
                                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                                    className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">สโลแกนหรือนโยบายหลัก</label>
                                <textarea required rows={2} value={formData.slogan}
                                    onChange={(e) => setFormData({...formData, slogan: e.target.value})}
                                    className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none" 
                                />
                            </div>
                        </section>

                        <div className="pt-4">
                            <button type="submit" disabled={isSubmitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:bg-slate-300 flex items-center justify-center space-x-2">
                                {isSubmitting ? 'กำลังดำเนินการ...' : 'ลงทะเบียนและสมัครเลือกตั้ง'}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}