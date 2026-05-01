import { prisma } from './server/utils/db.js';
async function getCollege() {
  const c = await prisma.college.findFirst();
  console.log(c);
  const a = await prisma.collegeAllotment.findFirst();
  console.log(a);
}
getCollege().then(()=>process.exit(0));
