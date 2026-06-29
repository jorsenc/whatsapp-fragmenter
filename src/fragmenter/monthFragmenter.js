/**
 * Month Fragmenter - Group messages by month and maintain chronological order
 */

class MonthFragmenter {
  constructor(messages) {
    this.messages = messages || [];
    this.fragments = {}; // { "2026-01": [...], "2026-02": [...] }
  }

  /**
   * Fragment messages by month (YYYY-MM)
   * Preserves chronological order within each month
   */
  fragment() {
    // Group by month
    this.messages.forEach(msg => {
      const key = msg.timestamp.substring(0, 7); // YYYY-MM

      if (!this.fragments[key]) {
        this.fragments[key] = [];
      }

      this.fragments[key].push(msg);
    });

    // Ensure chronological order within each month
    Object.values(this.fragments).forEach(monthMessages => {
      monthMessages.sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
      );
    });

    return this.fragments;
  }

  /**
   * Get fragments as sorted array
   * Returns: [["2026-01", [msgs]], ["2026-02", [msgs]], ...]
   */
  getFragments() {
    return Object.entries(this.fragments).sort();
  }

  /**
   * Get statistics about fragments
   */
  getFragmentStats() {
    return Object.entries(this.fragments).map(([month, messages]) => ({
      month,
      messageCount: messages.length,
      lineCount: messages.reduce((sum, msg) =>
        sum + (msg.content.split('\n').length), 0
      ),
      startDate: messages[0]?.timestamp,
      endDate: messages[messages.length - 1]?.timestamp,
      uniqueUsers: new Set(messages.map(m => m.user)).size
    }));
  }

  /**
   * Convert ISO timestamp to human-readable date
   * "2026-01-15T14:32:45" -> "15/1/26"
   */
  getFormattedDate(timestamp) {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  }

  /**
   * Get month in human-readable format
   * "2026-01" -> "Enero 2026" or "January 2026"
   */
  getFormattedMonth(monthKey) {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return `${monthNames[date.getMonth()]} ${year}`;
  }

  /**
   * Get date range for fragment
   */
  getDateRange(monthKey) {
    const messages = this.fragments[monthKey];
    if (!messages || messages.length === 0) {
      return { start: null, end: null };
    }

    return {
      start: this.getFormattedDate(messages[0].timestamp),
      end: this.getFormattedDate(messages[messages.length - 1].timestamp)
    };
  }

  /**
   * Validate that all messages are in correct fragments
   */
  validate() {
    const errors = [];

    Object.entries(this.fragments).forEach(([monthKey, messages]) => {
      messages.forEach((msg, index) => {
        const msgMonth = msg.timestamp.substring(0, 7);
        if (msgMonth !== monthKey) {
          errors.push(
            `Message ${index} in fragment ${monthKey} has timestamp ${msgMonth}`
          );
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      fragmentCount: Object.keys(this.fragments).length,
      totalMessages: this.messages.length
    };
  }
}

export default MonthFragmenter;
