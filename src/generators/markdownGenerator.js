/**
 * Markdown Generator - Convert message fragments to clean Markdown format
 * Output format: ## DD/M/YY with [HH:MM:SS] Usuario: Contenido
 */

class MarkdownGenerator {
  constructor(fragment) {
    this.fragment = fragment || [];
  }

  /**
   * Generate Markdown from message fragment
   * Groups messages by day with ## headers
   */
  generate() {
    if (this.fragment.length === 0) {
      return '# Sin mensajes\n\nEste fragmento no contiene mensajes.';
    }

    let markdown = '';
    const byDay = {};

    // Group messages by date (YYYY-MM-DD)
    this.fragment.forEach(msg => {
      const date = msg.timestamp.split('T')[0]; // YYYY-MM-DD
      if (!byDay[date]) {
        byDay[date] = [];
      }
      byDay[date].push(msg);
    });

    // Generate Markdown by day
    Object.keys(byDay).sort().forEach(date => {
      const formattedDate = this.formatDate(date);
      markdown += `## ${formattedDate}\n\n`;

      byDay[date].forEach(msg => {
        const time = msg.timestamp.split('T')[1].substring(0, 8); // HH:MM:SS
        const user = msg.user;
        const content = msg.content.replace(/\n/g, '\n  '); // Indent multiline

        markdown += `[${time}] ${user}: ${content}\n`;
      });

      markdown += '\n';
    });

    return markdown;
  }

  /**
   * Format ISO date to DD/M/YY
   * "2026-01-15" -> "15/1/26"
   */
  formatDate(isoDate) {
    const [year, month, day] = isoDate.split('-');
    const shortYear = year.substring(2);
    return `${parseInt(day)}/${parseInt(month)}/${shortYear}`;
  }

  /**
   * Get statistics about the fragment
   */
  getStats() {
    return {
      messageCount: this.fragment.length,
      lineCount: this.fragment.reduce((sum, msg) =>
        sum + (msg.content.split('\n').length), 0
      ),
      uniqueUsers: new Set(this.fragment.map(m => m.user)).size,
      users: Array.from(new Set(this.fragment.map(m => m.user))).sort(),
      startDate: this.fragment.length > 0 ? this.fragment[0].timestamp : null,
      endDate: this.fragment.length > 0 ? this.fragment[this.fragment.length - 1].timestamp : null
    };
  }

  /**
   * Generate Markdown with metadata header
   */
  generateWithMetadata() {
    const stats = this.getStats();
    let markdown = '';

    // Add metadata header
    markdown += `<!-- Generated Markdown Fragment -->\n`;
    markdown += `<!-- Messages: ${stats.messageCount} | Users: ${stats.uniqueUsers} | Lines: ${stats.lineCount} -->\n\n`;

    // Add content
    markdown += this.generate();

    return markdown;
  }

  /**
   * Validate Markdown is well-formed
   */
  validate() {
    const markdown = this.generate();
    const errors = [];

    // Check for proper structure
    if (!markdown.includes('##')) {
      errors.push('No date headers found');
    }

    if (!markdown.includes('[') || !markdown.includes(']')) {
      errors.push('No time stamps found');
    }

    return {
      isValid: errors.length === 0,
      errors,
      size: markdown.length
    };
  }
}

export default MarkdownGenerator;
