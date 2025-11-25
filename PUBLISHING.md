# Publishing to npm

This package includes a shared API key for GitHub Models to help users get started quickly.

## Before Publishing

1. **Add your API key** to `src/utils/constants.ts`:

   ```bash
   cp src/utils/constants.template.ts src/utils/constants.ts
   ```

   Then edit `src/utils/constants.ts`:

   ```typescript
   export const SHARED_OPENAI_KEY = 'github_pat_YOUR_ACTUAL_KEY';
   ```

2. **Build the package**:

   ```bash
   npm run build
   ```

3. **Publish to npm**:
   ```bash
   npm publish
   ```

## Important Notes

- `src/utils/constants.ts` is in `.gitignore` to prevent pushing secrets to GitHub
- The compiled version in `dist/utils/constants.js` WILL be included in the npm package
- Users installing from npm will get the shared API key automatically
- GitHub will never see the actual key, avoiding secret scanning issues
