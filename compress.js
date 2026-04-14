import fs from 'fs';
import zlib from 'zlib';

console.log('Starting compression...');
const input = fs.createReadStream('campusbull_main.sql');
const output = fs.createWriteStream('campusbull_main.sql.gz');
const gzip = zlib.createGzip();

input.pipe(gzip).pipe(output).on('finish', () => {
    const stats = fs.statSync('campusbull_main.sql.gz');
    console.log(`Compression successful. Original size: 355MB. New size: ${(stats.size / (1024 * 1024)).toFixed(2)}MB`);
});
