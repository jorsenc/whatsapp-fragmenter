/**
 * WhatsApp Parser - Automatic format detection and message parsing
 * Supports: Spanish, English, Portuguese, French
 */

class WhatsappParser {
  constructor(content) {
    this.lines = content.split('\n');
    this.messages = [];
    this.detectedFormat = null;
    this.skipSystemMessages = true;
    this.skipMediaMessages = true;
  }

  /**
   * Detect WhatsApp export format automatically
   * Tries multiple regex patterns to determine language/format
   */
  detectFormat() {
    const sampleLines = this.lines.slice(0, 100).join('\n');

    const patterns = {
      'es-DD/M/YY': /\[\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}:\d{2}\]/,
      'en-M/DD/YY': /\[\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}:\d{2}\s(?:AM|PM)\]/,
      'pt-DD/M/YY': /\[\d{1,2}\/\d{1,2}\/\d{2}, \d{1,2}:\d{2}:\d{2}\]/,
      'fr-DD/M/YY': /\[\d{1,2}\/\d{1,2}\/\d{2}\s\d{1,2}:\d{2}:\d{2}\]/
    };

    for (const [format, regex] of Object.entries(patterns)) {
      if (regex.test(sampleLines)) {
        this.detectedFormat = format;
        return format;
      }
    }

    throw new Error('Could not detect WhatsApp format. Ensure file is valid export.');
  }

  /**
   * Get compiled regex pattern based on detected format
   */
  getRegex() {
    const regexMap = {
      'es-DD/M/YY': /^\[(\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.+)$/,
      'en-M/DD/YY': /^\[(\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}:\d{2}\s(?:AM|PM))\]\s([^:]+):\s(.+)$/,
      'pt-DD/M/YY': /^\[(\d{1,2}\/\d{1,2}\/\d{2}),\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.+)$/,
      'fr-DD/M/YY': /^\[(\d{1,2}\/\d{1,2}\/\d{2})\s(\d{1,2}:\d{2}:\d{2})\]\s([^:]+):\s(.+)$/
    };

    if (!this.detectedFormat) {
      this.detectFormat();
    }

    return regexMap[this.detectedFormat];
  }

  /**
   * Check if a line is a system message
   * Examples: "Usuario entró al grupo", "Usuario cambió el nombre"
   */
  isSystemMessage(line) {
    const systemPatterns = [
      /entró al grupo/i,
      /salió del grupo/i,
      /cambió el nombre/i,
      /cambió la foto/i,
      /cambió la descripción/i,
      /cambió la configuración/i,
      /cambió los datos del grupo/i,
      /llamada perdida/i,
      /creó el grupo/i,
      /agregó a/i,
      /eliminó a/i,
      /dejó el grupo/i,
      /has left/i,
      /created group/i,
      /added/i,
      /removed/i,
      /changed the/i
    ];

    return systemPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Check if a message is media
   * Examples: [Imagen], [Video], [Audio], <Media omitted>
   */
  isMediaMessage(content) {
    const mediaPatterns = [
      /^\[Imagen\]$/i,
      /^\[Video\]$/i,
      /^\[Audio\]$/i,
      /^\[Documento\]$/i,
      /^\[Archivo\]$/i,
      /^\[GIF\]$/i,
      /^\[Sticker\]$/i,
      /^<Media omitted>$/i,
      /^\[image omitted\]$/i,
      /^\[video omitted\]$/i,
      /^\[audio omitted\]$/i
    ];

    return mediaPatterns.some(pattern => pattern.test(content.trim()));
  }

  /**
   * Parse all messages from content
   * Handles multiline messages and filters based on options
   */
  parseMessages() {
    const regex = this.getRegex();
    let currentMessage = null;

    for (const line of this.lines) {
      if (!line.trim()) continue;

      const match = line.match(regex);

      if (match) {
        // New message line
        const [, date, time, user, content] = match;

        // Convert to ISO 8601 timestamp
        const timestamp = this.normalizeTimestamp(date, time);

        // Skip if system message
        if (this.skipSystemMessages && this.isSystemMessage(line)) {
          continue;
        }

        // Skip if media message
        if (this.skipMediaMessages && this.isMediaMessage(content)) {
          continue;
        }

        currentMessage = { timestamp, user, content };
        this.messages.push(currentMessage);
      } else if (currentMessage && line.trim()) {
        // Continuation of multiline message
        currentMessage.content += '\n' + line;
      }
    }

    return this.messages;
  }

  /**
   * Convert date and time to ISO 8601 format
   * Example: "15/1/26, 14:32:45" -> "2026-01-15T14:32:45"
   */
  normalizeTimestamp(dateStr, timeStr) {
    const dateRegex = /(\d{1,2})\/(\d{1,2})\/(\d{2})/;
    const timeRegex = /(\d{1,2}):(\d{2}):(\d{2})/;

    const dateMatch = dateStr.match(dateRegex);
    const timeMatch = timeStr.match(timeRegex);

    if (!dateMatch || !timeMatch) {
      throw new Error(`Invalid timestamp format: ${dateStr}, ${timeStr}`);
    }

    const [, day, month, year] = dateMatch;
    const [, hour, minute, second] = timeMatch;

    // Convert 2-digit year to 4-digit
    const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);

    return `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${minute}:${second}`;
  }

  /**
   * Get all parsed messages
   */
  getMessages() {
    if (!this.detectedFormat) {
      this.detectFormat();
    }
    if (this.messages.length === 0) {
      this.parseMessages();
    }
    return this.messages;
  }

  /**
   * Get detected format information
   */
  getFormatInfo() {
    if (!this.detectedFormat) {
      this.detectFormat();
    }
    return {
      format: this.detectedFormat,
      messageCount: this.messages.length,
      uniqueUsers: new Set(this.messages.map(m => m.user)).size
    };
  }
}

export default WhatsappParser;
