import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import type { ResumeInput } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * THE MAIN API: Generates a complete ATS-optimized resume.
   * Input: { rawText?: string, userData?: object, jobDescription?: string }
   */
  @Post('generate')
  async generate(@Body() input: ResumeInput) {
    const result = await this.aiService.generateAtsResume(input);
    return result;
  }

  /**
   * SECTION REFINE: Optimizes a single section (e.g. just the Summary or one Job).
   */
  @Post('refine')
  async refine(@Body('section') section: string, @Body('content') content: string) {
    const refined = await this.aiService.refineSection(section, content);
    return refined;
  }

  /**
   * CAREER ACCELERATOR: Tailored Cover Letter + Interview Prep.
   */
  @Post('success-pack')
  async successPack(@Body() input: ResumeInput) {
    const pack = await this.aiService.generateCareerPack(input);
    return pack;
  }
}
