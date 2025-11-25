import glob from 'fast-glob';
import path from 'path';

export class Scanner {
  private patterns: string[];
  private ignore: string[];

  constructor(
    patterns: string[] = ['**/*.{js,jsx,ts,tsx}'],
    ignore: string[] = ['**/node_modules/**', '**/.next/**', '**/dist/**'],
  ) {
    this.patterns = patterns;
    this.ignore = ignore;
  }

  async scan(cwd: string = process.cwd()): Promise<string[]> {
    const files = await glob(this.patterns, {
      cwd,
      ignore: this.ignore,
      absolute: true,
    });
    return files;
  }
}
