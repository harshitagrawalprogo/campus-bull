// Manual schema push script — bypasses standard Prisma CLI DNS issue
import pg from 'pg'
const { Pool } = pg

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_w5DnaiKCV0EP@54.209.204.248/neondb?sslmode=require&options=endpoint%3Dep-ancient-unit-am6by8o3-pooler',
  ssl: {
    rejectUnauthorized: false,
    servername: 'ep-ancient-unit-am6by8o3-pooler.c-5.us-east-1.aws.neon.tech'
  }
})

const SQL = `
-- Extend User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "branch" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "domicile" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "testsTaken" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avgScore" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bestRank" INTEGER;

-- Create MockTest table
CREATE TABLE IF NOT EXISTS "MockTest" (
  "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title"      TEXT NOT NULL,
  "type"       TEXT NOT NULL,
  "subjects"   TEXT[] NOT NULL,
  "questions"  INTEGER NOT NULL,
  "duration"   INTEGER NOT NULL,
  "difficulty" TEXT NOT NULL,
  "tag"        TEXT,
  "avgScore"   DOUBLE PRECISION NOT NULL DEFAULT 0,
  "attempts"   INTEGER NOT NULL DEFAULT 0,
  "isActive"   BOOLEAN NOT NULL DEFAULT true,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create TestAttempt table
CREATE TABLE IF NOT EXISTS "TestAttempt" (
  "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"     TEXT NOT NULL,
  "testId"     TEXT NOT NULL,
  "score"      DOUBLE PRECISION NOT NULL,
  "totalMarks" INTEGER NOT NULL,
  "timeTaken"  INTEGER NOT NULL,
  "answers"    JSONB NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "TestAttempt_testId_fkey" FOREIGN KEY ("testId") REFERENCES "MockTest"("id") ON DELETE CASCADE
);

-- Seed Mock Tests
INSERT INTO "MockTest" ("id","title","type","subjects","questions","duration","difficulty","tag","avgScore","attempts") VALUES
  ('test-001','NEET Full Syllabus Test 01','Full Syllabus',ARRAY['Physics','Chemistry','Biology'],200,200,'Hard','New',68,24500),
  ('test-002','Physics Mastery Series — Mechanics','Chapter',ARRAY['Physics'],45,60,'Medium','Popular',72,12000),
  ('test-003','Biology Special — Human Physiology','Chapter',ARRAY['Biology'],90,90,'Hard',NULL,65,18700),
  ('test-004','Chemistry Rapid Fire — Organic','Chapter',ARRAY['Chemistry'],50,60,'Medium','Trending',74,9800),
  ('test-005','NEET PYQ — 2023 Official Paper','PYQ',ARRAY['Physics','Chemistry','Biology'],200,200,'Real',NULL,61,48200),
  ('test-006','Grand Test — Month End','Grand Test',ARRAY['Physics','Chemistry','Biology'],180,180,'Hard','Live',66,7200)
ON CONFLICT ("id") DO NOTHING;

SELECT 'Schema push complete!' as status;
`

async function run() {
  const client = await pool.connect()
  try {
    const result = await client.query(SQL)
    console.log('✅ Schema pushed:', result[result.length - 1].rows[0])
  } catch (err) {
    console.error('❌ Schema push failed:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

run()
