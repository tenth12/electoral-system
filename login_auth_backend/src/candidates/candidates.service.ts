import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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

  // 1. ค้นหาข้อมูลส่วนตัวผู้สมัคร
  async findOneByUserId(userId: string) {
    const candidate = await this.candidateModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('userId', 'email')
      .exec();

    if (!candidate) {
      throw new NotFoundException('ไม่พบข้อมูลผู้สมัครสำหรับผู้ใช้งานนี้');
    }
    return candidate;
  }

  // --- สมัครสมาชิกและลงเลือกตั้ง (พร้อมรันเลข 1, 2, 3) ---
  async signupAndApply(data: any) {
    const { email, password, displayName, slogan, bio, imageUrl } = data;

    const normalizedEmail = email.trim().toLowerCase();

    // เช็ค User ซ้ำ
    const existingUser = await this.userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new BadRequestException('Email นี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบเพื่อสมัคร');
    }

    // 🚩 หาหมายเลขผู้สมัครถัดไป (Auto-increment logic)
    const lastCandidate = await this.candidateModel
      .findOne()
      .sort({ candidateNumber: -1 }) // เอาเลขมากที่สุดขึ้นก่อน
      .exec();
    const nextNumber = lastCandidate ? lastCandidate.candidateNumber + 1 : 1;

    const passwordHash = await argon2.hash(password);

    // สร้าง User
    const newUser = new this.userModel({
      email: normalizedEmail,
      passwordHash: passwordHash,
      role: 'candidate',
      refreshTokenHash: null,
    });
    const savedUser = await newUser.save();

    // สร้าง Candidate พร้อมลำดับหมายเลข
    const newCandidate = new this.candidateModel({
      userId: savedUser._id,
      candidateNumber: nextNumber, // เลข 1, 2, 3...
      displayName: displayName,
      slogan: slogan,
      bio: bio || '',
      imageUrl: imageUrl || '',
      appliedAt: new Date(),
    });

    await newCandidate.save();

    return {
      message: 'ลงทะเบียนผู้สมัครสำเร็จแล้ว',
      candidateNumber: nextNumber,
      user: { email: savedUser.email, role: savedUser.role }
    };
  }

  // --- กรณี User เดิมมาสมัครเพิ่ม (พร้อมรันเลข 1, 2, 3) ---
  async apply(userId: string, data: any) {
    const userObjectId = new Types.ObjectId(userId);
    
    const existing = await this.candidateModel.findOne({ userId: userObjectId });
    if (existing) throw new BadRequestException('คุณได้ลงสมัครรับเลือกตั้งไปแล้ว');

    // 🚩 หาหมายเลขผู้สมัครถัดไป
    const lastCandidate = await this.candidateModel.findOne().sort({ candidateNumber: -1 }).exec();
    const nextNumber = lastCandidate ? lastCandidate.candidateNumber + 1 : 1;

    const newCandidate = new this.candidateModel({
      userId: userObjectId,
      candidateNumber: nextNumber,
      displayName: data.displayName,
      slogan: data.slogan,
      bio: data.bio,
      imageUrl: data.imageUrl,
    });

    await this.userModel.findByIdAndUpdate(userId, { role: 'candidate' });
    return await newCandidate.save();
  }

  // ดึงรายชื่อทั้งหมด เรียงตามหมายเลขผู้สมัคร
  async findAll() {
    return this.candidateModel
      .find()
      .populate('userId', 'email')
      .sort({ candidateNumber: 1 }) // เรียง 1, 2, 3...
      .exec();
  }

  // อัปเดตข้อมูล (รวมถึง URL รูปภาพใหม่)
  async updateByUserId(userId: string, updateData: any) {
    // ป้องกันการแก้ candidateNumber และ userId ผ่านฟังก์ชันนี้
    const { candidateNumber, userId: _u, ...safeData } = updateData;

    const updatedCandidate = await this.candidateModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: safeData },
      { new: true }
    );

    if (!updatedCandidate) {
      throw new NotFoundException('ไม่พบข้อมูลผู้สมัครที่ต้องการแก้ไข');
    }
    return updatedCandidate;
  }
}