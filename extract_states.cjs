const fs = require('fs');

const sql = fs.readFileSync('d:\\campus bull\\campusbull_main.sql', 'utf-8');

const stateRegex = /INSERT INTO `Allotment` [^\n]+\nVALUES \([^,]+,\s*'[^']+',\s*'[^']+',\s*'([^']+)'/g;

const states = new Set();
let match;
while ((match = stateRegex.exec(sql)) !== null) {
    states.add(match[1]);
}

console.log(Array.from(states).sort());
