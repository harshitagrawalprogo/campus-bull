import pkg from '@prisma/client'
const { PrismaClient } = pkg
import pg from 'pg'
const { Pool } = pg
import { PrismaPg } from '@prisma/adapter-pg'

// Handle TLS/SSL constraints bypass natively
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_uQLIKlN1DhO2@100.51.95.243/neondb?sslmode=require&options=endpoint%3Dep-steep-butterfly-anxifkii-pooler&pgbouncer=true',
  ssl: { 
    rejectUnauthorized: false,
    servername: 'ep-steep-butterfly-anxifkii-pooler.c-6.us-east-1.aws.neon.tech'
  }
})

const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis
// ALWAYS create a fresh client during this phase to avoid caching bugs with globalThis
export const prisma = new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

