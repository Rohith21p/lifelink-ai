import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpsertBloodStockDto } from './dto/upsert-blood-stock.dto';
import { BloodBanksService } from './blood-banks.service';

@ApiTags('blood-banks')
@Controller('blood-banks')
export class BloodBanksController {
  constructor(private readonly bloodBanksService: BloodBanksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all blood banks' })
  getAllBloodBanks() {
    return this.bloodBanksService.getAllBloodBanks();
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get blood inventory' })
  getBloodInventory(@Query('bloodBankId') bloodBankId?: string) {
    return this.bloodBanksService.getBloodInventory(bloodBankId);
  }

  @Post('inventory')
  @ApiOperation({ summary: 'Create or update blood stock' })
  upsertBloodStock(@Body() upsertBloodStockDto: UpsertBloodStockDto) {
    return this.bloodBanksService.upsertBloodStock(upsertBloodStockDto);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get blood requests' })
  getBloodRequests(
    @Query('bloodBankId') bloodBankId?: string,
    @Query('status') status?: string,
  ) {
    return this.bloodBanksService.getBloodRequests(bloodBankId, status);
  }

  @Get('low-stock-alerts')
  @ApiOperation({ summary: 'Get low blood stock alerts' })
  getLowStockAlerts() {
    return this.bloodBanksService.getLowStockAlerts();
  }

  @Get('recent-stock-activity')
  @ApiOperation({ summary: 'Get recent blood stock updates' })
  getRecentStockActivity() {
    return this.bloodBanksService.getRecentStockActivity();
  }
}
