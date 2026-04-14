import fs from 'fs';
import readline from 'readline';

async function extractTables() {
  const fileStream = fs.createReadStream('campusbull_main.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const tables = new Set();
  let lineCount = 0;

  for await (const line of rl) {
    if (line.toUpperCase().includes('CREATE TABLE')) {
      const match = line.match(/CREATE TABLE\s+(IF NOT EXISTS\s+)?[`"']?([a-zA-Z0-9_]+)[`"']?/i);
      if (match && match[2]) {
        tables.add(match[2]);
      }
    }
    lineCount++;
    if (lineCount % 1000000 === 0) {
        console.log(`Processed ${lineCount} lines... Found ${tables.size} tables.`);
    }
  }

  console.log('--- ALL TABLES ---');
  console.log(Array.from(tables).sort().join('\n'));
}

extractTables().catch(console.error);
