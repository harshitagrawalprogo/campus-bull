import fs from 'fs';
import readline from 'readline';

async function execute() {
  const fileStream = fs.createReadStream('campusbull_main.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let inTarget = false;

  for await (const line of rl) {
    if (line.includes('CREATE TABLE `allotment_delhis`')) {
      inTarget = true;
    }
    if (inTarget) {
      console.log(line);
      if (line.includes(';')) break;
    }
  }
}

execute().catch(console.error);
