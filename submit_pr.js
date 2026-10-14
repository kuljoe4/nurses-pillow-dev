const fs = require('fs');

const desc = fs.readFileSync('pr_description.txt', 'utf8');
console.log(desc);
