const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace typical button and card roundings to give a new vibe
    // Buttons are often rounded-lg or rounded-2xl or rounded-xl
    // Cards might be rounded-[3rem]
    
    content = content.replace(/rounded-lg/g, 'rounded-full');
    content = content.replace(/rounded-xl/g, 'rounded-full');
    content = content.replace(/rounded-2xl/g, 'rounded-full');
    content = content.replace(/rounded-\[3rem\]/g, 'rounded-[40px]');
    
    // Also let's change the background colors from slate-900 to something deeper or more vibrant if any
    content = content.replace(/bg-slate-900/g, 'bg-black/60');
    content = content.replace(/bg-slate-950/g, 'bg-black/80');
    content = content.replace(/bg-slate-800/g, 'bg-black/40');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated shapes/bg in', filePath);
    }
  }
});
