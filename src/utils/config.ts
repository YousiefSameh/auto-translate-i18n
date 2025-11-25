import fs from 'fs';
import path from 'path';

export interface Config {
  localesDir: string;
  sourceLang: string;
  targetLangs: string[];
  openaiApiKey?: string;
  include: string[];
  exclude: string[];
}

const defaultConfig: Config = {
  localesDir: './locales',
  sourceLang: 'en',
  targetLangs: [],
  include: ['**/*.{js,jsx,ts,tsx}'],
  exclude: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
};

export function loadConfig(): Config {
  const configPath = path.resolve(process.cwd(), 'auto-i18n.config.json');
  if (fs.existsSync(configPath)) {
    const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return { ...defaultConfig, ...userConfig };
  }
  return defaultConfig;
}
