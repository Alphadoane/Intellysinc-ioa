const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const dir = 'd:/New folder/public/images';
const MAX_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_DIMENSION = 1920;

async function compressImage(filePath) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.size < MAX_SIZE) return;

        console.log(`Compressing: ${path.basename(filePath)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

        const image = await loadImage(filePath);
        let width = image.width;
        let height = image.height;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);

        const extension = path.extname(filePath).toLowerCase();
        let buffer;
        if (extension === '.jpg' || extension === '.jpeg') {
            buffer = canvas.toBuffer('image/jpeg', { quality: 0.7 });
        } else if (extension === '.png') {
            // For PNG, canvas standard compression is usually enough, but we can't easily tune quality like JPEG
            buffer = canvas.toBuffer('image/png');
        } else {
            console.log(`Skipping unsupported extension: ${extension}`);
            return;
        }

        fs.writeFileSync(filePath, buffer);
        const newStats = fs.statSync(filePath);
        console.log(`Done: ${(newStats.size / 1024 / 1024).toFixed(2)} MB (${((1 - newStats.size / stats.size) * 100).toFixed(1)}% reduction)`);
    } catch (err) {
        console.error(`Error compressing ${filePath}:`, err.message);
    }
}

async function run() {
    const files = fs.readdirSync(dir).map(f => path.join(dir, f));
    for (const file of files) {
        if (fs.statSync(file).isFile()) {
            await compressImage(file);
        }
    }
}

run();
