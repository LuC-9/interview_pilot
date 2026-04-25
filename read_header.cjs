const fs = require('fs');
const content = fs.readFileSync('lc-company/google/all.csv', 'utf8');
const lines = content.split('\n');
console.log(lines[0]);
console.log(lines[1]);
