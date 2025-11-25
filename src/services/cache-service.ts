import fs from 'fs';
import path from 'path';
import os from 'os';

export class CacheService {
  private cachePath: string;
  private cache: Record<string, string>;

  constructor() {
    const configDir = path.join(os.homedir(), '.config', 'auto-i18n-cli');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    this.cachePath = path.join(configDir, 'cache.json');
    this.cache = this.load();
  }

  private load(): Record<string, string> {
    if (fs.existsSync(this.cachePath)) {
      try {
        return JSON.parse(fs.readFileSync(this.cachePath, 'utf-8'));
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  private save(): void {
    fs.writeFileSync(this.cachePath, JSON.stringify(this.cache, null, 2));
  }

  get(key: string, lang: string): string | undefined {
    return this.cache[`${lang}.${key}`];
  }

  set(key: string, lang: string, value: string): void {
    this.cache[`${lang}.${key}`] = value;
    this.save();
  }

  has(key: string, lang: string): boolean {
    return `${lang}.${key}` in this.cache;
  }
}
