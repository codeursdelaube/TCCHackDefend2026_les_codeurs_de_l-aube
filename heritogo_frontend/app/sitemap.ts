import type { MetadataRoute } from 'next'
import { monuments } from '@/app/LieuxT/site'
import { platsTogolais } from '@/app/Plats/plat'
import { routing } from '@/i18n/routing'

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Static routes for each locale with alternates
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

  // Dynamic monument pages
  for (const monument of monuments) {
    for (const locale of locales) {
      const pagePath = `/lieux/${monument.id}`
      const url = `${baseUrl}/${locale}${pagePath}`
      const alternates = {
        languages: Object.fromEntries(
          locales.map((loc) => [loc, `${baseUrl}/${loc}${pagePath}`])
        ),
      }

      entries.push({
        url,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates,
      })
    }
  }

  // Dynamic cuisine / dishes pages
  for (const plat of platsTogolais) {
    for (const locale of locales) {
      const pagePath = `/cuisine/${plat.id}`
      const url = `${baseUrl}/${locale}${pagePath}`
      const alternates = {
        languages: Object.fromEntries(
          locales.map((loc) => [loc, `${baseUrl}/${loc}${pagePath}`])
        ),
      }

      entries.push({
        url,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates,
      })
    }
  }

  return entries
}
