const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 8080;
const APP_ROOT = __dirname;
const WORKSPACE_ROOT = path.dirname(__dirname);

const server = http.createServer((req, res) => {
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

        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                console.error(`Error leyendo ${filePath}:`, err.message);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Archivo no encontrado: ' + err.message);
                return;
            }

            let contentType = 'text/plain';
            if (filePath.endsWith('.json')) contentType = 'application/json';
            if (filePath.endsWith('.js')) contentType = 'application/javascript';
            if (filePath.endsWith('.html')) contentType = 'text/html';
            if (filePath.endsWith('.css')) contentType = 'text/css';
            if (filePath.endsWith('.md')) contentType = 'text/markdown';
            if (filePath.endsWith('.xml')) contentType = 'application/xml';
            if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) contentType = 'text/yaml';

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
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
