/**
 * Index Generator - Create Markdown index of all generated fragments
 */

class IndexGenerator {
  constructor(fragments) {
    this.fragments = fragments || [];
  }

  /**
   * Generate index Markdown
   * Lists all fragments with links and statistics
   */
  generate() {
    let md = '# Índice de Fragmentos\n\n';

    // Add summary
    md += `**Total:** ${this.fragments.length} fragmentos\n`;

    if (this.fragments.length > 0) {
      md += `**Período:** ${this.getPeriod()}\n`;
      md += `**Mensajes:** ${this.getTotalMessages().toLocaleString()}\n`;
      md += `**Tamaño total:** ${this.getTotalSize()}MB\n`;
    }

    md += '\n---\n\n';

    // List fragments
    md += '## Fragmentos Generados\n\n';

    if (this.fragments.length === 0) {
      md += 'No se generaron fragmentos.\n';
      return md;
    }

    this.fragments.forEach(f => {
      md += `- **[${f.month}](./${f.name})** - ${f.lines} mensajes, ${f.size}KB\n`;
    });

    // Add usage instructions
    md += '\n---\n\n';
    md += '## Cómo usar estos fragmentos\n\n';
    md += '### Con NotebookLM\n\n';
    md += '1. Abre [NotebookLM](https://notebooklm.google.com)\n';
    md += '2. Crea un nuevo notebook\n';
    md += '3. Para cada archivo `.md`:\n';
    md += '   - Click en "Add Source"\n';
    md += '   - Sube el archivo Markdown\n';
    md += '4. ¡Listo! Ahora puedes hacer preguntas sobre todo el chat\n\n';

    md += '### Detalles de los fragmentos\n\n';
    md += 'Cada fragmento contiene:\n';
    md += '- Mensajes de un mes completo\n';
    md += '- Organizados por día\n';
    md += '- Solo texto (sin multimedia)\n';
    md += '- Sin mensajes de sistema\n';
    md += '- Formato: `[HH:MM:SS] Usuario: Mensaje`\n\n';

    // Add statistics table
    md += '---\n\n';
    md += '## Estadísticas Detalladas\n\n';
    md += this.generateStatsTable();

    return md;
  }

  /**
   * Generate statistics table
   */
  generateStatsTable() {
    let table = '| Mes | Mensajes | Tamaño | Archivo |\n';
    table += '|-----|----------|--------|----------|\n';

    this.fragments.forEach(f => {
      table += `| ${f.month} | ${f.lines} | ${f.size}KB | [${f.name}](./${f.name}) |\n`;
    });

    return table;
  }

  /**
   * Get period span (first to last month)
   */
  getPeriod() {
    if (this.fragments.length === 0) return 'N/A';
    const months = this.fragments.map(f => f.month).sort();
    return `${months[0]} a ${months[months.length - 1]}`;
  }

  /**
   * Get total message count
   */
  getTotalMessages() {
    return this.fragments.reduce((sum, f) => sum + f.lines, 0);
  }

  /**
   * Get total size in MB
   */
  getTotalSize() {
    const totalKB = this.fragments.reduce((sum, f) => sum + f.size, 0);
    return (totalKB / 1024).toFixed(2);
  }

  /**
   * Get average messages per fragment
   */
  getAveragePerFragment() {
    if (this.fragments.length === 0) return 0;
    return Math.round(this.getTotalMessages() / this.fragments.length);
  }

  /**
   * Generate summary statistics
   */
  getSummary() {
    return {
      totalFragments: this.fragments.length,
      totalMessages: this.getTotalMessages(),
      totalSize: parseFloat(this.getTotalSize()),
      period: this.getPeriod(),
      averagePerFragment: this.getAveragePerFragment(),
      largestFragment: this.getLargestFragment(),
      smallestFragment: this.getSmallestFragment()
    };
  }

  /**
   * Get largest fragment
   */
  getLargestFragment() {
    if (this.fragments.length === 0) return null;
    return this.fragments.reduce((max, f) =>
      f.lines > max.lines ? f : max
    );
  }

  /**
   * Get smallest fragment
   */
  getSmallestFragment() {
    if (this.fragments.length === 0) return null;
    return this.fragments.reduce((min, f) =>
      f.lines < min.lines ? f : min
    );
  }

  /**
   * Validate index
   */
  validate() {
    const errors = [];

    if (this.fragments.length === 0) {
      errors.push('No fragments to index');
    }

    // Check for duplicate months
    const months = this.fragments.map(f => f.month);
    const duplicates = months.filter((m, i) => months.indexOf(m) !== i);
    if (duplicates.length > 0) {
      errors.push(`Duplicate months: ${duplicates.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      fragmentCount: this.fragments.length
    };
  }
}

export default IndexGenerator;
