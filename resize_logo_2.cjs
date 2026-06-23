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
        
        // Increase w-8 h-8 to w-12 h-12
        content = content.replace(/<img src="\/logo\.svg" className="([^"]*)w-8 h-8([^"]*)"/g, '<img src="/logo.svg" className="$1w-12 h-12$2"');
        // Increase w-10 h-10 to w-14 h-14
        content = content.replace(/<img src="\/logo\.svg" className="([^"]*)w-10 h-10([^"]*)"/g, '<img src="/logo.svg" className="$1w-14 h-14$2"');
        // Increase w-16 h-16 to w-24 h-24
        content = content.replace(/<img src="\/logo\.svg" className="([^"]*)w-16 h-16([^"]*)"/g, '<img src="/logo.svg" className="$1w-24 h-24$2"');

        fs.writeFileSync(fullPath, content);
        console.log(`Updated sizes in ${file}`);
    }
});
