import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'; // เพิ่ม NotFoundException
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Candidate, CandidateDocument } from './schemas/candidates.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import * as argon2 from 'argon2';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectModel(Candidate.name) private candidateModel: Model<CandidateDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  // 1. ฟังก์ชันค้นหาข้อมูลส่วนตัวผู้สมัคร (สำหรับหน้า Profile ของพรรคนั้นๆ)
  async findOneByUserId(userId: string) {
    // ใช้ populate เพื่อดึง email จาก User collection มาด้วย
    const candidate = await this.candidateModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('userId', 'email')
      .exec();

    if (!candidate) {
      throw new NotFoundException('ไม่พบข้อมูลผู้สมัครสำหรับผู้ใช้งานนี้');
    }
    return candidate;
  }

  // --- สมัครสมาชิกและลงเลือกตั้งในทีเดียว ---
  async signupAndApply(data: any) {
    const { email, password, displayName, slogan, bio, imageUrl } = data;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await this.userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new BadRequestException('Email นี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบเพื่อสมัคร');
    }

    const passwordHash = await argon2.hash(password);

    const newUser = new this.userModel({
      email: normalizedEmail,
      passwordHash: passwordHash,
      role: 'candidate',
      refreshTokenHash: null,
    });
    const savedUser = await newUser.save();

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
      message: 'ลงทะเบียนผู้สมัครสำเร็จแล้ว กรุณาเข้าสู่ระบบเพื่อรับ Token',
      user: { email: savedUser.email, role: savedUser.role }
    };
  }

  // --- ฟังก์ชันเดิม (สำหรับคนที่มี ID อยู่แล้วมาสมัครเพิ่ม) ---
  async apply(userId: string, data: any) {
    const userObjectId = new Types.ObjectId(userId);
    const existing = await this.candidateModel.findOne({ userId: userObjectId });
    if (existing) throw new BadRequestException('คุณได้ลงสมัครรับเลือกตั้งไปแล้ว');

    const newCandidate = new this.candidateModel({
      userId: userObjectId,
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

  async updateByUserId(userId: string, updateData: any) {
    const updatedCandidate = await this.candidateModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: updateData },
      { new: true } // คืนค่าข้อมูลตัวที่อัปเดตแล้วกลับมา
    );

    if (!updatedCandidate) {
      throw new NotFoundException('ไม่พบข้อมูลผู้สมัครที่ต้องการแก้ไข');
    }
    return updatedCandidate;
  }
}