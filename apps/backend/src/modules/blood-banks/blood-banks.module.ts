import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { BloodBanksController } from './blood-banks.controller';
import { BloodBanksService } from './blood-banks.service';

@Module({
  imports: [NotificationsModule],
  controllers: [BloodBanksController],
  providers: [BloodBanksService],
  exports: [BloodBanksService],
})
export class BloodBanksModule {}
