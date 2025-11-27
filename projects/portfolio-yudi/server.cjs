const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
    // Parse URL
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // Get file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Read and serve file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                // Server error
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('\x1b[36m%s\x1b[0m', '='.repeat(50));
    console.log('\x1b[32m%s\x1b[0m', '🚀 Portfolio Server Running!');
    console.log('\x1b[36m%s\x1b[0m', '='.repeat(50));
    console.log('');
    console.log('\x1b[33m%s\x1b[0m', `📍 Local:   http://localhost:${PORT}`);
    console.log('\x1b[33m%s\x1b[0m', `📍 Network: http://0.0.0.0:${PORT}`);
    console.log('');
    console.log('\x1b[90m%s\x1b[0m', 'Press CTRL+C to stop the server');
    console.log('\x1b[36m%s\x1b[0m', '='.repeat(50));
});
