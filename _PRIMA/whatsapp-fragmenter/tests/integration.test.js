/**
 * Integration Tests - Complete test suite
 */

import { test } from 'node:test';
import * as assert from 'node:assert';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import WhatsappParser from '../src/parser/whatsappParser.js';
import MonthFragmenter from '../src/fragmenter/monthFragmenter.js';
import MarkdownGenerator from '../src/generators/markdownGenerator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('Integration: System Message Filtering (Spanish)', async () => {
  const content = `[18/4/22, 11:35:35] Toni: ‎Los mensajes y las llamadas están cifrados de extremo a extremo. Solo las personas en este chat pueden leerlos, escucharlos o compartirlos.
[18/4/22, 11:35:35] Toni: ‎Bloqueaste a este contacto
[18/4/22, 11:35:35] Toni: ‎Desbloqueaste a este contacto.
[18/4/22, 11:36:00] Toni: Hola, este es un mensaje real
[18/4/22, 11:37:00] Ester: entró al grupo
[18/4/22, 11:38:00] Ester: Este es otro mensaje real`;

  const parser = new WhatsappParser(content);
  parser.skipSystemMessages = true;
  parser.skipMediaMessages = false;
  const messages = parser.getMessages();

  assert.strictEqual(messages.length, 2, 'Should filter 4 system messages');
  assert.strictEqual(messages[0].content, 'Hola, este es un mensaje real');
  assert.strictEqual(messages[1].content, 'Este es otro mensaje real');
});

test('Integration: Media Message Filtering', async () => {
  const content = `[18/4/22, 11:35:35] Toni: ‎imagen omitida
[18/4/22, 11:35:36] Toni: ‎Video omitido
[18/4/22, 11:35:37] Toni: Mensaje real con foto
[18/4/22, 11:35:39] Ester: Otro mensaje real`;

  const parser = new WhatsappParser(content);
  parser.skipSystemMessages = false;
  parser.skipMediaMessages = true;
  const messages = parser.getMessages();

  assert.strictEqual(messages.length, 2, 'Should filter 2 media messages');
  assert.strictEqual(messages[0].content, 'Mensaje real con foto');
  assert.strictEqual(messages[1].content, 'Otro mensaje real');
});

test('Integration: Both Filters Active', async () => {
  const content = `[18/4/22, 11:35:35] Toni: ‎Los mensajes y las llamadas están cifrados
[18/4/22, 11:35:36] Toni: ‎imagen omitida
[18/4/22, 11:35:37] Toni: Mensaje real
[18/4/22, 11:35:38] Ester: Desbloqueaste a este contacto
[18/4/22, 11:35:39] Ester: ‎Video omitido
[18/4/22, 11:35:40] Ester: Otro mensaje real`;

  const parser = new WhatsappParser(content);
  parser.skipSystemMessages = true;
  parser.skipMediaMessages = true;
  const messages = parser.getMessages();

  assert.strictEqual(messages.length, 2, 'Should filter all system and media messages');
  assert.strictEqual(messages[0].content, 'Mensaje real');
  assert.strictEqual(messages[1].content, 'Otro mensaje real');
});

test('Integration: No Filters', async () => {
  const content = `[18/4/22, 11:35:35] Toni: ‎Los mensajes están cifrados
[18/4/22, 11:35:36] Toni: ‎imagen omitida
[18/4/22, 11:35:37] Toni: Mensaje real
[18/4/22, 11:35:38] Ester: Desbloqueaste a contacto
[18/4/22, 11:35:39] Ester: ‎Video omitido
[18/4/22, 11:35:40] Ester: Otro mensaje real`;

  const parser = new WhatsappParser(content);
  parser.skipSystemMessages = false;
  parser.skipMediaMessages = false;
  const messages = parser.getMessages();

  assert.strictEqual(messages.length, 6, 'Should not filter any messages');
});

test('Integration: Multiline Messages Preserved', async () => {
  const content = `[18/4/22, 11:35:35] Toni: Primera línea
segunda línea
tercera línea
[18/4/22, 11:35:36] Ester: Mensaje corto`;

  const parser = new WhatsappParser(content);
  parser.skipSystemMessages = false;
  parser.skipMediaMessages = false;
  const messages = parser.getMessages();

  assert.strictEqual(messages.length, 2, 'Should parse 2 messages');
  assert.match(messages[0].content, /primera línea[\s\S]*segunda línea[\s\S]*tercera línea/i);
  assert.strictEqual(messages[1].content, 'Mensaje corto');
});

test('Integration: Month Fragmentation', async () => {
  const content = `[15/1/26, 14:32:45] User: Mensaje enero
[25/2/26, 10:15:30] User: Mensaje febrero
[10/3/26, 09:45:00] User: Mensaje marzo
[20/3/26, 14:20:15] User: Otro mensaje marzo`;

  const parser = new WhatsappParser(content);
  const messages = parser.getMessages();

  const fragmenter = new MonthFragmenter(messages);
  fragmenter.fragment();
  const fragments = Array.from(fragmenter.getFragments());

  assert.strictEqual(fragments.length, 3, 'Should create 3 fragments');
});

test('Integration: Markdown Generation with Filters', async () => {
  const messages = [
    {
      timestamp: '2026-04-18T11:35:35',
      user: 'Toni',
      content: 'Hola mundo'
    },
    {
      timestamp: '2026-04-18T11:36:00',
      user: 'Ester',
      content: 'Respuesta'
    }
  ];

  const generator = new MarkdownGenerator(messages);
  const markdown = generator.generate();

  assert.match(markdown, /## 18\/4\/26/, 'Should contain date header');
  assert.match(markdown, /Toni: Hola mundo/, 'Should contain message');
  assert.match(markdown, /Ester: Respuesta/, 'Should contain response');
  assert.match(markdown, /\[11:35:35\]/, 'Should contain timestamp');
});

test('Integration: Special Characters Handling', async () => {
  const content = `[18/4/22, 11:35:35] Toni: Mensaje con emoji 🙈😀🎉
[18/4/22, 11:35:36] Ester: Acentuación: é, á, ó, í, ú
[18/4/22, 11:35:37] User: Caracteres especiales: @#$%^&*()`;

  const parser = new WhatsappParser(content);
  const messages = parser.getMessages();

  assert.strictEqual(messages.length, 3);
  assert.match(messages[0].content, /🙈😀🎉/);
  assert.match(messages[1].content, /Acentuación/);
  assert.match(messages[2].content, /Caracteres especiales/);
});

test('Integration: Invisible Characters Removal', async () => {
  const content = `[18/4/22, 11:35:35] Toni: ‎Mensaje con carácter invisible
[18/4/22, 11:35:36] Ester: Mensaje normal`;

  const parser = new WhatsappParser(content);
  const messages = parser.getMessages();

  assert.strictEqual(messages.length, 2);
  assert.strictEqual(messages[0].user, 'Toni');
  assert.strictEqual(messages[1].user, 'Ester');
});

test('Integration: Empty Content Handling', async () => {
  const content = `[18/4/22, 11:35:35] Toni: Mensaje vacío
[18/4/22, 11:35:36] Ester: Mensaje real
[18/4/22, 11:35:37] User: Otro mensaje`;

  const parser = new WhatsappParser(content);
  const messages = parser.getMessages();

  // Should handle gracefully
  assert.ok(messages.length >= 1);
});

test('Integration: Chronological Order Preserved', async () => {
  const content = `[18/4/22, 11:35:35] User1: Mensaje 1
[18/4/22, 11:35:36] User2: Mensaje 2
[18/4/22, 11:35:34] User3: Mensaje 3
[18/4/22, 11:35:37] User4: Mensaje 4`;

  const parser = new WhatsappParser(content);
  const messages = parser.getMessages();

  const fragmenter = new MonthFragmenter(messages);
  fragmenter.fragment();
  const fragments = Array.from(fragmenter.getFragments());

  const monthMessages = fragments[0][1];
  for (let i = 1; i < monthMessages.length; i++) {
    assert.ok(
      monthMessages[i].timestamp >= monthMessages[i - 1].timestamp,
      'Messages should be in chronological order'
    );
  }
});

test('Integration: Large File Performance', async () => {
  // Generate 1000 messages
  let content = '';
  for (let i = 0; i < 1000; i++) {
    const day = String((i % 28) + 1).padStart(2, '0');
    const hour = String(Math.floor(i / 42) % 24).padStart(2, '0');
    const minute = String((i * 7) % 60).padStart(2, '0');
    content += `[18/${day}/22, ${hour}:${minute}:00] User${i % 10}: Mensaje ${i}\n`;
  }

  const start = Date.now();
  const parser = new WhatsappParser(content);
  parser.skipSystemMessages = false;
  parser.skipMediaMessages = false;
  const messages = parser.getMessages();
  const end = Date.now();

  assert.strictEqual(messages.length, 1000, 'Should parse all 1000 messages');
  assert.ok(end - start < 5000, `Parsing should complete in < 5 seconds, took ${end - start}ms`);
});

test('Integration: Different Language Detection', async () => {
  const spanishContent = `[18/4/22, 11:35:35] User: Mensaje en español`;
  const englishContent = `[4/18/22, 11:35:35 AM] User: Message in English`;

  const spanishParser = new WhatsappParser(spanishContent);
  const spanishFormat = spanishParser.detectFormat();

  const englishParser = new WhatsappParser(englishContent);
  const englishFormat = englishParser.detectFormat();

  assert.strictEqual(spanishFormat, 'es-ES');
  assert.strictEqual(englishFormat, 'en-US');
});

test('Integration: Consecutive System Messages', async () => {
  const content = `[18/4/22, 11:35:35] Toni: ‎Bloqueaste a este contacto
[18/4/22, 11:35:36] Toni: ‎Desbloqueaste a este contacto
[18/4/22, 11:35:37] Toni: Hola, este es un mensaje real
[18/4/22, 11:35:38] Toni: ‎imagen omitida
[18/4/22, 11:35:39] Toni: Otro mensaje real`;

  const parser = new WhatsappParser(content);
  parser.skipSystemMessages = true;
  parser.skipMediaMessages = true;
  const messages = parser.getMessages();

  assert.strictEqual(messages.length, 2, 'Should filter system/media messages');
  assert.strictEqual(messages[0].content, 'Hola, este es un mensaje real');
  assert.strictEqual(messages[1].content, 'Otro mensaje real');
});
