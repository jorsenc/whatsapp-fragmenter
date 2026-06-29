/**
 * Edge Case Handler - Deal with malformed, inconsistent, or unusual files
 */

class EdgeCaseHandler {
  /**
   * Validate and clean file content
   */
  static validateContent(content) {
    const issues = [];
    const warnings = [];

    if (!content) {
      throw new Error('Content is empty');
    }

    if (typeof content !== 'string') {
      throw new Error('Content must be a string');
    }

    if (content.length < 100) {
      issues.push('Content is very small (< 100 bytes)');
    }

    // Check for encoding issues
    if (content.includes('�')) {
      issues.push('File contains invalid UTF-8 characters');
    }

    // Check for null bytes
    if (content.includes('\x00')) {
      warnings.push('File contains null bytes (will be removed)');
    }

    // Check for excessive whitespace
    const whitelineCount = content.split('\n').filter(l => !l.trim()).length;
    if (whitelineCount > content.split('\n').length * 0.5) {
      warnings.push('File contains many empty lines (> 50%)');
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Clean content for processing
   */
  static cleanContent(content) {
    let cleaned = content;

    // Remove null bytes
    cleaned = cleaned.replace(/\x00/g, '');

    // Normalize line endings (CRLF -> LF)
    cleaned = cleaned.replace(/\r\n/g, '\n');
    cleaned = cleaned.replace(/\r/g, '\n');

    // Remove excessive blank lines (keep max 1 consecutive)
    cleaned = cleaned.replace(/\n\n\n+/g, '\n\n');

    // Trim trailing whitespace
    cleaned = cleaned.split('\n')
      .map(line => line.trimRight())
      .join('\n');

    // Remove leading/trailing whitespace from entire content
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * Handle malformed lines gracefully
   */
  static parseLineFlexible(line, regex) {
    const match = line.match(regex);
    if (match) {
      return match;
    }

    // Try to extract basic info even if format is wrong
    // Pattern: [timestamp] user: message
    const basicPattern = /^\[([^\]]+)\]\s+([^:]+):\s(.+)$/;
    const basicMatch = line.match(basicPattern);

    if (basicMatch) {
      return {
        timestamp: basicMatch[1],
        user: basicMatch[2].trim(),
        content: basicMatch[3]
      };
    }

    return null;
  }

  /**
   * Handle timestamps with variations
   */
  static normalizeTimestamp(dateStr, timeStr) {
    try {
      // Remove commas and extra spaces
      dateStr = dateStr.trim().replace(/,\s*/, '');
      timeStr = timeStr.trim();

      // Try to parse different formats
      let day, month, year, hour, minute, second;

      // European format: DD/M/YY or DD.M.YY
      let match = dateStr.match(/(\d{1,2})[\/.\/](\d{1,2})[\/.\/](\d{2})/);
      if (match) {
        [, day, month, year] = match;
      }

      // American format: M/DD/YY
      if (!match) {
        match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2})/);
        if (match) {
          // Detect if it's M/DD/YY or DD/M/YY
          if (parseInt(match[1]) > 12) {
            // Must be DD/M/YY
            [, day, month, year] = match;
          } else if (parseInt(match[2]) > 12) {
            // Must be M/DD/YY
            [, month, day, year] = match;
          } else {
            // Ambiguous - assume DD/M/YY (more common globally)
            [, day, month, year] = match;
          }
        }
      }

      // Parse time
      match = timeStr.match(/(\d{1,2}):(\d{2}):(\d{2})/);
      if (match) {
        [, hour, minute, second] = match;
      }

      if (!day || !month || !year || !hour || !minute || !second) {
        return null;
      }

      // Convert 2-digit year
      const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);

      // Build ISO timestamp
      const iso = `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${minute}:${second}`;

      // Validate it's a real date
      const date = new Date(iso);
      if (isNaN(date.getTime())) {
        return null;
      }

      return iso;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate timestamp is reasonable
   */
  static isValidTimestamp(timestamp) {
    try {
      const date = new Date(timestamp);

      // Check if date is in reasonable range (1990-2100)
      if (date.getFullYear() < 1990 || date.getFullYear() > 2100) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Handle missing or corrupted messages
   */
  static handleCorruptedMessage(line, lastValidMessage) {
    // Try to continue a previous message
    if (lastValidMessage && line.trim()) {
      return {
        isContinuation: true,
        timestamp: lastValidMessage.timestamp,
        user: lastValidMessage.user,
        content: line
      };
    }

    return null;
  }

  /**
   * Validate fragment integrity
   */
  static validateFragments(fragments) {
    const issues = [];

    for (const [month, messages] of Object.entries(fragments)) {
      if (messages.length === 0) {
        issues.push(`Month ${month} is empty`);
        continue;
      }

      // Check if all messages are in correct month
      for (const msg of messages) {
        const msgMonth = msg.timestamp.substring(0, 7);
        if (msgMonth !== month) {
          issues.push(`Message in ${month} has timestamp ${msgMonth}`);
        }
      }

      // Check chronological order
      for (let i = 1; i < messages.length; i++) {
        if (messages[i].timestamp < messages[i - 1].timestamp) {
          issues.push(`Messages in ${month} are not in chronological order`);
          break;
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Generate recovery report
   */
  static generateRecoveryReport(originalCount, parsedCount, issues) {
    const recovered = parsedCount;
    const lost = originalCount - parsedCount;
    const recoveryRate = originalCount > 0 ? ((recovered / originalCount) * 100).toFixed(2) : 0;

    return {
      originalMessageCount: originalCount,
      recoveredMessageCount: recovered,
      lostMessages: lost,
      recoveryRate: `${recoveryRate}%`,
      issues,
      isAcceptable: recoveryRate >= 90
    };
  }
}

export default EdgeCaseHandler;
