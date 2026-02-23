import { Controller, Get, Patch, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Get('voting')
    async getVotingStatus() {
        const isVotingEnabled = await this.settingsService.getVotingStatus();
        return { isVotingEnabled };
    }

    @Patch('voting')
    @UseGuards(AccessTokenGuard)
    async setVotingStatus(@Req() req, @Body('isVotingEnabled') isVotingEnabled: boolean) {
        if (req.user.role !== 'admin') {
             throw new ForbiddenException('Admin only');
        }
        const updatedSetting = await this.settingsService.setVotingStatus(isVotingEnabled);
        return { message: 'Voting status updated', isVotingEnabled: updatedSetting.value };
    }
}
