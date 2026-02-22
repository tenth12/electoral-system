'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

export default function CandidateSignUpPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // เก็บข้อมูลบัญชีและข้อมูลผู้สมัคร
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: '',
        slogan: '',
        bio: '',
        imageUrl: ''
    });

    const handleSignUpCandidate = async (e: React.FormEvent) => {
        e.preventDefault();

        // --- 1. Client-side Validation ---
        if (formData.password.length < 6) {
            return alert('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        }
        
        const confirmApply = confirm('ยืนยันการลงทะเบียนเป็นผู้สมัครรับเลือกตั้ง? ข้อมูลส่วนที่ 2 จะถูกเผยแพร่ต่อสาธารณะ');
        if (!confirmApply) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/candidates/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                alert('ลงทะเบียนผู้สมัครสำเร็จ! ระบบกำลังพาคุณไปหน้าเข้าสู่ระบบ');
                router.push('/auth/login');
            } else {
                // แสดง Error Message จาก Backend (เช่น 'อีเมลนี้ถูกใช้งานแล้ว')
                alert(data.message || 'การสมัครล้มเหลว กรุณาลองใหม่');
            }
        } catch (error) {
            console.error('Signup Error:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
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
                                <h3 className="font-bold text-slate-700">ข้อมูลบัญชีผู้ใช้ (ใช้สำหรับเข้าระบบ)</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">อีเมล</label>
                                    <input required type="email" placeholder="example@mail.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">รหัสผ่าน</label>
                                    <input required type="password" placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Candidate */}
                        <section className="space-y-4 pt-2">
                            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                <h3 className="font-bold text-slate-700">ข้อมูลการเลือกตั้ง (แสดงต่อสาธารณะ)</h3>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ชื่อผู้สมัครที่ต้องการให้แสดง</label>
                                <input required type="text" placeholder="ชื่อ-นามสกุล หรือ ฉายา"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                                    className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">สโลแกนหรือนโยบายหลัก</label>
                                <textarea required rows={2} placeholder="เช่น มุ่งมั่น พัฒนา เพื่อทุกคน"
                                    value={formData.slogan}
                                    onChange={(e) => setFormData({...formData, slogan: e.target.value})}
                                    className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none" 
                                />
                            </div>
                        </section>

                        <div className="pt-4">
                            <button type="submit" disabled={isSubmitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center space-x-2">
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>กำลังลงทะเบียน...</span>
                                    </>
                                ) : (
                                    <span>ลงทะเบียนและสมัครเลือกตั้ง</span>
                                )}
                            </button>
                            <p className="text-center text-slate-400 text-xs mt-4">
                                การคลิกปุ่มถือว่าคุณยอมรับข้อกำหนดในการเผยแพร่ข้อมูลผู้สมัคร
                            </p>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}