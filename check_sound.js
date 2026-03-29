const fs = require('fs');
const filePath = 'c:/Users/DIVYANK BHARDWAJ/Desktop/Smart home system/public/sound.mp3';
const stats = fs.statSync(filePath);
console.log(`File size: ${stats.size} bytes`);
// We can't easily get duration without a library, but 200KB is usually a short 5-10s mp3 at 128kbps.
