'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

export default function CandidateSignUpPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        displayName: '',
        slogan: '',
        imageUrl: '',
        description: ''
    });
    
    const [isVotingEnabled, setIsVotingEnabled] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                const res = await fetch(`${apiUrl}/settings/voting`);
                if (res.ok) {
                    const data = await res.json();
                    setIsVotingEnabled(data.isVotingEnabled);
                }
            } catch (error) {
                console.error("Failed to check status", error);
            }
        };
        checkStatus();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSignUpCandidate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isVotingEnabled) {
            return alert('ระบบปิดรับสมัครแล้ว');
        }

        if (formData.password.length < 8) {
            return alert('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
        }

        if (!selectedFile) {
            return alert('กรุณาอัปโหลดรูปภาพพรรค/ผู้สมัครก่อนทำการสมัคร');
        }

        const confirmApply = confirm('ยืนยันการลงทะเบียนเป็นผู้สมัครรับเลือกตั้ง?');
        if (!confirmApply) return;

        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            let finalImageUrl = '';

            const fileData = new FormData();
            fileData.append('file', selectedFile);

            const uploadRes = await fetch(`${apiUrl}/candidates/upload`, {
                method: 'POST',
                body: fileData,
            });

            if (uploadRes.ok) {
                const uploadResult = await uploadRes.json();
                finalImageUrl = uploadResult.imageUrl;
            } else {
                const errorData = await uploadRes.json();
                throw new Error(errorData.message || 'การอัปโหลดรูปภาพล้มเหลว');
            }

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
                alert(`ลงทะเบียนสำเร็จ!`);
                router.push('/auth/login');
            } else {

                const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
                alert(errorMsg || 'การสมัครล้มเหลว กรุณาลองใหม่');
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
                        <p className="text-indigo-100 text-sm">ตรวจสอบอีเมลและรหัสผ่านให้ถูกต้องก่อนสมัคร</p>
                    </div>

                    {!isVotingEnabled && (
                        <div className="bg-red-50 p-6 border-b border-red-100 flex items-center gap-4">
                            <span className="text-3xl">⛔</span>
                            <div>
                                <h3 className="text-red-800 font-bold text-lg">ประกาศ: ปิดรับสมัคร</h3>
                                <p className="text-red-700 text-sm">ขณะนี้ระบบปิดรับสมัครผู้ถูกเลือกตั้งแล้ว คุณไม่สามารถดำเนินการต่อได้</p>
                            </div>
                        </div>
                    )}

                    <div className={`p-8 space-y-6 ${!isVotingEnabled ? 'opacity-50 pointer-events-none' : ''}`}>

                        <section className="space-y-4">
                            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                <h3 className="font-bold text-slate-700">ข้อมูลบัญชีผู้ใช้</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">อีเมล</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="example@mail.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">รหัสผ่าน (8 ตัวขึ้นไป)</label>
                                    <input
                                        required
                                        type="password"
                                        minLength={8}
                                        placeholder="รหัสผ่าน 8 ตัวขึ้นไป"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-black"
                                    />
                                </div>
                            </div>
                        </section>
                        <section className="space-y-4 pt-2">
                            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                <h3 className="font-bold text-slate-700">ข้อมูลการเลือกตั้ง</h3>
                            </div>

                            <div className="flex flex-col items-center gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                {previewUrl ? (
                                    <img src={previewUrl} className="w-24 h-24 rounded-xl object-cover shadow-md" alt="Preview" />
                                ) : (
                                    <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm">🖼️</div>
                                )}
                                <div className="text-center">
                                    <label className="cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-all text-black">
                                        เลือกรูปภาพพรรค/ผู้สมัคร
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                    <p className="text-[10px] text-slate-400 mt-2">ไฟล์ JPG, PNG ขนาดไม่เกิน 15MB (จำเป็น)</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ชื่อผู้สมัคร/ชื่อพรรค</label>
                                <input required type="text" value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">สโลแกนหรือนโยบายหลัก</label>
                                <textarea required rows={2} value={formData.slogan}
                                    onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                                    className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">คำอธิบายเกี่ยวกับผู้สมัคร(เพิ่มเติ่มได้)</label>
                                <textarea required rows={2} value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-black"
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-red-600">คำเตือน</h3>
                                <p className="text-xs text-slate-500">รูปภาพที่ใช้จะต้องเป็นรูปภาพที่สุภาพและไม่ละเมิดลิขสิทธิ์ หากพบว่ารูปภาพที่ใช้ละเมิดลิขสิทธิ์จะถูกลบออกจากระบบ</p>
                                <p className="text-xs text-slate-500">สโลแกนหรือนโยบายหลักที่ใช้จะต้องเป็นสโลแกนหรือนโยบายหลักที่สุภาพและไม่ละเมิดลิขสิทธิ์ หากพบว่าสโลแกนหรือนโยบายหลักที่ใช้ละเมิดลิขสิทธิ์จะถูกลบออกจากระบบ</p>
                                <p className="text-xs text-slate-500">คำอธิบายเกี่ยวกับผู้สมัครที่ใช้จะต้องเป็นคำอธิบายเกี่ยวกับผู้สมัครที่สุภาพและไม่ละเมิดลิขสิทธิ์ หากพบว่าคำอธิบายเกี่ยวกับผู้สมัครที่ใช้ละเมิดลิขสิทธิ์จะถูกลบออกจากระบบ</p>
                                <p className="text-xs text-slate-500">ชื่อผู้สมัคร/ชื่อพรรคที่ใช้จะต้องเป็นชื่อผู้สมัคร/ชื่อพรรคที่สุภาพและไม่ละเมิดลิขสิทธิ์ หากพบว่าชื่อผู้สมัคร/ชื่อพรรคที่ใช้ละเมิดลิขสิทธิ์จะถูกลบออกจากระบบ</p>
                                <p className="text-xs text-slate-500">ห้ามซื้อเสียง เป็นการทำผิดกฎหมาย หากพบว่ามีการซื้อเสียงจะมีการดำเนินคดีตามกฎหมาย</p>
                            </div>
                        </section>

                        <div className="pt-4">
                            <button type="submit" disabled={isSubmitting || !isVotingEnabled}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:bg-slate-300 flex items-center justify-center space-x-2">
                                {isSubmitting ? 'กำลังตรวจสอบข้อมูล...' : (!isVotingEnabled ? 'ปิดรับสมัคร' : 'ลงทะเบียนและสมัครเลือกตั้ง')}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}