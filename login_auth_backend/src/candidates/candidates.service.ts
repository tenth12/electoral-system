import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Candidate, CandidateDocument } from './schemas/candidates.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import * as argon2 from 'argon2';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectModel(Candidate.name) private candidateModel: Model<CandidateDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private settingsService: SettingsService,
  ) { }

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

  async signupAndApply(data: any) {
    const isVotingEnabled = await this.settingsService.getVotingStatus();
    if (!isVotingEnabled) {
      throw new ForbiddenException('ระบบปิดรับสมัครแล้ว');
    }

    const { email, password, displayName, slogan, imageUrl } = data;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await this.userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new BadRequestException('Email นี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบเพื่อสมัคร');
    }

    const lastCandidate = await this.candidateModel
      .findOne()
      .sort({ candidateNumber: -1 })
      .exec();
    const nextNumber = lastCandidate ? lastCandidate.candidateNumber + 1 : 1;

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
      candidateNumber: nextNumber,
      displayName: displayName,
      slogan: slogan,
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

  async apply(userId: string, data: any) {
    const isVotingEnabled = await this.settingsService.getVotingStatus();
    if (!isVotingEnabled) {
      throw new ForbiddenException('ระบบปิดรับสมัครแล้ว');
    }

    const userObjectId = new Types.ObjectId(userId);

    const existing = await this.candidateModel.findOne({ userId: userObjectId });
    if (existing) throw new BadRequestException('คุณได้ลงสมัครรับเลือกตั้งไปแล้ว');

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

  async findAll() {
    return this.candidateModel
      .find()
      .populate('userId', 'email')
      .sort({ candidateNumber: 1 })
      .exec();
  }

  async updateByUserId(userId: string, updateData: any) {
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