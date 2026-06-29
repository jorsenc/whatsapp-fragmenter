import test from 'node:test';
import assert from 'node:assert';
import MonthFragmenter from '../src/fragmenter/monthFragmenter.js';

test('Fragmenter - Group messages by month', () => {
  const messages = [
    { timestamp: '2026-01-15T14:32:45', user: 'Juan', content: 'Msg 1' },
    { timestamp: '2026-02-05T10:15:22', user: 'María', content: 'Msg 2' }
  ];

  const fragmenter = new MonthFragmenter(messages);
  fragmenter.fragment();
  const fragments = fragmenter.getFragments();

  assert.strictEqual(fragments.length, 2);
  assert.strictEqual(fragments[0][0], '2026-01');
  assert.strictEqual(fragments[1][0], '2026-02');
});

test('Fragmenter - Preserve chronological order', () => {
  const messages = [
    { timestamp: '2026-02-15T14:32:45', user: 'A', content: 'msg1' },
    { timestamp: '2026-01-10T10:15:22', user: 'B', content: 'msg2' },
    { timestamp: '2026-01-20T09:00:00', user: 'C', content: 'msg3' }
  ];

  const fragmenter = new MonthFragmenter(messages);
  fragmenter.fragment();
  const fragments = fragmenter.getFragments();

  // Check month order
  assert.strictEqual(fragments[0][0], '2026-01');
  assert.strictEqual(fragments[1][0], '2026-02');

  // Check message order within January
  const janMessages = fragments[0][1];
  assert.strictEqual(janMessages[0].timestamp, '2026-01-10T10:15:22');
  assert.strictEqual(janMessages[1].timestamp, '2026-01-20T09:00:00');
});

test('Fragmenter - Get fragment statistics', () => {
  const messages = [
    { timestamp: '2026-01-15T14:32:45', user: 'Juan', content: 'Line1\nLine2' },
    { timestamp: '2026-01-20T10:15:22', user: 'María', content: 'Single line' }
  ];

  const fragmenter = new MonthFragmenter(messages);
  fragmenter.fragment();
  const stats = fragmenter.getFragmentStats();

  assert.strictEqual(stats.length, 1);
  assert.strictEqual(stats[0].month, '2026-01');
  assert.strictEqual(stats[0].messageCount, 2);
  assert.strictEqual(stats[0].lineCount, 3); // 2 lines + 1 line
  assert.strictEqual(stats[0].uniqueUsers, 2);
});

test('Fragmenter - Format date correctly', () => {
  const fragmenter = new MonthFragmenter([]);

  assert.strictEqual(
    fragmenter.getFormattedDate('2026-01-15T14:32:45'),
    '15/1/26'
  );

  assert.strictEqual(
    fragmenter.getFormattedDate('2026-12-05T09:00:00'),
    '5/12/26'
  );

  assert.strictEqual(
    fragmenter.getFormattedDate('2020-03-01T00:00:00'),
    '1/3/20'
  );
});

test('Fragmenter - Format month correctly', () => {
  const fragmenter = new MonthFragmenter([]);

  assert.strictEqual(
    fragmenter.getFormattedMonth('2026-01'),
    'Enero 2026'
  );

  assert.strictEqual(
    fragmenter.getFormattedMonth('2026-12'),
    'Diciembre 2026'
  );
});

test('Fragmenter - Get date range for fragment', () => {
  const messages = [
    { timestamp: '2026-01-10T10:00:00', user: 'A', content: 'First' },
    { timestamp: '2026-01-20T20:00:00', user: 'B', content: 'Last' }
  ];

  const fragmenter = new MonthFragmenter(messages);
  fragmenter.fragment();
  const range = fragmenter.getDateRange('2026-01');

  assert.strictEqual(range.start, '10/1/26');
  assert.strictEqual(range.end, '20/1/26');
});

test('Fragmenter - Validate fragments', () => {
  const messages = [
    { timestamp: '2026-01-15T14:32:45', user: 'Juan', content: 'Msg 1' },
    { timestamp: '2026-01-20T10:15:22', user: 'María', content: 'Msg 2' }
  ];

  const fragmenter = new MonthFragmenter(messages);
  fragmenter.fragment();
  const validation = fragmenter.validate();

  assert.strictEqual(validation.isValid, true);
  assert.strictEqual(validation.errors.length, 0);
  assert.strictEqual(validation.fragmentCount, 1);
  assert.strictEqual(validation.totalMessages, 2);
});

test('Fragmenter - Handle empty messages array', () => {
  const fragmenter = new MonthFragmenter([]);
  fragmenter.fragment();
  const fragments = fragmenter.getFragments();

  assert.strictEqual(fragments.length, 0);
});

test('Fragmenter - Handle messages from same day', () => {
  const messages = [
    { timestamp: '2026-01-15T10:00:00', user: 'A', content: 'msg1' },
    { timestamp: '2026-01-15T14:00:00', user: 'B', content: 'msg2' },
    { timestamp: '2026-01-15T18:00:00', user: 'C', content: 'msg3' }
  ];

  const fragmenter = new MonthFragmenter(messages);
  fragmenter.fragment();
  const fragments = fragmenter.getFragments();

  assert.strictEqual(fragments.length, 1);
  assert.strictEqual(fragments[0][1].length, 3);

  // Check order
  assert.strictEqual(fragments[0][1][0].timestamp, '2026-01-15T10:00:00');
  assert.strictEqual(fragments[0][1][1].timestamp, '2026-01-15T14:00:00');
  assert.strictEqual(fragments[0][1][2].timestamp, '2026-01-15T18:00:00');
});

test('Fragmenter - Handle multiple years', () => {
  const messages = [
    { timestamp: '2025-12-15T14:32:45', user: 'A', content: 'msg1' },
    { timestamp: '2026-01-15T14:32:45', user: 'B', content: 'msg2' },
    { timestamp: '2026-02-15T14:32:45', user: 'C', content: 'msg3' }
  ];

  const fragmenter = new MonthFragmenter(messages);
  fragmenter.fragment();
  const fragments = fragmenter.getFragments();

  assert.strictEqual(fragments.length, 3);
  assert.strictEqual(fragments[0][0], '2025-12');
  assert.strictEqual(fragments[1][0], '2026-01');
  assert.strictEqual(fragments[2][0], '2026-02');
});

test('Fragmenter - Statistics with multiple users', () => {
  const messages = [
    { timestamp: '2026-01-15T10:00:00', user: 'Juan', content: 'msg1' },
    { timestamp: '2026-01-15T11:00:00', user: 'María', content: 'msg2' },
    { timestamp: '2026-01-15T12:00:00', user: 'Juan', content: 'msg3' },
    { timestamp: '2026-02-15T10:00:00', user: 'Pedro', content: 'msg4' }
  ];

  const fragmenter = new MonthFragmenter(messages);
  fragmenter.fragment();
  const stats = fragmenter.getFragmentStats();

  assert.strictEqual(stats[0].uniqueUsers, 2); // January: Juan, María
  assert.strictEqual(stats[1].uniqueUsers, 1); // February: Pedro
});
