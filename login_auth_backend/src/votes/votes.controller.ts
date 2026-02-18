import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

@Controller('votes')
export class VotesController {
    constructor(private votesService: VotesService) {}

    // POST /votes
    // Function: Cast a vote
    // Body: { candidateId: string }
    @UseGuards(AccessTokenGuard)
    @Post()
    async castVote(@Req() req, @Body('candidateId') candidateId: string) {
        const userId = req.user.sub; // AccessTokenGuard usually attaches user payload to req.user
        return this.votesService.vote(userId, candidateId);
    }

    // GET /votes/summary
    // Function: Get vote summary (for admin and maybe public results?)
    // For now, let's keep it protected or public depending on requirements. 
    // Allowing public for now to see results easily, or just admin.
    // The prompt says "admin can see scores", so let's protect it or leave it open? 
    // Let's protect it with AccessTokenGuard for now.
    @UseGuards(AccessTokenGuard) 
    @Get('summary')
    async getSummary() {
        return this.votesService.getSummary();
    }
}
