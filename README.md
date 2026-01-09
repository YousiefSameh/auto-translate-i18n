# Auto-i18n CLI 🚀

[![npm version](https://img.shields.io/npm/v/auto-i18n.svg)](https://www.npmjs.com/package/auto-i18n)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Zero-Effort Localization for React & Next.js.**

Auto-i18n automates the tedious parts of internationalization. It scans your code, extracts text, translates it using AI (OpenAI), and rewrites your components to use `i18next` hooks—all with a single CLI.

---

## 🌟 Features

- **AST-Based Extraction**: Safely parses your code using `ts-morph` to find static text in JSX and specific attributes (e.g., `placeholder`, `title`).
- **Semantic Key Generation**: Automatically creates meaningful keys based on component names and content (e.g., `Header_WelcomeMessage` instead of `key_1`).
- **AI-Powered Translation**: Uses OpenAI's GPT models to generate high-quality, context-aware translations for multiple languages at once.
- **Smart Injection**: Automatically refactors your code to import `useTranslation` and replace text with `t()` calls.
- **Incremental Processing**: Caches translations to avoid re-translating unchanged strings, saving you time and API costs.
- **Configurable**: Customize source/target languages, file patterns, and ignored paths.

---

## 📦 Installation

You can use it directly with `npx` or install it globally/locally.

### Global Installation

```bash
npm install -g auto-i18n
```

### Local Dev Dependency (Recommended)

```bash
npm install --save-dev auto-i18n
```

---

## 🚀 Quick Start

### 1. Initialize Configuration

Create a `auto-i18n.config.json` file in your project root:
```json
{
  "localesDir": "./public/locales",
  "sourceLang": "en",
  "targetLangs": ["es", "fr", "de", "ja"],
  "include": ["src/**/*.{tsx,jsx}"],
  "exclude": ["**/node_modules/**", "**/.next/**"],
  "openaiApiKey": "ghp_your_github_token_here" // Optional
}
```

> **Note**: You can also set the API key via the `OPENAI_API_KEY` environment variable or the `--key` CLI flag.

### 2. Extract Text

Scan your project for translatable strings. This creates your source language file (e.g., `en.json`).

```bash
auto-i18n extract
```

### 3. Translate with AI

Generate translations for your target languages. You'll need an OpenAI API key.

```bash
export OPENAI_API_KEY=sk-your-api-key
auto-i18n translate
```

### 4. Inject Code

Rewrite your components to use the translations.

```bash
auto-i18n inject
```

---

## 📖 Command Reference

### `extract`

Scans your source files and populates the `sourceLang` JSON file.

- **What it finds**:
  - Text inside JSX tags: `<div>Hello World</div>`
  - Text in specific attributes: `placeholder`, `title`, `alt`, `label`, `aria-label`.
- **Output**: Creates or updates `localesDir/sourceLang.json`.

### `translate`

Uses OpenAI to translate missing keys in your target language files.

- **Usage**: `auto-i18n translate [options]`
- **Options**:
  - `-l, --lang <code >`: Translate only a specific language (e.g., `-l es`).
  - `-k, --key <key>`: Provide your OpenAI API key directly (overrides env var).
- **Environment Variable**: Requires `OPENAI_API_KEY` to be set (or passed via `-k`).
- **Supported Keys**:
  - Standard OpenAI keys (`sk-...`) -> Uses `gpt-4o`.
  - GitHub Model keys -> Uses `openai/gpt-4o` via GitHub Models.
- **Fallback**: If no key is provided, the tool uses a shared community key (subject to strict rate limits). **Use your own key for production.**

### `inject`

Modifies your source code to implement localization.

- **What it does**:
  - Adds `import { useTranslation } from 'react-i18next';`
  - Inserts `const { t } = useTranslation();` inside the component.
  - Replaces text with `{t('Key_Name')}`.

---

## ⚙️ Configuration

| Option         | Type       | Default                       | Description                                        |
| -------------- | ---------- | ----------------------------- | -------------------------------------------------- |
| `localesDir`   | `string`   | `./locales`                   | Directory where JSON translation files are stored. |
| `sourceLang`   | `string`   | `en`                          | The primary language of your source code.          |
| `targetLangs`  | `string[]` | `[]`                          | List of languages to translate into.               |
| `include`      | `string[]` | `['**/*.{js,jsx,ts,tsx}']`    | Glob patterns for files to scan.                   |
| `exclude`      | `string[]` | `['**/node_modules/**', ...]` | Glob patterns to ignore.                           |
| `openaiApiKey` | `string`   | `undefined`                   | Optional. Your GitHub Models or OpenAI API key.    |

---

## 💡 Best Practices

1. **Backup Your Code**: While `inject` is safe, it modifies your files. Always commit your changes before running the injection step.
2. **Review Translations**: AI is powerful but not perfect. Always review the generated JSON files for context accuracy.
3. **Consistent Naming**: The tool generates keys based on component names. Keep your component filenames consistent for best results.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
