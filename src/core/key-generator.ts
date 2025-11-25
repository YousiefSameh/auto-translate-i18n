export class KeyGenerator {
  generate(componentName: string, text: string): string {
    const semanticLabel = this.toSemanticLabel(text);
    return `${componentName}_${semanticLabel}`;
  }

  private toSemanticLabel(text: string): string {
    // 1. Remove special characters and extra spaces
    let clean = text.replace(/[^a-zA-Z0-9 ]/g, '').trim();

    // 2. Limit length to avoid extremely long keys
    if (clean.length > 30) {
      clean = clean.substring(0, 30);
    }

    // 3. Convert to PascalCase or CamelCase
    // "Start Course" -> "StartCourse"
    return clean
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
}
