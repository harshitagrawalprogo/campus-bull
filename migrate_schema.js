import fs from 'fs'
import pkg from 'pg'
const { Client } = pkg
import "dotenv/config"

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function run() {
  console.log("Reading schema.sql...")
  let sql = fs.readFileSync('schema.sql', 'utf8')

  // Basic MySQL to PostgreSQL translations
  sql = sql.replace(/`([^`]+)`/g, '"$1"') // Convert backticks to double quotes
  sql = sql.replace(/int\(\d+\)/gi, 'integer')
  sql = sql.replace(/tinyint\(\d+\)/gi, 'smallint')
  sql = sql.replace(/tinyint/gi, 'smallint')
  sql = sql.replace(/bigint UNSIGNED/gi, 'bigint')
  sql = sql.replace(/int UNSIGNED/gi, 'integer')
  sql = sql.replace(/double\([^)]+\)/gi, 'numeric')
  sql = sql.replace(/longtext/gi, 'text')
  sql = sql.replace(/mediumtext/gi, 'text')
  sql = sql.replace(/datetime/gi, 'timestamp')
  sql = sql.replace(/ENGINE=.*?;/gi, ';')
  sql = sql.replace(/COLLATE utf8mb4_unicode_ci/gi, '')
  sql = sql.replace(/CHARACTER SET utf8mb4/gi, '')
  sql = sql.replace(/DEFAULT '0000-00-00 00:00:00'/gi, '')
  
  // Connect to DB
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  
  await client.connect()
  console.log("Connected to Neon. Executing Schema Translation...")

  // Split into statements
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0)
  
  let successCount = 0
  let errorCount = 0

  for (const stmt of statements) {
    try {
      if (stmt.startsWith('CREATE TABLE')) {
        // Extract table name to drop it first if it exists
        const match = stmt.match(/CREATE TABLE "([^"]+)"/)
        if (match) {
           await client.query(`DROP TABLE IF EXISTS "${match[1]}" CASCADE;`)
        }
      }
      await client.query(stmt)
      successCount++
    } catch (e) {
      console.error(`Failed to execute statement: ${stmt.substring(0, 50)}...`)
      console.error(e.message)
      errorCount++
    }
  }

  console.log(`Schema Migration Complete: ${successCount} successful, ${errorCount} failed.`)
  await client.end()
}

run().catch(console.error)
