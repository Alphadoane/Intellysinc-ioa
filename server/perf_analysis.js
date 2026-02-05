const fs = require('fs');
const path = require('path');

const dir = 'd:/New folder/public/images';

function getFiles(dir, allFiles) {
    const files = fs.readdirSync(dir);
    allFiles = allFiles || [];
    files.forEach(file => {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, allFiles);
        } else {
            const stats = fs.statSync(name);
            allFiles.push({ name, size: stats.size });
        }
    });
    return allFiles;
}

const allFiles = getFiles(dir);
allFiles.sort((a, b) => b.size - a.size);

console.log('Top 20 Largest Files in public/images:');
allFiles.slice(0, 20).forEach(file => {
    console.log(`${(file.size / 1024 / 1024).toFixed(2)} MB - ${file.name}`);
});

console.log('\nTotal images:', allFiles.length);
const totalSize = allFiles.reduce((acc, f) => acc + f.size, 0);
console.log('Total images size:', (totalSize / 1024 / 1024).toFixed(2), 'MB');
