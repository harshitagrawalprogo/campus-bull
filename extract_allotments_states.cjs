const fs = require('fs');
const sql = fs.readFileSync('d:\\campus bull\\campusbull_main.sql', 'utf-8');

const regex = /INSERT INTO `allotments` [^\n]+\nVALUES ([^;]+);/g;
let match;
const states = new Set();
while ((match = regex.exec(sql)) !== null) {
    const valuesStr = match[1];
    // Split by ),( to get rows
    const rows = valuesStr.split(/\),\s*\(/);
    for (let row of rows) {
        // Remove leading ( and trailing )
        row = row.replace(/^\(/, '').replace(/\)$/, '');
        // Split by comma. This is simple, assuming no commas inside strings
        // Actually, let's use a regex to parse CSV-like
        const cols = row.split(/,(?=(?:(?:[^']*'){2})*[^']*$)/);
        if (cols.length > 2) {
            const stateName = cols[2].replace(/'/g, '').trim();
            states.add(stateName);
        }
    }
}
console.log(JSON.stringify(Array.from(states).sort(), null, 2));
