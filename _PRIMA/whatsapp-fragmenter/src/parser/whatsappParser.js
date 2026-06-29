/**
 * WhatsApp Parser - Automatic format detection and message parsing
 * Supports: Spanish, English, Portuguese, French, German, Italian
 */

import { LANGUAGE_PATTERNS, MEDIA_PATTERNS, detectLanguage } from './languagePatterns.js';

class WhatsappParser {
  constructor(content) {
    this.lines = content.split('\n');
    this.messages = [];
    this.detectedLanguage = null;
    this.skipSystemMessages = true;
    this.skipMediaMessages = true;
  }

  /**
   * Detect WhatsApp export format automatically
   * Tries multiple regex patterns to determine language/format
   */
  detectFormat() {
    this.detectedLanguage = detectLanguage(this.lines.join('\n'));

    if (!this.detectedLanguage) {
      throw new Error('Could not detect WhatsApp format. Ensure file is valid export.');
    }

    return this.detectedLanguage;
  }

  /**
   * Get compiled regex pattern based on detected format
   */
  getRegex() {
    if (!this.detectedLanguage) {
      this.detectFormat();
    }

    const languageInfo = LANGUAGE_PATTERNS[this.detectedLanguage];
    return languageInfo.regex;
  }

  /**
   * Check if a line is a system message
   */
  isSystemMessage(line) {
    if (!this.detectedLanguage) {
      this.detectFormat();
    }

    const languageInfo = LANGUAGE_PATTERNS[this.detectedLanguage];
    return languageInfo.systemMessagePatterns.some(pattern => pattern.test(line));
  }

  /**
   * Check if a message is media
   */
  isMediaMessage(content) {
    return MEDIA_PATTERNS.some(pattern => pattern.test(content.trim()));
  }

  /**
   * Parse all messages from content
   * Handles multiline messages and filters based on options
   */
  parseMessages() {
    const regex = this.getRegex();
    let currentMessage = null;

    for (let line of this.lines) {
      if (!line.trim()) continue;

      // Remove invisible characters (ZERO-WIDTH SPACE, etc)
      line = line.replace(/[​‌‍ ⁠]/g, '').trim();

      if (!line) continue;

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
    if (!this.detectedLanguage) {
      this.detectFormat();
    }
    const languageInfo = LANGUAGE_PATTERNS[this.detectedLanguage];
    return {
      languageCode: this.detectedLanguage,
      languageName: languageInfo.name,
      messageCount: this.messages.length,
      uniqueUsers: new Set(this.messages.map(m => m.user)).size
    };
  }

  /**
   * Get list of supported languages
   */
  static getSupportedLanguages() {
    return Object.entries(LANGUAGE_PATTERNS).map(([code, info]) => ({
      code,
      name: info.name,
      dateFormat: info.dateFormat
    }));
  }
}

export default WhatsappParser;
