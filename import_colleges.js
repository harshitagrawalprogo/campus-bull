import fs from 'fs';
import readline from 'readline';
import crypto from 'crypto';
import { prisma } from './server/utils/db.js';

// A robust parser for MySQL value tuples: (1, 'Hello, World', NULL)
function parseSqlTuple(tupleStr) {
  const result = [];
  let currentWord = '';
  let insideQuote = false;
  let escapeNext = false;

  const content = tupleStr.substring(1, tupleStr.length - 1); // remove outer ( )

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (escapeNext) {
      currentWord += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === "'") {
      insideQuote = !insideQuote;
      continue; // Skip the quote itself
    }

    if (char === ',' && !insideQuote) {
      result.push(currentWord.trim() === 'NULL' ? null : currentWord.trim());
      currentWord = '';
      continue;
    }

    currentWord += char;
  }
  
  result.push(currentWord.trim() === 'NULL' ? null : currentWord.trim());
  return result;
}

async function runImport() {
  const fileStream = fs.createReadStream('campusbull_main.sql');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const uniqueColleges = new Map(); // key -> { name, state, type, tier }
  let allotmentsBuffer = [];
  
  let currentTable = null;
  let columns = [];
  let isParsingValues = false;

  console.log('Scanning SQL file...');

  for await (const line of rl) {
    if (line.startsWith('INSERT INTO `allotment_') || line.startsWith('INSERT INTO `all_indias`') || line.startsWith('INSERT INTO `collages`')) {
      const match = line.match(/INSERT INTO `([^`]+)` \(([^)]+)\) VALUES/);
      if (match) {
        currentTable = match[1];
        columns = match[2].split(',').map(c => c.trim().replace(/`/g, ''));
        isParsingValues = true;
        continue;
      }
    }

    if (isParsingValues) {
      if (line.trim().length === 0) continue;
      
      // Match all (...) tuples in the line. Some dumps put multiple tuples per line.
      let lineClean = line.trim();
      const endsWithSemicolon = lineClean.endsWith(';');
      if (endsWithSemicolon) {
        lineClean = lineClean.slice(0, -1);
      }
      
      // We assume each line has one tuple in this specific dump, or multiple separated by comma
      // The campusbull dump had: VALUES \n (1, 'Round 1'...),\n (2, ...)
      let tupleStr = lineClean;
      if (tupleStr.endsWith(',')) tupleStr = tupleStr.slice(0, -1);
      
      if (tupleStr.startsWith('(') && tupleStr.endsWith(')')) {
        const values = parseSqlTuple(tupleStr);
        const record = {};
        columns.forEach((col, idx) => {
          record[col] = values[idx];
        });

        // Add to mapped logic
        if (currentTable.startsWith('allotment_') && currentTable !== 'allotments') {
          // Identify college details
          const collegeName = record['college'] || 'Unknown College';
          const stateName = record['state'] || currentTable.replace('allotment_', ''); // Fallback
          const type = record['type'] || record['quota'] || null;
          
          const collegeKey = `${collegeName}-${stateName}`;
          if (!uniqueColleges.has(collegeKey)) {
            uniqueColleges.set(collegeKey, {
              id: crypto.randomUUID(),
              name: collegeName,
              state: stateName,
              type: type,
              tier: null
            });
          }

          const collegeId = uniqueColleges.get(collegeKey).id;

          allotmentsBuffer.push({
            collegeId,
            round: record['round'] || null,
            aiRank: record['ai_rank'] ? parseInt(record['ai_rank'], 10) : null,
            stateRank: record['state_rank'] ? parseInt(record['state_rank'], 10) : null,
            year: record['year'] || null,
            category: record['category'] || null,
          });
        }
      }

      if (endsWithSemicolon) {
        isParsingValues = false;
        currentTable = null;
        columns = [];
      }
    }
  }

  console.log(`Found ${uniqueColleges.size} unique colleges across all states.`);
  console.log(`Extracted ${allotmentsBuffer.length} allotment records.`);
  
  if (allotmentsBuffer.length === 0) {
    console.log("No allotment data found. Check script regex mapping.");
    process.exit(0);
  }

  console.log("Clearing existing data...");
  await prisma.collegeAllotment.deleteMany({});
  await prisma.college.deleteMany({});

  console.log("Saving Colleges to Neon Postgres...");
  const collegeValues = Array.from(uniqueColleges.values());
  for (let i = 0; i < collegeValues.length; i += 500) {
    await prisma.college.createMany({
      data: collegeValues.slice(i, i + 500),
      skipDuplicates: true,
    });
    console.log(`Pushed ${i + 500 > collegeValues.length ? collegeValues.length : i + 500} colleges...`);
  }

  console.log("Saving Allotments to Neon Postgres in batches...");
  let pushes = 0;
  for (let i = 0; i < allotmentsBuffer.length; i += 2000) {
    const chunk = allotmentsBuffer.slice(i, i + 2000).map(a => ({
      ...a,
      aiRank: isNaN(a.aiRank) ? null : a.aiRank,
      stateRank: isNaN(a.stateRank) ? null : a.stateRank,
    }));
    await prisma.collegeAllotment.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    pushes += chunk.length;
    console.log(`Pushed ${pushes} / ${allotmentsBuffer.length} allotments...`);
  }

  console.log("✅ Successfully imported database.");
}

runImport()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
