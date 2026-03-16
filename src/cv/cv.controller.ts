import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  Req,
  BadRequestException,
} from '@nestjs/common';

import type { Request } from 'express';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  create(@Body() createCvDto: CreateCvDto, @Req() req: Request) {
    const user = (req as any)['user'] as { email: string };
    if (!user?.email)
      throw new BadRequestException('User email not found in token');
    return this.cvService.create(user.email, createCvDto);
  }

  @Get()
  findAll(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const user = (req as any)['user'] as { email: string };
    if (!user?.email)
      throw new BadRequestException('User email not found in token');
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.cvService.findAllByUser(user.email, pageNum, limitNum);
  }

  @Get(':id/download')
  getDownloadUrl(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any)['user'] as { email: string };
    if (!user?.email)
      throw new BadRequestException('User email not found in token');
    return this.cvService.getDownloadUrl(id, user.email);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any)['user'] as { email: string };
    if (!user?.email)
      throw new BadRequestException('User email not found in token');
    return this.cvService.findOne(id, user.email);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    const user = (req as any)['user'] as { email: string };
    if (!user?.email)
      throw new BadRequestException('User email not found in token');
    return this.cvService.update(id, user.email, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any)['user'] as { email: string };
    if (!user?.email)
      throw new BadRequestException('User email not found in token');
    return this.cvService.remove(id, user.email);
  }
}
