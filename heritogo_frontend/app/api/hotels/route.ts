import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_FASTAPI_URL = 'http://127.0.0.1:8000'

function parseCoordinate(value: string | null, name: string) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Coordonnee ${name} invalide`)
  }
  return parsed
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseCoordinate(searchParams.get('lat'), 'lat')
    const lng = parseCoordinate(searchParams.get('lng'), 'lng')

    const rawBaseUrl = process.env.FASTAPI_URL
    if (!rawBaseUrl && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Configuration serveur incomplète pour les hôtels proches.' },
        { status: 503 }
      )
    }

    const baseUrl = (rawBaseUrl || DEFAULT_FASTAPI_URL).replace(/\/$/, '')
    const backendUrl = new URL(`${baseUrl}/nearby`)
    backendUrl.searchParams.set('lat', String(lat))
    backendUrl.searchParams.set('long', String(lng))
    backendUrl.searchParams.set('rayon_km', '5')

    const response = await fetch(backendUrl, { cache: 'no-store' })
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Impossible de récupérer les hôtels proches.' },
        { status: response.status }
      )
    }

    const hotels = await response.json()
    return NextResponse.json(Array.isArray(hotels) ? hotels : [])
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erreur lors de la recherche des hôtels.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
