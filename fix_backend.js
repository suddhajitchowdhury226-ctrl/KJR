const fs = require('fs');
const path = require('path');

const apiPath = '/Users/suddhajit21/Documents/KJR/backend/routes/api.js';
let content = fs.readFileSync(apiPath, 'utf8');

// Change from upload.array('attachment', 5) to upload.any() so it accepts any file field names
content = content.replace("upload.array('attachment', 5)", "upload.any()");

fs.writeFileSync(apiPath, content);
console.log('Backend fixed');
