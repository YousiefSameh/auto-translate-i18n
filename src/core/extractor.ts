import { Project, SyntaxKind, JsxText, StringLiteral, Node } from 'ts-morph';
import { KeyGenerator } from './key-generator';
import path from 'path';

export interface ExtractedString {
  key: string;
  value: string;
  filePath: string;
  line: number;
}

export class Extractor {
  private project: Project;
  private keyGenerator: KeyGenerator;

  constructor() {
    this.project = new Project({
      skipAddingFilesFromTsConfig: true,
    });
    this.keyGenerator = new KeyGenerator();
  }

  extract(filePaths: string[]): ExtractedString[] {
    const extracted: ExtractedString[] = [];

    for (const filePath of filePaths) {
      const sourceFile = this.project.addSourceFileAtPath(filePath);
      const componentName = path.basename(filePath, path.extname(filePath));

      // 1. Extract JSX Text
      sourceFile.getDescendantsOfKind(SyntaxKind.JsxText).forEach((node) => {
        const text = node.getText().trim();
        if (this.isValidText(text)) {
          extracted.push({
            key: this.keyGenerator.generate(componentName, text),
            value: text,
            filePath,
            line: node.getStartLineNumber(),
          });
        }
      });

      // 2. Extract String Literals in JSX Attributes
      sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute).forEach((attr) => {
        const initializer = attr.getInitializer();
        if (Node.isStringLiteral(initializer)) {
          const text = initializer.getLiteralValue();
          if (this.isValidText(text)) {
            // Check if attribute is translatable (simple heuristic for now: label, placeholder, title, alt)
            // In a real app, this might be configurable.
            const attrName = attr.getNameNode().getText();
            if (['label', 'placeholder', 'title', 'alt', 'aria-label'].includes(attrName)) {
              extracted.push({
                key: this.keyGenerator.generate(componentName, text),
                value: text,
                filePath,
                line: attr.getStartLineNumber(),
              });
            }
          }
        }
      });
    }

    return extracted;
  }

  private isValidText(text: string): boolean {
    // Ignore empty strings, whitespace only, or simple numbers/symbols
    if (!text || text.trim().length === 0) return false;
    // Ignore if it looks like a variable or code
    if (text.startsWith('{') && text.endsWith('}')) return false;
    return true;
  }
}
