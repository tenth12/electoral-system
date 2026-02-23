import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    findByEmail(email: string) {
        return this.userModel.findOne({ email }).exec();
    }

    findByEmailWithSecrets(email: string) {
        return this.userModel.findOne({ email }).select('+passwordHash +refreshTokenHash').exec();
    }

    // ใช้ตอน refresh: ต้องดึง refreshTokenHash
    findByIdWithRefresh(userId: string) {
        return this.userModel.findById(userId).select('+refreshTokenHash').exec();
    }

    // สร้างผู้ใช้ใหม่ โดยกำหนด role ได้
    create(data: { email: string; passwordHash: string; role?: UserRole }) {
        return this.userModel.create({
            email: data.email,
            passwordHash: data.passwordHash,
            role: data.role ?? 'user',
        });
    }

    // อัพเดท refreshTokenHash
    setRefreshTokenHash(userId: string, refreshTokenHash: string | null) {
        return this.userModel.updateOne({ _id: userId }, { refreshTokenHash }).exec();
    }

    // อัพเดทบทบาทผู้ใช้
    setRole(userId: string, role: UserRole) {
        return this.userModel.updateOne({ _id: userId }, { role }).exec();
    }

    // [New] Get all users (with optional role filter)
    findAll(role?: UserRole) {
        const filter = role ? { role } : {};
        return this.userModel.find(filter).exec();
    }

    // [New] Get user by ID (basic info)
    findById(userId: string) {
        return this.userModel.findById(userId).exec();
    }
    // [New] Update user
    update(userId: string, data: Partial<User>) {
        return this.userModel.findByIdAndUpdate(userId, data, { new: true }).exec();
    }

    // [New] Delete user
    remove(userId: string) {
        return this.userModel.findByIdAndDelete(userId).exec();
    }
}
