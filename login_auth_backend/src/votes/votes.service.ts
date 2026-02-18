import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vote, VoteDocument } from './schemas/vote.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class VotesService {
    constructor(
        @InjectModel(Vote.name) private voteModel: Model<VoteDocument>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) {}

    async vote(voterId: string, candidateId: string) {
        // Check if candidate exists and is effectively a candidate
        const candidate = await this.userModel.findById(candidateId);
        if (!candidate || candidate.role !== 'candidate') {
            throw new BadRequestException('Invalid candidate');
        }

        // Check if user has already voted
        const existingVote = await this.voteModel.findOne({ voter: voterId } as any);
        if (existingVote) {
             throw new BadRequestException('You have already voted');
        }

        const newVote = new this.voteModel({
            voter: voterId,
            candidate: candidateId,
        });

        return newVote.save();
    }

    async getSummary() {
        return this.voteModel.aggregate([
            {
                $group: {
                    _id: '$candidate',
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'candidateInfo',
                },
            },
            {
                $unwind: '$candidateInfo',
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    'candidateInfo.email': 1,
                    'candidateInfo.role': 1,
                },
            },
        ]);
    }
}
