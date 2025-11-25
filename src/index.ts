import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { version } from '../package.json';
import { Scanner } from './core/scanner';
import { Extractor } from './core/extractor';
import { Injector } from './core/injector';
import { AIService } from './services/ai-service';
import { loadConfig } from './utils/config';
import { SHARED_OPENAI_KEY } from './utils/constants';

const program = new Command();
const config = loadConfig();

program
  .name('auto-i18n')
  .description('Auto-i18n CLI — Zero-Effort Localization for React/Next.js')
  .version(version);

program
  .command('extract')
  .description('Extract static text from components')
  .action(async () => {
    const spinner = ora('Scanning files...').start();
    try {
      const scanner = new Scanner(config.include, config.exclude);
      const files = await scanner.scan();
      spinner.succeed(`Found ${files.length} files.`);

      spinner.start('Extracting text...');
      const extractor = new Extractor();
      const extracted = extractor.extract(files);
      spinner.succeed(`Extracted ${extracted.length} strings.`);

      // Generate Base JSON
      const baseJson: Record<string, string> = {};
      extracted.forEach((item) => {
        baseJson[item.key] = item.value;
      });

      if (!fs.existsSync(config.localesDir)) {
        fs.mkdirSync(config.localesDir, { recursive: true });
      }

      const filePath = path.join(config.localesDir, `${config.sourceLang}.json`);
      fs.writeFileSync(filePath, JSON.stringify(baseJson, null, 2));
      console.log(chalk.green(`\nSaved base locale to ${filePath}`));
    } catch (error) {
      spinner.fail('Extraction failed.');
      console.error(error);
    }
  });

program
  .command('translate')
  .description('Translate extracted keys using AI')
  .option('-l, --lang <lang>', 'Target language code')
  .option('-k, --key <key>', 'OpenAI API Key (overrides env var and config)')
  .action(async (options) => {
    const targetLang = options.lang;
    if (!targetLang && config.targetLangs.length === 0) {
      console.error(chalk.red('Please specify a target language with -l or in config.'));
      return;
    }

    const langsToProcess = targetLang ? [targetLang] : config.targetLangs;
    let apiKey = options.key || process.env.OPENAI_API_KEY || config.openaiApiKey;

    if (!apiKey) {
      if (SHARED_OPENAI_KEY) {
        apiKey = SHARED_OPENAI_KEY;
        console.log(
          chalk.yellow(
            '\n⚠️  Using shared API key. Rate limits may apply.\n   To avoid errors, provide your own key with -k or OPENAI_API_KEY.\n',
          ),
        );
      } else {
        console.error(chalk.red('OPENAI_API_KEY is missing. Please provide it via -k or env var.'));
        return;
      }
    }

    const aiService = new AIService(apiKey);
    const sourcePath = path.join(config.localesDir, `${config.sourceLang}.json`);

    if (!fs.existsSync(sourcePath)) {
      console.error(chalk.red(`Source file not found at ${sourcePath}. Run 'extract' first.`));
      return;
    }

    const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));

    for (const lang of langsToProcess) {
      const spinner = ora(`Translating to ${lang}...`).start();
      try {
        const translated = await aiService.translate(sourceData, lang);
        const outPath = path.join(config.localesDir, `${lang}.json`);
        fs.writeFileSync(outPath, JSON.stringify(translated, null, 2));
        spinner.succeed(`Translated to ${lang} saved to ${outPath}`);
      } catch (error) {
        spinner.fail(`Translation to ${lang} failed.`);
        console.error(error);
      }
    }
  });

program
  .command('inject')
  .description('Inject translation keys back into components')
  .action(async () => {
    const spinner = ora('Scanning files...').start();
    try {
      const scanner = new Scanner(config.include, config.exclude);
      const files = await scanner.scan();
      spinner.succeed(`Found ${files.length} files.`);

      spinner.start('Injecting translations...');
      const injector = new Injector();
      await injector.inject(files);
      spinner.succeed('Injection complete.');
    } catch (error) {
      spinner.fail('Injection failed.');
      console.error(error);
    }
  });

program.parse(process.argv);
