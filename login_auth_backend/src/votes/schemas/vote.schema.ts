import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type VoteDocument = HydratedDocument<Vote>;

@Schema({ timestamps: true })
export class Vote {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    voter: User;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    candidate: User;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
