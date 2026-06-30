const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const PORT = 8080;
const APP_ROOT = __dirname;
const WORKSPACE_ROOT = path.dirname(__dirname);

// Helper function to cache images to public folder
function getCacheImagePath(filePath) {
    const hash = crypto.createHash('md5').update(filePath).digest('hex');
    const ext = path.extname(filePath);
    const cachePath = path.join(APP_ROOT, 'public', `img_${hash}${ext}`);

    // Copy if not exists
    if (!fs.existsSync(cachePath)) {
        try {
            fs.copyFileSync(filePath, cachePath);
        } catch (e) {
            console.error('Cache copy error:', e.message);
        }
    }

    return `/public/img_${hash}${ext}`;
}

const server = http.createServer((req, res) => {
    // Ruta para copiar archivos a public folder
    if (req.url.startsWith('/copy-to-public/')) {
        const relativePath = decodeURIComponent(req.url.substring('/copy-to-public/'.length));
        const originalPath = path.normalize(path.join(WORKSPACE_ROOT, relativePath));
        const normalizedRoot = path.normalize(WORKSPACE_ROOT);

        console.log(`[copy-to-public] URL: ${req.url}`);
        console.log(`[copy-to-public] Decoded path: ${relativePath}`);
        console.log(`[copy-to-public] Full path: ${originalPath}`);
        console.log(`[copy-to-public] File exists: ${fs.existsSync(originalPath)}`);

        if (!originalPath.startsWith(normalizedRoot)) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Access denied' }));
            return;
        }

        // Generate cache path
        const hash = crypto.createHash('md5').update(originalPath).digest('hex');
        const ext = path.extname(originalPath);
        const publicFileName = `cache_${hash}${ext}`;
        const cachePath = path.join(APP_ROOT, 'public', publicFileName);

        // Copy file if not cached
        try {
            if (!fs.existsSync(cachePath)) {
                fs.copyFileSync(originalPath, cachePath);
                console.log(`Copied to public: ${originalPath}`);
            }

            const responseData = JSON.stringify({ publicPath: `/public/${publicFileName}` });
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(responseData, 'utf8')
            });
            res.end(responseData);
        } catch (err) {
            console.error('Copy error:', err.message);
            const errorData = JSON.stringify({ error: err.message });
            res.writeHead(500, {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(errorData, 'utf8')
            });
            res.end(errorData);
        }
        return;
    }

    // Ruta para servir imágenes cacheadas
    if (req.url.startsWith('/image-cache/')) {
        const relativePath = decodeURIComponent(req.url.substring('/image-cache/'.length));
        const originalPath = path.normalize(path.join(WORKSPACE_ROOT, relativePath));
        const normalizedRoot = path.normalize(WORKSPACE_ROOT);

        if (!originalPath.startsWith(normalizedRoot)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Access denied');
            return;
        }

        // Generate cache path
        const hash = crypto.createHash('md5').update(originalPath).digest('hex');
        const ext = path.extname(originalPath);
        const cachePath = path.join(APP_ROOT, 'public', `cache_${hash}${ext}`);

        // Copy file if not cached
        if (!fs.existsSync(cachePath)) {
            try {
                fs.copyFileSync(originalPath, cachePath);
                console.log(`Cached image: ${originalPath}`);
            } catch (e) {
                console.error('Cache error:', e.message);
            }
        }

        // Serve cached file
        fs.readFile(cachePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }

            let contentType = 'application/octet-stream';
            if (cachePath.endsWith('.png')) contentType = 'image/png';
            if (cachePath.endsWith('.jpg') || cachePath.endsWith('.jpeg')) contentType = 'image/jpeg';
            if (cachePath.endsWith('.gif')) contentType = 'image/gif';
            if (cachePath.endsWith('.svg')) contentType = 'image/svg+xml';
            if (cachePath.endsWith('.webp')) contentType = 'image/webp';

            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': data.length,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=86400'
            });
            res.end(data);
        });
        return;
    }

    // Ruta para servir archivos públicos
    if (req.url.startsWith('/public/')) {
        const filePath = path.join(APP_ROOT, 'public', req.url.substring('/public/'.length));
        const normalizedPath = path.normalize(filePath);
        const normalizedRoot = path.normalize(path.join(APP_ROOT, 'public'));

        if (!normalizedPath.startsWith(normalizedRoot)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Acceso denegado');
            return;
        }

        fs.readFile(normalizedPath, null, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('No encontrado');
                return;
            }

            let contentType = 'application/octet-stream';
            if (normalizedPath.endsWith('.png')) contentType = 'image/png';
            if (normalizedPath.endsWith('.jpg') || normalizedPath.endsWith('.jpeg')) contentType = 'image/jpeg';
            if (normalizedPath.endsWith('.gif')) contentType = 'image/gif';
            if (normalizedPath.endsWith('.svg')) contentType = 'image/svg+xml';
            if (normalizedPath.endsWith('.webp')) contentType = 'image/webp';

            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': data.length,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
            });
            res.end(data);
        });
        return;
    }

    // Ruta para rescanear el workspace
    if (req.url === '/rescan') {
        res.writeHead(200, { 'Content-Type': 'application/json' });

        try {
            execSync('node .workspace_app/scan-workspace.js', { cwd: WORKSPACE_ROOT });

            const jsonPath = path.join(APP_ROOT, 'workspace-data.json');
            const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

            res.end(JSON.stringify(data));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error al rescanear workspace' }));
        }
        return;
    }

    // Ruta para caché de archivos con caracteres especiales
    if (req.url.startsWith('/cache-file/')) {
        const relativePath = decodeURIComponent(req.url.substring('/cache-file/'.length));
        const originalPath = path.normalize(path.join(WORKSPACE_ROOT, relativePath));
        const normalizedRoot = path.normalize(WORKSPACE_ROOT);

        if (!originalPath.startsWith(normalizedRoot)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Acceso denegado');
            return;
        }

        // Leer archivo binario directamente
        fs.readFile(originalPath, (err, data) => {
            if (err) {
                console.error(`Error reading: ${originalPath}`, err.message);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not found');
                return;
            }

            let contentType = 'application/octet-stream';
            if (originalPath.endsWith('.png')) contentType = 'image/png';
            if (originalPath.endsWith('.jpg') || originalPath.endsWith('.jpeg')) contentType = 'image/jpeg';
            if (originalPath.endsWith('.gif')) contentType = 'image/gif';
            if (originalPath.endsWith('.svg')) contentType = 'image/svg+xml';
            if (originalPath.endsWith('.webp')) contentType = 'image/webp';

            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': data.length,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=3600'
            });

            res.end(data);
        });
        return;
    }

    // Ruta para servir archivos del workspace
    if (req.url.startsWith('/workspace-files/')) {
        const relativePath = decodeURIComponent(req.url.substring('/workspace-files/'.length));
        const filePath = path.normalize(path.join(WORKSPACE_ROOT, relativePath));
        const normalizedRoot = path.normalize(WORKSPACE_ROOT);

        // Validar que el path está dentro del workspace
        if (!filePath.startsWith(normalizedRoot)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Acceso denegado');
            return;
        }

        // Detectar si es una imagen (requiere lectura binaria)
        const isImage = /\.(png|jpg|jpeg|gif|svg|webp|ico|bmp)$/i.test(filePath);

        // Para imágenes, leer como binary; para texto, leer como utf-8
        const encoding = isImage ? null : 'utf-8';

        if (isImage) {
            // Para imágenes, usar stream
            let contentType = 'application/octet-stream';
            if (filePath.endsWith('.png')) contentType = 'image/png';
            if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
            if (filePath.endsWith('.gif')) contentType = 'image/gif';
            if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';
            if (filePath.endsWith('.webp')) contentType = 'image/webp';
            if (filePath.endsWith('.ico')) contentType = 'image/x-icon';
            if (filePath.endsWith('.bmp')) contentType = 'image/bmp';

            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(`Error leyendo ${filePath}:`, err.message);
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Archivo no encontrado');
                    return;
                }

                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Content-Length': stats.size,
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                });

                const stream = fs.createReadStream(filePath);
                stream.pipe(res);
                stream.on('error', (err) => {
                    console.error('Stream error:', err);
                    res.end();
                });
            });
        } else {
            // Para texto, usar readFile
            fs.readFile(filePath, encoding, (err, data) => {
                if (err) {
                    console.error(`Error leyendo ${filePath}:`, err.message);
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Archivo no encontrado: ' + err.message);
                    return;
                }

                let contentType = 'text/plain';
                // Tipos de texto
                if (filePath.endsWith('.json')) contentType = 'application/json';
                if (filePath.endsWith('.js')) contentType = 'application/javascript';
                if (filePath.endsWith('.html')) contentType = 'text/html';
                if (filePath.endsWith('.css')) contentType = 'text/css';
                if (filePath.endsWith('.md')) contentType = 'text/markdown';
                if (filePath.endsWith('.xml')) contentType = 'application/xml';
                if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) contentType = 'text/yaml';

                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                });
                res.end(data);
            });
        }
        return;
    }

    const filePath = path.join(APP_ROOT, req.url === '/' ? 'index.html' : req.url);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - Archivo no encontrado');
            return;
        }

        let contentType = 'text/html';
        if (filePath.endsWith('.json')) contentType = 'application/json';
        if (filePath.endsWith('.js')) contentType = 'application/javascript';
        if (filePath.endsWith('.css')) contentType = 'text/css';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`\n✅ Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`\nAbre tu navegador y ve a: http://localhost:${PORT}\n`);
});
