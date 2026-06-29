const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const chokidar = require('chokidar');

const PORT = 8080;
const ROOT_DIR = __dirname;
const IGNORE_FILE = path.join(ROOT_DIR, '.ignore_list.json');

// Cargar lista de ignorados
function loadIgnoreList() {
    if (fs.existsSync(IGNORE_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(IGNORE_FILE, 'utf8'));
        } catch (e) {
            console.error("Error leyendo archivo de ignorados, reseteando...", e);
            return [];
        }
    }
    return [];
}

// Guardar lista de ignorados
function saveIgnoreList(list) {
    fs.writeFileSync(IGNORE_FILE, JSON.stringify(list, null, 2));
}

// Función para construir el árbol de directorios recursivamente
function getFileTree(dir, relativePath = '') {
    const ignoreList = loadIgnoreList();
    try {
        const items = fs.readdirSync(dir);
        const children = items
            .filter(item => {
                const fullRelPath = path.join(relativePath, item).replace(/\\/g, '/');
                return item !== 'node_modules' && 
                       !item.startsWith('.git') && 
                       !ignoreList.includes(fullRelPath);
            })
            .map(item => {
                const fullPath = path.join(dir, item);
                const relPath = path.join(relativePath, item).replace(/\\/g, '/');
                const stats = fs.statSync(fullPath);

                if (stats.isDirectory()) {
                    return {
                        name: item,
                        path: relPath,
                        type: 'folder',
                        children: getFileTree(fullPath, relPath)
                    };
                } else {
                    return { name: item, path: relPath, type: 'file' };
                }
            });
        return children;
    } catch (e) {
        console.error("Error leyendo directorio:", e);
        return [];
    }
}

// Servidor HTTP
const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(ROOT_DIR, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        const filePath = path.join(ROOT_DIR, req.url);
        if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
            res.writeHead(200);
            fs.createReadStream(filePath).pipe(res);
        } else {
            res.writeHead(404);
            res.end('Not Found');
        }
    }
});

// Servidor WebSocket
const wss = new WebSocket.Server({ server });

function broadcastTree() {
    const tree = {
        name: "outletnina.com",
        path: ".",
        type: "folder",
        children: getFileTree(ROOT_DIR)
    };
    const data = JSON.stringify({ type: 'UPDATE_TREE', tree });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// Vigilar cambios
const watcher = chokidar.watch(ROOT_DIR, { 
    ignored: /(^|[\\]|\/)\.git(\/|$)/, 
    persistent: true,
    ignoreInitial: false 
});

watcher.on('all', (event, path) => {
    console.log(`Evento: ${event} en ${path}`);
    broadcastTree();
});

// Manejar mensajes de WebSocket
wss.on('connection', (ws) => {
    console.log('Cliente conectado');
    broadcastTree();

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'ADD_TO_IGNORE') {
            const ignoreList = loadIgnoreList();
            if (!ignoreList.includes(data.path)) {
                ignoreList.push(data.path);
                saveIgnoreList(ignoreList);
                console.log(`Añadido a ignorados: ${data.path}`);
                broadcastTree();
            }
        } else if (data.type === 'REMOVE_FROM_IGNORE') {
            let ignoreList = loadIgnoreList();
            ignoreList = ignoreList.filter(p => p !== data.path);
            saveIgnoreList(ignoreList);
            console.log(`Eliminado de ignorados: ${data.path}`);
            broadcastTree();
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});