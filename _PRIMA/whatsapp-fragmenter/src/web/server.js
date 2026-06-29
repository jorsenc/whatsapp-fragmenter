/**
 * WhatsApp Fragmenter - Express Web Server
 * Serves the web UI and handles file uploads/processing
 */

import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import WhatsappParser from '../parser/whatsappParser.js';
import MonthFragmenter from '../fragmenter/monthFragmenter.js';
import MarkdownGenerator from '../generators/markdownGenerator.js';
import IndexGenerator from '../generators/indexGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const OUTPUT_DIR = process.env.OUTPUT_DIR || './output';

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(express.static(path.join(__dirname, '../../public')));

// In-memory storage for uploads (temporary)
const uploads = new Map();

/**
 * GET / - Serve main page
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

/**
 * POST /api/upload - Handle file upload
 */
app.post('/api/upload', async (req, res) => {
  try {
    const { filename, content } = req.body;

    if (!filename || !content) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing filename or content'
      });
    }

    // Validate file size (max 2GB)
    const maxSize = process.env.MAX_FILE_SIZE || 2147483648;
    if (content.length > maxSize) {
      return res.status(413).json({
        status: 'error',
        message: `File too large. Maximum: ${(maxSize / 1024 / 1024 / 1024).toFixed(2)}GB`
      });
    }

    // Generate upload ID
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store upload temporarily
    uploads.set(uploadId, {
      filename,
      content,
      uploadedAt: new Date(),
      status: 'pending'
    });

    // Clean up old uploads (older than 1 hour)
    for (const [id, upload] of uploads.entries()) {
      if (Date.now() - upload.uploadedAt > 3600000) {
        uploads.delete(id);
      }
    }

    // Detect format
    try {
      const parser = new WhatsappParser(content);
      const format = parser.detectFormat();
      const info = parser.getFormatInfo();

      return res.json({
        status: 'success',
        uploadId,
        filename,
        format,
        messageCount: info.messageCount,
        uniqueUsers: info.uniqueUsers,
        size: content.length
      });
    } catch (error) {
      uploads.delete(uploadId);
      return res.status(400).json({
        status: 'error',
        message: `Format detection failed: ${error.message}`
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during upload'
    });
  }
});

/**
 * POST /api/process - Process uploaded file
 */
app.post('/api/process', async (req, res) => {
  try {
    const { uploadId, options = {} } = req.body;

    if (!uploadId || !uploads.has(uploadId)) {
      return res.status(404).json({
        status: 'error',
        message: 'Upload not found'
      });
    }

    const upload = uploads.get(uploadId);
    const { content, filename } = upload;

    // Extract base name from filename (without extension)
    const baseName = filename.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_');

    // Create output directory
    const outputDir = path.join(OUTPUT_DIR, `output_${baseName}`);
    await fs.mkdir(outputDir, { recursive: true });

    // Parse options
    const skipSystem = options.skipSystem !== false;
    const skipMedia = options.skipMedia !== false;

    // Process
    const parser = new WhatsappParser(content);
    parser.skipSystemMessages = skipSystem;
    parser.skipMediaMessages = skipMedia;

    const messages = parser.getMessages();

    // Fragment by month
    const fragmenter = new MonthFragmenter(messages);
    fragmenter.fragment();
    const fragments = fragmenter.getFragments();

    // Generate Markdown files
    const fragmentFiles = [];

    for (const [month, monthMessages] of fragments) {
      const generator = new MarkdownGenerator(monthMessages);
      const markdown = generator.generate();

      const filename = `chat_${month}.md`;
      const filepath = path.join(outputDir, filename);

      // Save to disk
      await fs.writeFile(filepath, markdown, 'utf-8');

      fragmentFiles.push({
        name: filename,
        month,
        lines: monthMessages.length,
        size: Math.round(markdown.length / 1024),
        content: markdown
      });
    }

    // Generate index
    const indexGen = new IndexGenerator(fragmentFiles.map(f => ({
      name: f.name,
      month: f.month,
      lines: f.lines,
      size: f.size
    })));

    const indexMarkdown = indexGen.generate();
    const indexPath = path.join(outputDir, 'INDICE_FRAGMENTOS.md');
    await fs.writeFile(indexPath, indexMarkdown, 'utf-8');

    // Create ZIP file
    const zipFilename = `fragmentos_${baseName}.zip`;
    const zipPath = path.join(OUTPUT_DIR, zipFilename);

    await createZipFile(outputDir, zipPath);

    // Update upload status
    upload.status = 'completed';
    upload.fragmentCount = fragmentFiles.length;
    upload.totalMessages = messages.length;
    upload.outputDir = outputDir;
    upload.zipPath = zipPath;
    upload.zipFilename = zipFilename;

    res.json({
      status: 'success',
      uploadId,
      fragmentCount: fragmentFiles.length,
      totalMessages: messages.length,
      files: fragmentFiles.map(f => ({
        name: f.name,
        month: f.month,
        lines: f.lines,
        size: f.size
      })),
      indexFile: 'INDICE_FRAGMENTOS.md',
      zipFile: zipFilename,
      outputDir: outputDir
    });

  } catch (error) {
    console.error('Process error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * Create ZIP file from directory
 */
async function createZipFile(sourceDir, destPath) {
  return new Promise((resolve, reject) => {
    const output = fsSync.createWriteStream(destPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);
    output.on('error', reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

/**
 * GET /api/download-zip/:uploadId - Download ZIP with all fragments
 */
app.get('/api/download-zip/:uploadId', (req, res) => {
  try {
    const { uploadId } = req.params;

    if (!uploads.has(uploadId)) {
      return res.status(404).json({
        status: 'error',
        message: 'Upload not found'
      });
    }

    const upload = uploads.get(uploadId);

    if (!upload.zipPath || !fsSync.existsSync(upload.zipPath)) {
      return res.status(404).json({
        status: 'error',
        message: 'ZIP file not found'
      });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${upload.zipFilename}"`);
    res.setHeader('Content-Type', 'application/zip');

    const stream = fsSync.createReadStream(upload.zipPath);
    stream.pipe(res);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during download'
    });
  }
});

/**
 * GET /api/download/:uploadId/:filename - Download processed file
 */
app.get('/api/download/:uploadId/:filename', (req, res) => {
  try {
    const { uploadId, filename } = req.params;

    if (!uploads.has(uploadId)) {
      return res.status(404).json({
        status: 'error',
        message: 'Upload not found'
      });
    }

    // Note: In this simple implementation, we store content in memory
    // For production, save to disk and serve from there
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');

    // Regenerate file on demand (stateless)
    const upload = uploads.get(uploadId);
    const { content } = upload;

    const parser = new WhatsappParser(content);
    const messages = parser.getMessages();

    const fragmenter = new MonthFragmenter(messages);
    fragmenter.fragment();
    const fragments = fragmenter.getFragments();

    // Find the requested fragment
    for (const [month, monthMessages] of fragments) {
      if (filename === `chat_${month}.md`) {
        const generator = new MarkdownGenerator(monthMessages);
        const markdown = generator.generate();
        return res.send(markdown);
      }
    }

    // Check for index file
    if (filename === 'INDICE_FRAGMENTOS.md') {
      const fragmentFiles = [];
      for (const [month, monthMessages] of fragments) {
        const generator = new MarkdownGenerator(monthMessages);
        const markdown = generator.generate();
        fragmentFiles.push({
          name: `chat_${month}.md`,
          month,
          lines: monthMessages.length,
          size: Math.round(markdown.length / 1024)
        });
      }

      const indexGen = new IndexGenerator(fragmentFiles);
      const indexMarkdown = indexGen.generate();
      return res.send(indexMarkdown);
    }

    res.status(404).json({
      status: 'error',
      message: 'File not found'
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during download'
    });
  }
});

/**
 * GET /api/status/:uploadId - Get upload status
 */
app.get('/api/status/:uploadId', (req, res) => {
  const { uploadId } = req.params;

  if (!uploads.has(uploadId)) {
    return res.status(404).json({
      status: 'error',
      message: 'Upload not found'
    });
  }

  const upload = uploads.get(uploadId);

  res.json({
    uploadId,
    filename: upload.filename,
    status: upload.status,
    uploadedAt: upload.uploadedAt,
    fragmentCount: upload.fragmentCount || 0,
    totalMessages: upload.totalMessages || 0
  });
});

/**
 * GET /api/health - Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not found'
  });
});

/**
 * Start server
 */
const server = app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════╗
║   WhatsApp Chat Fragmenter - Web UI    ║
╚════════════════════════════════════════╝

Server running on: http://${HOST}:${PORT}

🚀 API Endpoints:
  GET  /                     Main page
  POST /api/upload           Upload file
  POST /api/process          Process upload
  GET  /api/download/:id/:f  Download file
  GET  /api/status/:id       Get status
  GET  /api/health           Health check

📁 Output directory: ${path.resolve(OUTPUT_DIR)}

Press Ctrl+C to stop the server
  `);
});

/**
 * Graceful shutdown
 */
process.on('SIGINT', () => {
  console.log('\n\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
