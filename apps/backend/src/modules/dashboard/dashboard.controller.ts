import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary stats' })
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('recent-activities')
  @ApiOperation({ summary: 'Get recent activities' })
  getRecentActivities() {
    return this.dashboardService.getRecentActivities();
  }

  @Get('recent-match-activity')
  @ApiOperation({ summary: 'Get recent match activity' })
  getRecentMatchActivity() {
    return this.dashboardService.getRecentMatchActivity();
  }

  @Get('low-stock-alerts')
  @ApiOperation({ summary: 'Get low blood stock alerts' })
  getLowStockAlerts() {
    return this.dashboardService.getLowStockAlerts();
  }

  @Get('recent-notifications')
  @ApiOperation({ summary: 'Get recent notifications' })
  getRecentNotifications() {
    return this.dashboardService.getRecentNotifications();
  }
}
