import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { Vote, VoteSchema } from './schemas/vote.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Vote.name, schema: VoteSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [VotesController],
    providers: [VotesService],
})
export class VotesModule {}
