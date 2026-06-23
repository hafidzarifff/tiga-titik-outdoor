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
        
        // We only want to target <img src="/logo.svg" ... />
        // Replace w-5 h-5 with w-8 h-8
        content = content.replace(/<img src="\/logo\.svg" className="([^"]*)w-5 h-5([^"]*)"/g, '<img src="/logo.svg" className="$1w-8 h-8$2"');
        // Replace w-6 h-6 with w-10 h-10
        content = content.replace(/<img src="\/logo\.svg" className="([^"]*)w-6 h-6([^"]*)"/g, '<img src="/logo.svg" className="$1w-10 h-10$2"');
        // Replace w-12 h-12 with w-16 h-16
        content = content.replace(/<img src="\/logo\.svg" className="([^"]*)w-12 h-12([^"]*)"/g, '<img src="/logo.svg" className="$1w-16 h-16$2"');

        fs.writeFileSync(fullPath, content);
        console.log(`Updated sizes in ${file}`);
    }
});
