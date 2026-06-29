import test from 'node:test';
import assert from 'node:assert';
import WhatsappParser from '../src/parser/whatsappParser.js';

test('Parser - Spanish format detection', () => {
  const content = '[15/1/26, 14:32:45] Juan: Hola';
  const parser = new WhatsappParser(content);
  const format = parser.detectFormat();
  assert.strictEqual(format, 'es-DD/M/YY');
});

test('Parser - English format detection', () => {
  const content = '[1/15/26, 2:32:45 PM] John: Hello';
  const parser = new WhatsappParser(content);
  const format = parser.detectFormat();
  assert.strictEqual(format, 'en-M/DD/YY');
});

test('Parser - Parse single valid message', () => {
  const content = '[15/1/26, 14:32:45] Juan: Hola qué tal';
  const parser = new WhatsappParser(content);
  parser.skipSystemMessages = false;
  parser.skipMediaMessages = false;
  const messages = parser.getMessages();

  assert.strictEqual(messages.length, 1);
  assert.strictEqual(messages[0].user, 'Juan');
  assert.strictEqual(messages[0].content, 'Hola qué tal');
  assert.strictEqual(messages[0].timestamp, '2026-01-15T14:32:45');
});

test('Parser - Parse multiple messages', () => {
  const content = `[15/1/26, 14:32:45] Juan: Hola
[15/1/26, 14:33:12] María: Bien, ¿y tú?`;
  const parser = new WhatsappParser(content);
  parser.skipSystemMessages = false;
  parser.skipMediaMessages = false;
  const messages = parser.getMessages();

  assert.strictEqual(messages.length, 2);
  assert.strictEqual(messages[0].user, 'Juan');
  assert.strictEqual(messages[1].user, 'María');
});

test('Parser - Filter system messages', () => {
  const content = `[15/1/26, 14:32:45] Juan entró al grupo
[15/1/26, 14:33:12] María: Hola`;
  const parser = new WhatsappParser(content);
  parser.skipSystemMessages = true;
  parser.skipMediaMessages = false;
  const messages = parser.getMessages();

  assert.strictEqual(messages.length, 1);
  assert.strictEqual(messages[0].user, 'María');
});

test('Parser - Filter media messages', () => {
  const content = `[15/1/26, 14:32:45] Juan: [Imagen]
[15/1/26, 14:33:12] María: Texto`;
  const parser = new WhatsappParser(content);
  parser.skipSystemMessages = false;
  parser.skipMediaMessages = true;
  const messages = parser.getMessages();

  assert.strictEqual(messages.length, 1);
  assert.strictEqual(messages[0].content, 'Texto');
});

test('Parser - Handle multiline messages', () => {
  const content = `[15/1/26, 14:32:45] Juan: Hola
continuación
de mensaje`;
  const parser = new WhatsappParser(content);
  parser.skipSystemMessages = false;
  parser.skipMediaMessages = false;
  const messages = parser.getMessages();

  assert.strictEqual(messages.length, 1);
  assert(messages[0].content.includes('continuación'));
  assert(messages[0].content.includes('de mensaje'));
});

test('Parser - Detect system messages correctly', () => {
  const testMessages = [
    { text: 'Juan entró al grupo', isSystem: true },
    { text: 'María cambió el nombre del grupo', isSystem: true },
    { text: 'Pedro cambió la foto', isSystem: true },
    { text: 'Llamada perdida', isSystem: true },
    { text: 'Este es un mensaje normal', isSystem: false }
  ];

  const parser = new WhatsappParser('');
  testMessages.forEach(({ text, isSystem }) => {
    const result = parser.isSystemMessage(`[15/1/26, 14:32:45] ${text}`);
    assert.strictEqual(result, isSystem, `Failed for: ${text}`);
  });
});

test('Parser - Detect media messages correctly', () => {
  const mediaContents = [
    { content: '[Imagen]', isMedia: true },
    { content: '[Video]', isMedia: true },
    { content: '[Audio]', isMedia: true },
    { content: '[GIF]', isMedia: true },
    { content: 'Texto normal', isMedia: false }
  ];

  const parser = new WhatsappParser('');
  mediaContents.forEach(({ content, isMedia }) => {
    const result = parser.isMediaMessage(content);
    assert.strictEqual(result, isMedia, `Failed for: ${content}`);
  });
});

test('Parser - Normalize timestamps correctly', () => {
  const parser = new WhatsappParser('[15/1/26, 14:32:45] Usuario: Test');

  const ts = parser.normalizeTimestamp('15/1/26', '14:32:45');
  assert.strictEqual(ts, '2026-01-15T14:32:45');

  const ts2 = parser.normalizeTimestamp('5/12/26', '09:00:00');
  assert.strictEqual(ts2, '2026-12-05T09:00:00');
});

test('Parser - Year conversion (2-digit to 4-digit)', () => {
  const parser = new WhatsappParser('[15/1/26, 14:32:45] Usuario: Test');

  // Year 26 should become 2026
  const ts1 = parser.normalizeTimestamp('15/1/26', '14:32:45');
  assert.strictEqual(ts1, '2026-01-15T14:32:45');

  // Year 20 should become 2020
  const ts2 = parser.normalizeTimestamp('15/1/20', '14:32:45');
  assert.strictEqual(ts2, '2020-01-15T14:32:45');
});

test('Parser - Get format info', () => {
  const content = `[15/1/26, 14:32:45] Juan: Hola
[15/1/26, 14:33:12] María: Hola`;
  const parser = new WhatsappParser(content);
  parser.skipSystemMessages = false;
  parser.skipMediaMessages = false;
  parser.getMessages();

  const info = parser.getFormatInfo();
  assert.strictEqual(info.format, 'es-DD/M/YY');
  assert.strictEqual(info.messageCount, 2);
  assert.strictEqual(info.uniqueUsers, 2);
});

test('Parser - Error on invalid format', () => {
  const content = 'This is not a valid WhatsApp export';
  const parser = new WhatsappParser(content);

  assert.throws(() => {
    parser.detectFormat();
  }, /Could not detect WhatsApp format/);
});
