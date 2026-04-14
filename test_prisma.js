import pkg from '@prisma/client'
const { PrismaClient } = pkg
import pg from 'pg'
const { Pool } = pg
import { PrismaPg } from '@prisma/adapter-pg'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_w5DnaiKCV0EP@54.209.204.248/neondb?sslmode=require&options=endpoint%3Dep-ancient-unit-am6by8o3-pooler',
  ssl: { 
    rejectUnauthorized: false,
    servername: 'ep-ancient-unit-am6by8o3-pooler.c-5.us-east-1.aws.neon.tech'
  }
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const users = await prisma.user.findMany();
  console.log('Connected natively bypassed! Users:', users.length);
}
main().catch(console.error).finally(() => process.exit(0));
