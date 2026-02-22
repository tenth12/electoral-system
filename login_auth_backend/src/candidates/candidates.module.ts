import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { Candidate, CandidateSchema } from './schemas/candidates.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: User.name, schema: UserSchema }, // ต้องใส่เพื่อให้ InjectModel(User.name) ทำงานได้
    ]),
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService],
  exports: [CandidatesService],
})
export class CandidatesModule {}