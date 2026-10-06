import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { routing } from '@/i18n/routing'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://heritogo.codorah.com'
  const locales = routing.locales
  const lastModified = new Date()

  const staticPages = [
    '',
    '/accueil',
    '/lieux',
    '/cuisine',
    '/histoire',
    '/guides',
    '/scan',
    '/loisirs',
    '/subscription',
  ]

  const entries: MetadataRoute.Sitemap = []

  for (const page of staticPages) {
    for (const locale of locales) {
      const url = `${baseUrl}/${locale}${page}`
      const alternates = {
        languages: Object.fromEntries(
          locales.map((loc) => [loc, `${baseUrl}/${loc}${page}`])
        ),
      }

      entries.push({
        url,
        lastModified,
        changeFrequency: page === '' || page === '/accueil' ? 'daily' : 'weekly',
        priority: page === '' || page === '/accueil' ? 1.0 : 0.8,
        alternates,
      })
    }
  }

  const [places, dishes] = await Promise.all([
    prisma.place.findMany({ where: { is_published: true }, select: { slug: true, updated_at: true } }).catch(() => []),
    prisma.dish.findMany({ where: { is_published: true }, select: { slug: true, updated_at: true } }).catch(() => []),
  ])

  for (const monument of places) {
    for (const locale of locales) {
      const pagePath = `/lieux/${monument.slug}`
      const url = `${baseUrl}/${locale}${pagePath}`
      entries.push({
        url,
        lastModified: monument.updated_at,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [loc, `${baseUrl}/${loc}${pagePath}`])
          ),
        },
      })
    }
  }

  for (const plat of dishes) {
    for (const locale of locales) {
      const pagePath = `/cuisine/${plat.slug}`
      const url = `${baseUrl}/${locale}${pagePath}`
      entries.push({
        url,
        lastModified: plat.updated_at,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [loc, `${baseUrl}/${loc}${pagePath}`])
          ),
        },
      })
    }
  }

  return entries
}
