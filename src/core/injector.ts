import { Project, SyntaxKind, Node, SourceFile } from 'ts-morph';
import { KeyGenerator } from './key-generator';
import path from 'path';

export class Injector {
  private project: Project;
  private keyGenerator: KeyGenerator;

  constructor() {
    this.project = new Project({
      skipAddingFilesFromTsConfig: true,
    });
    this.keyGenerator = new KeyGenerator();
  }

  async inject(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      const sourceFile = this.project.addSourceFileAtPath(filePath);
      const componentName = path.basename(filePath, path.extname(filePath));
      let hasReplacements = false;

      // 1. Replace JSX Text
      // We iterate backwards or collect nodes first to avoid invalidating traversal
      const jsxTextNodes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
      for (const node of jsxTextNodes) {
        const text = node.getText().trim();
        if (this.isValidText(text)) {
          const key = this.keyGenerator.generate(componentName, text);
          node.replaceWithText(`{t('${key}')}`);
          hasReplacements = true;
        }
      }

      // 2. Replace String Literals in Attributes
      const attributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
      for (const attr of attributes) {
        const initializer = attr.getInitializer();
        if (Node.isStringLiteral(initializer)) {
          const text = initializer.getLiteralValue();
          if (this.isValidText(text)) {
            const attrName = attr.getNameNode().getText();
            if (['label', 'placeholder', 'title', 'alt', 'aria-label'].includes(attrName)) {
              const key = this.keyGenerator.generate(componentName, text);
              initializer.replaceWithText(`{t('${key}')}`);
              hasReplacements = true;
            }
          }
        }
      }

      if (hasReplacements) {
        this.addImportsAndHooks(sourceFile);
        await sourceFile.save();
      }
    }
  }

  private isValidText(text: string): boolean {
    if (!text || text.trim().length === 0) return false;
    if (text.startsWith('{') && text.endsWith('}')) return false;
    return true;
  }

  private addImportsAndHooks(sourceFile: SourceFile) {
    // 1. Add Import
    const importDecl = sourceFile.getImportDeclaration(
      (d) => d.getModuleSpecifierValue() === 'react-i18next',
    );

    if (!importDecl) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: 'react-i18next',
        namedImports: ['useTranslation'],
      });
    } else {
      const hasHook = importDecl.getNamedImports().some((n) => n.getName() === 'useTranslation');
      if (!hasHook) {
        importDecl.addNamedImport('useTranslation');
      }
    }

    // 2. Add Hook to Component
    // Find the default export or the first function component
    const defaultExport = sourceFile.getDefaultExportSymbol();

    const functions = sourceFile.getFunctions();
    const arrowFunctions = sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction);
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    const hasHookCall = callExpressions.some(
      (c) => c.getExpression().getText() === 'useTranslation',
    );

    if (!hasHookCall) {
      const mainFunc = functions.find((f) => f.isExported() || f.isDefaultExport()) || functions[0];
      if (mainFunc) {
        mainFunc.insertStatements(0, 'const { t } = useTranslation();');
      } else {
        // Try arrow functions assigned to variables
        const vars = sourceFile.getVariableStatements();
        for (const v of vars) {
          if (v.isExported() || v.hasModifier(SyntaxKind.ExportKeyword)) {
            const decl = v.getDeclarations()[0];
            const init = decl.getInitializer();
            if (Node.isArrowFunction(init)) {
              init.insertStatements(0, 'const { t } = useTranslation();');
              break;
            }
          }
        }
      }
    }
  }
}
