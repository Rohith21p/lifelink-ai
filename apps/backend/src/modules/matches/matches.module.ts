import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { MatchesController } from './matches.controller';
import { MatchingEngineService } from './matching-engine.service';
import { MatchesService } from './matches.service';

@Module({
  imports: [NotificationsModule],
  controllers: [MatchesController],
  providers: [MatchesService, MatchingEngineService],
})
export class MatchesModule {}
