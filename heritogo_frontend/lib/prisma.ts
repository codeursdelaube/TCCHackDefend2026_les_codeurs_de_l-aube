import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Le pooler Supabase en mode transaction (port 6543) ne supporte pas les
 * requêtes préparées : sans `pgbouncer=true`, Prisma échoue avec
 * « prepared statement "s0" already exists » (42P05). On complète donc
 * l'URL ici pour ne pas dépendre de la configuration de l'hébergeur.
 */
function resolveDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL
  if (!raw) return undefined
  try {
    const url = new URL(raw)
    const isTransactionPooler = url.port === '6543' || url.hostname.includes('pooler.supabase.com')
    if (!isTransactionPooler) return raw
    if (!url.searchParams.has('pgbouncer')) url.searchParams.set('pgbouncer', 'true')
    // Une connexion par instance serverless évite de saturer le pooler.
    if (!url.searchParams.has('connection_limit') && process.env.NODE_ENV === 'production') {
      url.searchParams.set('connection_limit', '1')
    }
    return url.toString()
  } catch {
    return raw
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolveDatabaseUrl(),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // Pas de query log — évite le spam DEALLOCATE ALL dans la console
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
