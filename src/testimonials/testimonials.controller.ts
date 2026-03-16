import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Public()
  @Post()
  create(@Body() createTestimonialDto: CreateTestimonialDto) {
    return this.testimonialsService.create(createTestimonialDto);
  }

  @Public()
  @Get()
  findAllApproved(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.testimonialsService.findAllApproved(pageNum, limitNum);
  }

  @Get('all')
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.testimonialsService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testimonialsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTestimonialDto: UpdateTestimonialDto,
  ) {
    return this.testimonialsService.update(id, updateTestimonialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.testimonialsService.approve(id);
  }
}
