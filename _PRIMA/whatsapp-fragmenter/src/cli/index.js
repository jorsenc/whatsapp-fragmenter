#!/usr/bin/env node

/**
 * WhatsApp Chat Fragmenter - CLI Entry Point
 * Usage: node src/cli/index.js <input-file> [options]
 */

import fs from 'fs/promises';
import path from 'path';
import WhatsappParser from '../parser/whatsappParser.js';
import MonthFragmenter from '../fragmenter/monthFragmenter.js';
import MarkdownGenerator from '../generators/markdownGenerator.js';
import IndexGenerator from '../generators/indexGenerator.js';

const VERSION = '1.0.0';

/**
 * Parse command-line arguments
 */
function parseArgs(args) {
  const options = {
    input: null,
    output: './output',
    skipSystem: true,
    skipMedia: true,
    force: false,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }

    if (arg === '--version' || arg === '-v') {
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        // This is --verbose not --version (special handling)
        options.verbose = true;
      } else {
        console.log(`WhatsApp Fragmenter v${VERSION}`);
        process.exit(0);
      }
    }

    if (arg === '-o' || arg === '--output') {
      options.output = args[++i];
      continue;
    }

    if (arg === '-f' || arg === '--force') {
      options.force = true;
      continue;
    }

    if (arg === '-s' || arg === '--skip-system') {
      options.skipSystem = true;
      continue;
    }

    if (arg === '-i' || arg === '--skip-media') {
      options.skipMedia = true;
      continue;
    }

    if (arg === '-v' || arg === '--verbose') {
      options.verbose = true;
      continue;
    }

    if (!arg.startsWith('-')) {
      options.input = arg;
    }
  }

  return options;
}

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // Validate input file
  if (!options.input) {
    console.error('❌ Error: No input file specified');
    showHelp();
    process.exit(1);
  }

  try {
    // Read file
    if (options.verbose) console.log(`📖 Leyendo: ${options.input}`);
    const content = await fs.readFile(options.input, 'utf-8');
    if (options.verbose) console.log(`   ${content.length} bytes`);

    // Detect format
    if (options.verbose) console.log('🔍 Detectando formato...');
    const parser = new WhatsappParser(content);
    parser.skipSystemMessages = options.skipSystem;
    parser.skipMediaMessages = options.skipMedia;

    const format = parser.detectFormat();
    if (options.verbose) console.log(`   ✓ Formato detectado: ${format}`);

    // Parse messages
    if (options.verbose) console.log('📝 Parseando mensajes...');
    const messages = parser.getMessages();
    if (options.verbose) {
      const stats = parser.getFormatInfo();
      console.log(`   ✓ ${stats.messageCount} mensajes parseados`);
      console.log(`   ✓ ${stats.uniqueUsers} usuarios únicos`);
    }

    // Fragment by month
    if (options.verbose) console.log('📅 Fragmentando por mes...');
    const fragmenter = new MonthFragmenter(messages);
    fragmenter.fragment();
    const fragments = fragmenter.getFragments();
    if (options.verbose) console.log(`   ✓ ${fragments.length} fragmentos creados`);

    // Validate fragmenter
    const validation = fragmenter.validate();
    if (!validation.isValid) {
      console.warn('⚠️  Fragmenter validation errors:');
      validation.errors.forEach(err => console.warn(`   - ${err}`));
    }

    // Create output directory
    await fs.mkdir(options.output, { recursive: true });

    // Generate Markdown files
    if (options.verbose) console.log('📝 Generando archivos Markdown...');
    const fragmentFiles = [];

    for (const [month, monthMessages] of fragments) {
      const generator = new MarkdownGenerator(monthMessages);
      const markdown = generator.generate();

      const filename = `chat_${month}.md`;
      const filepath = path.join(options.output, filename);

      // Check if file exists
      if (!options.force) {
        try {
          await fs.stat(filepath);
          console.warn(`⚠️  Archivo existe (omitiendo): ${filename}`);
          continue;
        } catch {
          // File doesn't exist, continue
        }
      }

      await fs.writeFile(filepath, markdown, 'utf-8');

      if (options.verbose) {
        console.log(`   ✓ ${filename} (${monthMessages.length} msgs, ${Math.round(markdown.length / 1024)}KB)`);
      }

      fragmentFiles.push({
        name: filename,
        month,
        lines: monthMessages.length,
        size: Math.round(markdown.length / 1024)
      });
    }

    // Generate index
    if (options.verbose) console.log('📋 Generando índice...');
    const indexGen = new IndexGenerator(fragmentFiles);
    const indexMarkdown = indexGen.generate();
    const indexPath = path.join(options.output, 'INDICE_FRAGMENTOS.md');
    await fs.writeFile(indexPath, indexMarkdown, 'utf-8');
    if (options.verbose) {
      const summary = indexGen.getSummary();
      console.log(`   ✓ ${summary.totalFragments} fragmentos indexados`);
      console.log(`   ✓ ${summary.totalMessages.toLocaleString()} mensajes totales`);
      console.log(`   ✓ ${summary.totalSize.toFixed(2)}MB tamaño total`);
    }

    // Success summary
    console.log('\n✅ ¡Éxito!');
    console.log(`   Fragmentos generados: ${fragmentFiles.length}`);
    console.log(`   Ubicación: ${path.resolve(options.output)}`);
    console.log(`   Índice: ${indexPath}`);

    if (fragmentFiles.length === 0) {
      console.warn('\n⚠️  Advertencia: No se generaron archivos');
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (options.verbose) console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
WhatsApp Chat Fragmenter v${VERSION}

Uso:
  node src/cli/index.js <archivo-entrada> [opciones]

Opciones:
  -o, --output <dir>    Directorio de salida (default: ./output)
  -s, --skip-system     Ignorar mensajes de sistema (default: true)
  -i, --skip-media      Ignorar multimedia (default: true)
  -f, --force           Sobrescribir archivos existentes
  -v, --verbose         Mostrar progreso detallado
  --help                Mostrar esta ayuda
  --version             Mostrar versión

Ejemplos:
  node src/cli/index.js chat.txt
  node src/cli/index.js chat.txt -o ./chats -v
  node src/cli/index.js chat.txt -f --skip-system
  `);
}

// Run CLI
main().catch(console.error);
