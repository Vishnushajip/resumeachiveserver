import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface ResumeInput {
  rawText?: string;
  userData?: {
    role?: string;
    experience?: string;
    skills?: string[];
    projects?: any[];
    education?: any[];
  };
  jobDescription?: string;
}

interface AiProvider {
  index: number;
  name: string;
  call: (prompt: string, isJson: boolean) => Promise<any>;
}

const SYSTEM_PROMPT = `You are the world's leading ATS optimization engine.
Transform user data into a high-performance ATS-friendly resume that passes scanners and impresses recruiters.
RULES:
1. Use "Action Verb + Task + Result" for all bullet points.
2. Include quantifiable metrics wherever possible.
3. Use industry-specific keywords only. No generic fluff.
4. When asked for JSON, return ONLY raw valid JSON. No markdown fences, no explanation, no preamble.`;

const client = (timeoutMs = 20000): AxiosInstance =>
  axios.create({ timeout: timeoutMs });

const parseJson = (raw: string): any =>
  JSON.parse(raw.replace(/^```json|^```|```$/gm, '').trim());

@Injectable()
export class AiService {
  private readonly providers: AiProvider[];

  constructor() {
    this.providers = this.loadProvidersFromEnv();
  }

  private loadProvidersFromEnv(): AiProvider[] {
    const providers: AiProvider[] = [];

    for (let i = 1; i <= 20; i++) {
      const entry = process.env[`AI_${i}`];
      if (!entry) continue;

      const colonIdx = entry.indexOf(':');
      if (colonIdx === -1) continue;

      const providerName = entry.substring(0, colonIdx).toLowerCase().trim();
      const apiKey = entry.substring(colonIdx + 1).trim();
      if (!apiKey) continue;

      const provider = this.buildProvider(i, providerName, apiKey);
      if (provider) providers.push(provider);
    }

    if (providers.length === 0) {
      console.warn(
        'No AI providers found. Add AI_1=groq:key, AI_2=gemini:key etc. to .env',
      );
    }

    return providers;
  }

  private buildProvider(
    index: number,
    name: string,
    key: string,
  ): AiProvider | null {
    switch (name) {
      case 'groq':
        return {
          index,
          name: 'Groq',
          call: async (prompt, isJson) => {
            const res = await client(15000).post(
              'https://api.groq.com/openai/v1/chat/completions',
              {
                model: 'llama-3.3-70b-versatile',
                messages: [
                  { role: 'system', content: SYSTEM_PROMPT },
                  { role: 'user', content: prompt },
                ],
                temperature: 0.4,
                max_tokens: 4096,
                ...(isJson && { response_format: { type: 'json_object' } }),
              },
              {
                headers: {
                  Authorization: `Bearer ${key}`,
                  'Content-Type': 'application/json',
                },
              },
            );
            const raw = res.data?.choices?.[0]?.message?.content;
            if (!raw) throw new Error('Empty Groq response');
            return isJson ? parseJson(raw) : raw;
          },
        };

      case 'gemini':
        return {
          index,
          name: 'Gemini',
          call: async (prompt, isJson) => {
            const res = await client(20000).post(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
              {
                contents: [
                  { parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] },
                ],
                generationConfig: {
                  temperature: 0.4,
                  maxOutputTokens: 4096,
                  ...(isJson && { responseMimeType: 'application/json' }),
                },
              },
            );
            const raw = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!raw) throw new Error('Empty Gemini response');
            return isJson ? parseJson(raw) : raw;
          },
        };

      case 'openrouter':
        return {
          index,
          name: 'OpenRouter',
          call: async (prompt, isJson) => {
            const res = await client(25000).post(
              'https://openrouter.ai/api/v1/chat/completions',
              {
                model: 'meta-llama/llama-3.3-70b-instruct',
                messages: [
                  { role: 'system', content: SYSTEM_PROMPT },
                  { role: 'user', content: prompt },
                ],
                temperature: 0.4,
                max_tokens: 4096,
                ...(isJson && { response_format: { type: 'json_object' } }),
              },
              {
                headers: {
                  Authorization: `Bearer ${key}`,
                  'Content-Type': 'application/json',
                  'HTTP-Referer':
                    process.env.APP_URL ?? 'http://localhost:3000',
                },
              },
            );
            const raw = res.data?.choices?.[0]?.message?.content;
            if (!raw) throw new Error('Empty OpenRouter response');
            return isJson ? parseJson(raw) : raw;
          },
        };

      case 'github_llama':
        return {
          index,
          name: 'GitHub-Llama',
          call: async (prompt, isJson) => {
            const res = await client(25000).post(
              'https://models.inference.ai.azure.com/chat/completions',
              {
                model: 'meta-llama-3.3-70b-instruct',
                messages: [
                  { role: 'system', content: SYSTEM_PROMPT },
                  { role: 'user', content: prompt },
                ],
                temperature: 0.4,
                max_tokens: 4096,
                ...(isJson && { response_format: { type: 'json_object' } }),
              },
              {
                headers: {
                  Authorization: `Bearer ${key}`,
                  'Content-Type': 'application/json',
                },
              },
            );
            const raw = res.data?.choices?.[0]?.message?.content;
            if (!raw) throw new Error('Empty GitHub-Llama response');
            return isJson ? parseJson(raw) : raw;
          },
        };

      case 'github_deepseek':
        return {
          index,
          name: 'GitHub-DeepSeek',
          call: async (prompt, isJson) => {
            const res = await client(25000).post(
              'https://models.inference.ai.azure.com/chat/completions',
              {
                model: 'DeepSeek-V3',
                messages: [
                  { role: 'system', content: SYSTEM_PROMPT },
                  { role: 'user', content: prompt },
                ],
                temperature: 0.4,
                max_tokens: 4096,
                ...(isJson && { response_format: { type: 'json_object' } }),
              },
              {
                headers: {
                  Authorization: `Bearer ${key}`,
                  'Content-Type': 'application/json',
                },
              },
            );
            const raw = res.data?.choices?.[0]?.message?.content;
            if (!raw) throw new Error('Empty GitHub-DeepSeek response');
            return isJson ? parseJson(raw) : raw;
          },
        };

      case 'github_chatgpt':
        return {
          index,
          name: 'GitHub-ChatGPT',
          call: async (prompt, isJson) => {
            const res = await client(25000).post(
              'https://models.inference.ai.azure.com/chat/completions',
              {
                model: 'gpt-4o',
                messages: [
                  { role: 'system', content: SYSTEM_PROMPT },
                  { role: 'user', content: prompt },
                ],
                temperature: 0.4,
                max_tokens: 4096,
                ...(isJson && { response_format: { type: 'json_object' } }),
              },
              {
                headers: {
                  Authorization: `Bearer ${key}`,
                  'Content-Type': 'application/json',
                },
              },
            );
            const raw = res.data?.choices?.[0]?.message?.content;
            if (!raw) throw new Error('Empty GitHub-ChatGPT response');
            return isJson ? parseJson(raw) : raw;
          },
        };

      case 'huggingface':
        return {
          index,
          name: 'HuggingFace',
          call: async (prompt, isJson) => {
            const res = await client(40000).post(
              'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1/v1/chat/completions',
              {
                model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                messages: [
                  { role: 'system', content: SYSTEM_PROMPT },
                  {
                    role: 'user',
                    content: isJson
                      ? `${prompt}\n\nReturn ONLY raw JSON. No markdown.`
                      : prompt,
                  },
                ],
                temperature: 0.4,
                max_tokens: 4096,
              },
              {
                headers: {
                  Authorization: `Bearer ${key}`,
                  'Content-Type': 'application/json',
                },
              },
            );
            const raw = res.data?.choices?.[0]?.message?.content;
            if (!raw) throw new Error('Empty HuggingFace response');
            return isJson ? parseJson(raw) : raw;
          },
        };

      default:
        console.warn(
          `Unknown AI provider name: "${name}" at AI_${index}. Skipping.`,
        );
        return null;
    }
  }

  private async callAi(prompt: string, isJson = true): Promise<any> {
    if (this.providers.length === 0) {
      throw new InternalServerErrorException('No AI providers configured');
    }

    const errors: string[] = [];

    for (const provider of this.providers) {
      try {
        const result = await provider.call(prompt, isJson);
        return result;
      } catch (err: any) {
        const msg =
          err?.response?.data?.error?.message ??
          err?.message ??
          'Unknown error';
        errors.push(`[${provider.index}:${provider.name}]: ${msg}`);
        console.warn(
          `AI provider [${provider.index}] ${provider.name} failed: ${msg}`,
        );
      }
    }

    console.error('All AI providers exhausted:', errors);
    throw new InternalServerErrorException(
      `All AI providers failed. Errors: ${errors.join(' | ')}`,
    );
  }

  async generateAtsResume(input: ResumeInput): Promise<any> {
    const prompt = `Generate a complete production-ready ATS-friendly resume.

${input.rawText ? `RAW CV TEXT: "${input.rawText}"` : ''}
${input.userData ? `USER DATA: ${JSON.stringify(input.userData)}` : ''}
${input.jobDescription ? `JOB DESCRIPTION: "${input.jobDescription}"` : ''}

Return this exact JSON structure:
{
  "resume": {
    "summary": "Impactful 3-4 line professional summary",
    "experience": [{ "company": "", "role": "", "duration": "", "points": ["point 1", "point 2"] }],
    "skills": { "technical": [], "soft": [] },
    "projects": [{ "name": "", "points": [] }],
    "education": [{ "institution": "", "degree": "", "year": "" }]
  },
  "atsScore": 85,
  "optimizationTips": ["tip 1", "tip 2"],
  "missingKeywords": ["keyword1", "keyword2"]
}`;

    return this.callAi(prompt);
  }

  async refineSection(sectionName: string, content: string): Promise<any> {
    const prompt = `Refine this ${sectionName} section to be perfectly ATS-optimized.
Content: "${content}"
Return JSON: { "refinedContent": "..." }`;

    return this.callAi(prompt);
  }

  async generateCareerPack(input: ResumeInput): Promise<any> {
    const prompt = `Generate a career success pack based on this resume and job description.
Resume: ${JSON.stringify(input.userData ?? input.rawText)}
Job: "${input.jobDescription}"

Return JSON:
{
  "coverLetter": "Compelling personalized cover letter",
  "interviewTips": ["tip 1", "tip 2"],
  "valueProposition": "1-sentence elevator pitch"
}`;

    return this.callAi(prompt);
  }
}
