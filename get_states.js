import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_q6S2hxycOIfF@ep-winter-haze-a8a2w89p.eastus2.azure.neon.tech/neondb?sslmode=require"
    }
  }
});

async function getStates() {
  const states = await prisma.allotment.findMany({
    select: { state: true },
    distinct: ['state'],
  });
  console.log(states.map(s => s.state).sort());
}

getStates()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
  });
