import { prisma } from './server/utils/db.js';
import fs from 'fs';

async function main() {
  const tables = [
    'open_states', 'karnatakas', 'andhra_pradeshes', 'delhis', 
    'maharashtras', 'uttar_pradeshes', 'telanganas', 'tamil_nadus', 
    'west_bengals', 'gujarats'
  ];
  const allQuotas = new Set();
  
  for (const table of tables) {
    try {
      const rows = await prisma.$queryRawUnsafe(`SELECT DISTINCT "quota" AS qt FROM "${table}" WHERE "quota" IS NOT NULL`);
      rows.forEach(r => allQuotas.add(r.qt));
    } catch (e) {
      // Table might not exist
    }
  }
  
  fs.writeFileSync('quotas_output_utf8.txt', JSON.stringify(Array.from(allQuotas).sort(), null, 2), 'utf-8');
}

main().catch(console.error).finally(() => prisma.$disconnect());
