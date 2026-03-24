import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { PatientsModule } from './modules/patients/patients.module';
import { DonorsModule } from './modules/donors/donors.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MatchesModule } from './modules/matches/matches.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { BloodBanksModule } from './modules/blood-banks/blood-banks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    PrismaModule,
    PatientsModule,
    DonorsModule,
    DashboardModule,
    MatchesModule,
    NotificationsModule,
    ReportsModule,
    BloodBanksModule,
  ],
})
export class AppModule {}
