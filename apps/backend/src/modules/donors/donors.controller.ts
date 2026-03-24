import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';
import { DonorsService } from './donors.service';

@ApiTags('donors')
@Controller('donors')
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create donor' })
  create(@Body() createDonorDto: CreateDonorDto) {
    return this.donorsService.create(createDonorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all donors' })
  findAll() {
    return this.donorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get donor by id' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.donorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update donor' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDonorDto: UpdateDonorDto,
  ) {
    return this.donorsService.update(id, updateDonorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete donor' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.donorsService.remove(id);
  }
}
