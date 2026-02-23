import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type CandidateDocument = HydratedDocument<Candidate>;

@Schema({ timestamps: true })
export class Candidate {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId | User;

  @Prop({ required: true, unique: true, index: true })
  candidateNumber: number;

  @Prop({ required: true, trim: true })
  displayName: string;

  @Prop({ required: true })
  slogan: string;

  @Prop({ default: '' })
  imageUrl?: string;

  @Prop({ default: Date.now })
  appliedAt: Date;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);