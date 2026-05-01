import { prisma } from './server/utils/db.js';

async function getStates() {
  const states = await prisma.college.findMany({
    select: { state: true },
    distinct: ['state'],
  });
  console.log(JSON.stringify(states.map(s => s.state).filter(Boolean).sort(), null, 2));
}

getStates()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
