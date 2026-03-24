import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMatchDto } from './dto/create-match.dto';
import { CreateMatchReviewDto } from './dto/create-match-review.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';
import { MatchesService } from './matches.service';
import { MatchStatus } from '../../common/enums';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all donor-patient matches' })
  findAll(@Query('status') status?: MatchStatus) {
    return this.matchesService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get match by id' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.matchesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create match with score breakdown' })
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update match and recalculate scoring' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateMatchDto: UpdateMatchDto,
  ) {
    return this.matchesService.update(id, updateMatchDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update match status' })
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateMatchStatusDto: UpdateMatchStatusDto,
  ) {
    return this.matchesService.updateStatus(id, updateMatchStatusDto);
  }

  @Post(':id/reviews')
  @ApiOperation({ summary: 'Add match review action and review note' })
  addReview(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() createMatchReviewDto: CreateMatchReviewDto,
  ) {
    return this.matchesService.addReview(id, createMatchReviewDto);
  }

  @Get(':id/score-breakdown')
  @ApiOperation({ summary: 'Get score breakdown for a match' })
  getScoreBreakdown(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.matchesService.getScoreBreakdown(id);
  }
}
