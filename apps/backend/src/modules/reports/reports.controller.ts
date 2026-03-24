import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadReportDto } from './dto/upload-report.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload report metadata and attach report to patient' })
  uploadMetadata(@Body() uploadReportDto: UploadReportDto) {
    return this.reportsService.uploadMetadata(uploadReportDto);
  }

  @Get()
  @ApiOperation({ summary: 'List uploaded reports' })
  listReports(@Query('patientId') patientId?: string) {
    return this.reportsService.list(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by id' })
  getReportById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.reportsService.findOne(id);
  }

  @Get(':id/extraction')
  @ApiOperation({ summary: 'Get extraction summary for a report' })
  getExtractionSummary(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.reportsService.getExtractionSummary(id);
  }

  @Post(':id/extract')
  @ApiOperation({ summary: 'Trigger mock report extraction' })
  triggerMockExtraction(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.reportsService.triggerMockExtraction(id);
  }
}
