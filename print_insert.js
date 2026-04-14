import fs from 'fs';
import readline from 'readline';

async function execute() {
  const fileStream = fs.createReadStream('campusbull_main.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('INSERT INTO `allotment_delhis`')) {
      console.log(line.substring(0, 500));
      break;
    }
  }
}

execute().catch(console.error);
