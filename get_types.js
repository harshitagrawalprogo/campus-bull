import { prisma } from './server/utils/db.js';
async function getTypes() {
  const types = await prisma.college.findMany({ select: { type: true }, distinct: ['type'] });
  console.log(types);
}
getTypes().then(()=>process.exit(0));
