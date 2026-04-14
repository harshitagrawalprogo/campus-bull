import fs from 'fs'
import readline from 'readline'

async function processFile() {
  const fileStream = fs.createReadStream('campusbull_main.sql')
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })
  
  const out = fs.createWriteStream('schema.sql')
  let inCreateTable = false
  let tableCount = 0

  for await (const line of rl) {
    if (line.startsWith('CREATE TABLE')) {
      inCreateTable = true
      tableCount++
    }
    if (inCreateTable) {
      out.write(line + '\n')
      if (line.trim().endsWith(';')) {
        inCreateTable = false
        out.write('\n')
      }
    }
  }
  console.log(`Extracted ${tableCount} tables.`)
}

processFile()
