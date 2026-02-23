import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type CandidateDocument = HydratedDocument<Candidate>;

@Schema({ timestamps: true })
export class Candidate {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId | User;

  // เพิ่ม candidateNumber สำหรับรันเลข 1, 2, 3
  // index: true ช่วยให้ค้นหา/เรียงลำดับได้เร็วขึ้น
  @Prop({ required: true, unique: true, index: true })
  candidateNumber: number;

  @Prop({ required: true, trim: true })
  displayName: string;

  @Prop({ required: true })
  slogan: string;

  @Prop()
  bio?: string;

  // ส่วนของ Image URL (รองรับ String path ของรูปภาพ)
  @Prop({ default: '' })
  imageUrl?: string;

  @Prop({ default: Date.now })
  appliedAt: Date;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);