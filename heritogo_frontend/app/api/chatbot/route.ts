import { NextRequest, NextResponse } from 'next/server'

// Retry automatique pour requêtes FastAPI (429, 502, 503, 504)
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
  delayMs = 1500
): Promise<Response> {
  const res = await fetch(url, options)
  if ((res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504) && retries > 0) {
    console.warn(`[HériTogo Chat] Statut ${res.status} reçu, retry dans ${delayMs}ms... (${retries} restant)`)
    await new Promise((r) => setTimeout(r, delayMs))
    return fetchWithRetry(url, options, retries - 1, delayMs + 1000)
  }
  return res
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const rawMessage = typeof body.message === 'string' ? body.message.trim() : ''
    const message = rawMessage.slice(0, 500)

    if (!message) {
      return NextResponse.json(
        { error: 'Le message ne peut pas être vide.' },
        { status: 400 }
      )
    }

    const location =
      typeof body.extracted_location === 'string' && body.extracted_location.trim()
        ? body.extracted_location.trim().slice(0, 80)
        : 'Lomé'

    let budget = 0.0
    if (typeof body.extracted_budget === 'number' && !isNaN(body.extracted_budget) && body.extracted_budget >= 0) {
      budget = body.extracted_budget
    } else if (typeof body.extracted_budget === 'string') {
      const parsed = parseFloat(body.extracted_budget)
      if (!isNaN(parsed) && parsed >= 0) budget = parsed
    }

    const rawBaseUrl = process.env.FASTAPI_URL || 'https://heritogo-production.up.railway.app'
    const trimmedUrl = rawBaseUrl.trim()
    const normalizedBaseUrl = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`
    const baseUrl = normalizedBaseUrl.replace(/\/$/, '')
    const targetUrl = `${baseUrl}/chatbot/api/v1/chat`

    const apiSecretKey = process.env.API_SECRET_KEY || 'ReallySadLifeInMyCountry'

    const response = await fetchWithRetry(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        herit: apiSecretKey,
      },
      body: JSON.stringify({
        message,
        extracted_location: location,
        extracted_budget: budget,
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[HériTogo Chat API] Erreur backend HTTP', response.status, errorText)

      let friendlyMessage = 'Le service de guide virtuel est momentanément indisponible.'
      if (response.status === 422) {
        friendlyMessage = 'Données de requête invalides (message ou budget non conforme).'
      } else if (response.status === 429) {
        friendlyMessage = 'Trop de requêtes. Veuillez patienter quelques instants avant de reposer votre question.'
      } else if (response.status === 502) {
        friendlyMessage = 'Le moteur IA ne parvient pas à répondre actuellement. Veuillez réessayer dans quelques instants.'
      } else if (response.status >= 500) {
        friendlyMessage = 'Le serveur IA est temporairement inaccessible.'
      }

      return NextResponse.json(
        { error: friendlyMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[HériTogo Chat API] Erreur interne :', error)
    return NextResponse.json(
      { error: 'Impossible de contacter le conseiller virtuel.' },
      { status: 500 }
    )
  }
}
