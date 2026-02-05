const fs = require('fs');
const path = require('path');

const srcDir = 'd:/New folder/src';
const publicImagesDir = 'd:/New folder/public/images';

// Get all files recursively
function getFiles(dir, allFiles = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, allFiles);
        } else {
            allFiles.push(name);
        }
    });
    return allFiles;
}

const srcFiles = getFiles(srcDir);
const publicImages = fs.readdirSync(publicImagesDir).filter(f => !fs.statSync(path.join(publicImagesDir, f)).isDirectory());

const content = srcFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');

const unused = [];
const used = [];

publicImages.forEach(img => {
    // Check if filename is mentioned in any source file
    if (content.includes(img)) {
        used.push(img);
    } else {
        unused.push(img);
    }
});

console.log(`Used images: ${used.length}`);
console.log(`Unused images: ${unused.length}`);

if (unused.length > 0) {
    console.log('\nTop 20 Unused Images by size:');
    const unusedWithStats = unused.map(img => {
        const stats = fs.statSync(path.join(publicImagesDir, img));
        return { name: img, size: stats.size };
    });
    unusedWithStats.sort((a, b) => b.size - a.size);
    unusedWithStats.slice(0, 20).forEach(f => {
        console.log(`${(f.size / 1024 / 1024).toFixed(2)} MB - ${f.name}`);
    });

    const totalUnusedSize = unusedWithStats.reduce((acc, f) => acc + f.size, 0);
    console.log(`\nTotal potentially unused size: ${(totalUnusedSize / 1024 / 1024).toFixed(2)} MB`);
}
