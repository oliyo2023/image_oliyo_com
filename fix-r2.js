// Script to fix the remaining R2 issue
const fs = require('fs');

// Read the file
const filePath = 'E:/project/oliyo.com/src/lib/r2.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the backslash replacement line
content = content.replace(
    "sanitized = sanitized.replace(/\\\\/+/g, '/');",
    "sanitized = sanitized.replace(/\\/+/g, '/');"
);

fs.writeFileSync(filePath, content);
console.log('Fixed the backslash regex pattern in R2 file');