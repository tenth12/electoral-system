import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Candidate, CandidateDocument } from './schemas/candidates.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectModel(Candidate.name) private candidateModel: Model<CandidateDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // --- สมัครสมาชิกและลงเลือกตั้งในทีเดียว (Plain Text Password) ---
  async signupAndApply(data: any) {
    const { email, password, displayName, slogan, bio, imageUrl } = data;

    // 1. ตรวจสอบว่ามีอีเมลนี้ในระบบหรือยัง
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await this.userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new BadRequestException('อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบเพื่อสมัคร');
    }

    // 2. ข้ามการแฮชรหัสผ่าน (ใช้ password ตรงๆ ตามระบบ Auth ของคุณ)
    // เก็บเข้าฟิลด์ passwordHash เป็น Plain Text
    const passwordHash = password; 

    // 3. สร้าง User ใหม่
    const newUser = new this.userModel({
      email: normalizedEmail,
      passwordHash: passwordHash, // เก็บ '123456' ลงไปตรงๆ
      role: 'candidate',
      // ถ้าใน Schema ไม่มี hasVoted ให้เอาออกนะครับ
    });
    const savedUser = await newUser.save();

    // 4. บันทึกข้อมูลลงใน Candidate Collection
    const newCandidate = new this.candidateModel({
      userId: savedUser._id,
      displayName: displayName,
      slogan: slogan,
      bio: bio || '',
      imageUrl: imageUrl || '',
      appliedAt: new Date(),
    });

    await newCandidate.save();

    return {
      message: 'ลงทะเบียนผู้สมัครสำเร็จแล้ว (Plain Text Mode)',
      user: { email: savedUser.email, role: savedUser.role }
    };
  }

  // --- ฟังก์ชันเดิม (สำหรับคนที่มี ID อยู่แล้วมาสมัครเพิ่ม) ---
  async apply(userId: string, data: any) {
    const existing = await this.candidateModel.findOne({ userId: new Types.ObjectId(userId) });
    if (existing) throw new BadRequestException('คุณได้ลงสมัครรับเลือกตั้งไปแล้ว');

    const newCandidate = new this.candidateModel({
      userId: new Types.ObjectId(userId),
      displayName: data.displayName,
      slogan: data.slogan,
      bio: data.bio,
      imageUrl: data.imageUrl,
    });

    await this.userModel.findByIdAndUpdate(userId, { role: 'candidate' });
    return await newCandidate.save();
  }

  async findAll() {
    return this.candidateModel.find().populate('userId', 'email').exec();
  }
}