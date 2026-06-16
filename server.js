const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Unipiel2026!';

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'catalogs.json');

// Default catalog links
const DEFAULT_CATALOGS = {
    hombre: 'https://drive.google.com/file/d/1rVgcGTXPgqWYqR9hundfxgWKIKAcFwdT/view',
    mujer: 'https://drive.google.com/file/d/1CbeCsjCflVtWTxHDLwOm9j6M5pZ2wOqe/view',
    accesorios: 'https://drive.google.com/file/d/1SCq8tLwwVa3aEUlmkVyzPqsviBHUYdrY/view'
};

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure data file exists with default values
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_CATALOGS, null, 2), 'utf8');
}

app.use(express.json());

// Security middleware to prevent access to server files, node_modules, and data folder
app.use((req, res, next) => {
    const requestedPath = decodeURIComponent(req.path).toLowerCase();
    
    const blockedPatterns = [
        '/server.js',
        '/package.json',
        '/package-lock.json',
        '/dockerfile',
        '/.dockerignore',
        '/.git',
        '/.gitignore',
        '/node_modules',
        '/data/'
    ];

    const isBlocked = blockedPatterns.some(pattern => {
        if (pattern.startsWith('/')) {
            // Check if it's the exact file or a path prefixing a file
            return requestedPath === pattern || requestedPath.startsWith(pattern + '/');
        }
        return requestedPath.includes(pattern);
    });

    if (isBlocked) {
        return res.status(403).send('Forbidden: Access is denied.');
    }
    next();
});

// Helper function to validate URLs securely
function isValidUrl(urlString) {
    try {
        const url = new URL(urlString);
        // Only allow HTTP and HTTPS protocols to prevent XSS (like javascript:alert(1))
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

// API endpoint to get the current catalog links
app.get('/api/catalogs', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading catalogs file:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        try {
            const catalogs = JSON.parse(data);
            res.json(catalogs);
        } catch (parseErr) {
            console.error('Error parsing catalogs JSON:', parseErr);
            res.status(500).json({ error: 'Failed to parse configuration' });
        }
    });
});

// API endpoint to update the catalog links
app.post('/api/catalogs', (req, res) => {
    const { password, hombre, mujer, accesorios } = req.body;

    // 1. Password verification
    if (!password || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // 2. Input validation
    if (!hombre || !mujer || !accesorios) {
        return res.status(400).json({ error: 'Todos los enlaces son requeridos' });
    }

    if (!isValidUrl(hombre) || !isValidUrl(mujer) || !isValidUrl(accesorios)) {
        return res.status(400).json({ error: 'Uno o más enlaces no son URLs válidas (deben empezar con http:// o https://)' });
    }

    const updatedCatalogs = { hombre, mujer, accesorios };

    // 3. Write securely to file
    fs.writeFile(DATA_FILE, JSON.stringify(updatedCatalogs, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing catalogs file:', err);
            return res.status(500).json({ error: 'No se pudo guardar la configuración' });
        }
        res.json({ success: true, message: 'Enlaces de catálogos actualizados correctamente' });
    });
});

// Serve static website files
app.use(express.static(__dirname));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
