const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const sep = trimmed.indexOf('=')
    if (sep < 1) continue
    const key = trimmed.slice(0, sep).trim()
    let value = trimmed.slice(sep + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnv()

const prisma = new PrismaClient()
const sql = fs.readFileSync(path.join(__dirname, '..', 'prisma', 'places_tables.sql'), 'utf8')

const statements = sql
  .split(';')
  .map((part) =>
    part
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
      .trim()
  )
  .filter(Boolean)

async function main() {
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement)
    console.log('OK:', statement.replace(/\s+/g, ' ').slice(0, 72))
  }

  const places = await prisma.place.count()
  const dishes = await prisma.dish.count()
  console.log(`Tables prêtes. Lieux: ${places}, plats: ${dishes}`)
}

main()
  .catch((error) => {
    console.error(error.code || 'ERR', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
