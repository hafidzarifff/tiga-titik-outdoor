const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'resources/js/Layouts/ClientLayout.jsx',
    'resources/js/Layouts/AdminLayout.jsx',
    'resources/js/Pages/Admin/Auth/Login.jsx',
    'resources/js/Pages/Client/Auth/Login.jsx',
    'resources/js/Pages/Client/Auth/Register.jsx',
    'resources/js/Pages/Client/Profile/Index.jsx',
    'resources/js/Pages/Client/Booking/Create.jsx',
];

const basePath = 'd:\\uika\\semester6\\manajemen proyek\\tiga-titik-outdoor';

filesToUpdate.forEach(file => {
    const fullPath = path.join(basePath, file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        // Replace <Tent className="..." /> with <img src="/logo.svg" className="..." alt="Logo" />
        // Also handling possible self-closing without space or multiple props
        content = content.replace(/<Tent\s+className=(["{].*?["}])\s*\/>/g, '<img src="/logo.svg" className=$1 alt="Logo" />');
        content = content.replace(/<Tent\s*\/>/g, '<img src="/logo.svg" className="w-6 h-6" alt="Logo" />'); // fallback
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${file}`);
    }
});

// Update app.blade.php
const appBladePath = path.join(basePath, 'resources/views/app.blade.php');
if (fs.existsSync(appBladePath)) {
    let content = fs.readFileSync(appBladePath, 'utf8');
    if (!content.includes('logo.svg')) {
        content = content.replace('</head>', '    <link rel="icon" type="image/svg+xml" href="/logo.svg" />\n        <link rel="shortcut icon" href="/logo.svg" />\n    </head>');
        fs.writeFileSync(appBladePath, content);
        console.log(`Updated app.blade.php`);
    }
}

// Update welcome.blade.php
const welcomeBladePath = path.join(basePath, 'resources/views/welcome.blade.php');
if (fs.existsSync(welcomeBladePath)) {
    let content = fs.readFileSync(welcomeBladePath, 'utf8');
    if (!content.includes('logo.svg')) {
        content = content.replace('</head>', '    <link rel="icon" type="image/svg+xml" href="/logo.svg" />\n        <link rel="shortcut icon" href="/logo.svg" />\n    </head>');
        
        // Let's replace the inline SVGs that are used as logos in welcome.blade.php
        // It's a bit hard to regex replace complex multiline SVGs, so we will look for <svg ...>...</svg> blocks
        // that have the specific orange logo classes or just replace all SVG tags that don't look like small icons.
        // For welcome blade, we'll replace specific strings if they are huge SVGs.
        // Actually, we can use a more surgical replace using the tool for welcome.blade.php later.
        
        fs.writeFileSync(welcomeBladePath, content);
        console.log(`Updated welcome.blade.php favicon`);
    }
}

