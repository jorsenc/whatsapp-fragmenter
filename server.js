const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const WORKSPACE_ROOT = __dirname;

const server = http.createServer((req, res) => {
    const filePath = path.join(WORKSPACE_ROOT, req.url === '/' ? 'index.html' : req.url);

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
