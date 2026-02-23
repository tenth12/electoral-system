import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from './schemas/setting.schema';

@Injectable()
export class SettingsService implements OnModuleInit {
    constructor(
        @InjectModel(Setting.name) private settingModel: Model<SettingDocument>
    ) {}

    async onModuleInit() {
        // Ensure the voting toggle exists with a default 'true' value
        const exists = await this.settingModel.findOne({ key: 'isVotingEnabled' });
        if (!exists) {
            await this.settingModel.create({
                key: 'isVotingEnabled',
                value: true
            });
            console.log('Initialized default setting: isVotingEnabled = true');
        }
    }

    async getVotingStatus(): Promise<boolean> {
        const setting = await this.settingModel.findOne({ key: 'isVotingEnabled' });
        return setting ? setting.value : false;
    }

    async setVotingStatus(value: boolean): Promise<Setting> {
        return this.settingModel.findOneAndUpdate(
            { key: 'isVotingEnabled' },
            { $set: { value } },
            { new: true, upsert: true }
        ).exec();
    }
}
