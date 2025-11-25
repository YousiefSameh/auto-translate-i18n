import OpenAI from 'openai';
import { CacheService } from './cache-service';
import chalk from 'chalk';

export class AIService {
  private openai: OpenAI;
  private cache: CacheService;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey, baseURL: 'https://models.github.ai/inference' });
    this.cache = new CacheService();
  }

  async translate(
    textMap: Record<string, string>,
    targetLang: string,
  ): Promise<Record<string, string>> {
    const toTranslate: Record<string, string> = {};
    const results: Record<string, string> = {};

    // 1. Check cache
    for (const [key, text] of Object.entries(textMap)) {
      const cached = this.cache.get(text, targetLang); // Cache by text content, not key (to reuse translations)
      if (cached) {
        results[key] = cached;
      } else {
        toTranslate[key] = text;
      }
    }

    if (Object.keys(toTranslate).length === 0) {
      return results;
    }

    console.log(
      chalk.yellow(`Translating ${Object.keys(toTranslate).length} keys to ${targetLang}...`),
    );

    // 2. Call OpenAI
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following JSON object values to ${targetLang}. Keep keys exactly the same. Return ONLY valid JSON.`,
          },
          {
            role: 'user',
            content: JSON.stringify(toTranslate),
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error('No content from OpenAI');

      const translated = JSON.parse(content);

      // 3. Update cache and results
      for (const [key, value] of Object.entries(translated)) {
        results[key] = value as string;
        this.cache.set(toTranslate[key], targetLang, value as string);
      }
    } catch (error) {
      console.error(chalk.red('Translation failed:'), error);
      throw error;
    }

    return results;
  }
}
