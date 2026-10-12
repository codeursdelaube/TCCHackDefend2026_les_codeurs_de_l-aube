import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Retry automatique (évite de dépasser le timeout Vercel)
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
  delayMs = 1500
): Promise<Response> {
  const res = await fetch(url, options)
  // Si Rate Limit (429) ou Erreur Serveur temporaire (502/503/504)
  if ((res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504) && retries > 0) {
    console.warn(`[HériTogo] Statut ${res.status} reçu, retry dans ${delayMs}ms... (${retries} restant)`)
    await new Promise(r => setTimeout(r, delayMs))
    return fetchWithRetry(url, options, retries - 1, delayMs + 1000)
  }
  return res
}

export async function POST(request: NextRequest) {
  try {
    // 🔐 Vérification d'authentification — seuls les utilisateurs connectés peuvent scanner
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour utiliser le scanner.' },
        { status: 401 }
      )
    }

    // 1. Récupération des données envoyées par le composant ScanPage
    const incomingFormData = await request.formData()

    // Robustesse du champ image / file
    const imageFile =
      (incomingFormData.get('file') as File | null) ??
      (incomingFormData.get('image') as File | null)

    const lat = incomingFormData.get('lat') as string | null
    const rawLong = (incomingFormData.get('long') ?? incomingFormData.get('lng')) as string | null

    if (!imageFile || typeof imageFile === 'string') {
      return NextResponse.json(
        { error: "Aucune image n'a été reçue par le serveur." },
        { status: 400 }
      )
    }

    // Vérification de la taille limite Vercel / BFF (4.5 Mo max)
    const MAX_SIZE_BYTES = 4.5 * 1024 * 1024 // 4.5 Mo
    if (imageFile.size > MAX_SIZE_BYTES) {
      console.error(`[HériTogo] L'image est trop lourde (${(imageFile.size / (1024 * 1024)).toFixed(2)} Mo).`)
      return NextResponse.json(
        { 
          error: "La photo est trop lourde pour être analysée en direct. Veuillez réduire sa résolution ou utiliser une image de moins de 4,5 Mo." 
        },
        { status: 413 } // Payload Too Large
      )
    }

    // 2. Préparation du FormData pour FastAPI (doit impérativement s'appeler 'file')
    const fastapiFormData = new FormData()
    const buffer = await imageFile.arrayBuffer()
    const blob = new Blob([buffer], { type: imageFile.type || 'image/jpeg' })

    fastapiFormData.append('file', blob, imageFile.name || 'photo.jpg')

    // 3. Construction de l'URL cible
    const rawBaseUrl = process.env.FASTAPI_URL || 'https://heritogo-production.up.railway.app'
    const trimmedUrl = rawBaseUrl.trim()
    const normalizedBaseUrl = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`
    const baseUrl = normalizedBaseUrl.replace(/\/$/, '')
    let targetUrl = `${baseUrl}/predict`

    // Ajout des paramètres GPS validés
    const queryParams = new URLSearchParams()
    if (lat && !isNaN(Number(lat))) {
      const numLat = Number(lat)
      if (numLat >= -90 && numLat <= 90) {
        queryParams.append('lat', numLat.toString())
      }
    }
    if (rawLong && !isNaN(Number(rawLong))) {
      const numLong = Number(rawLong)
      if (numLong >= -180 && numLong <= 180) {
        queryParams.append('long', numLong.toString())
      }
    }
    if (queryParams.toString()) {
      targetUrl += `?${queryParams.toString()}`
    }

    // 4. Envoi de la requête au backend FastAPI avec header d'authentification 'herit'
    const apiSecretKey = process.env.API_SECRET_KEY || process.env.api_secret_key || 'ReallySadLifeInMyCountry'
    const headers: Record<string, string> = {
      herit: apiSecretKey,
    }

    // Envoi avec le système de retry intelligent
    const backendResponse = await fetchWithRetry(targetUrl, {
      method: 'POST',
      body: fastapiFormData,
      headers,
    })

    // 5. Gestion des erreurs retournées par FastAPI
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error(`[HériTogo] Erreur backend (HTTP ${backendResponse.status}) :`, errorText)

      let userFriendlyMessage = "Le scanner rencontre des difficultés à analyser cette image. Veuillez réessayer."

      try {
        const parsedError = JSON.parse(errorText)
        if (parsedError.detail) {
          if (Array.isArray(parsedError.detail)) {
            userFriendlyMessage = parsedError.detail[0].msg || JSON.stringify(parsedError.detail)
          } else if (typeof parsedError.detail === 'object') {
            userFriendlyMessage = parsedError.detail.msg || JSON.stringify(parsedError.detail)
          } else {
            userFriendlyMessage = parsedError.detail
          }
        }
      } catch {
        if (backendResponse.status === 400 || errorText.includes('multipart')) {
          userFriendlyMessage = 'Le format de la photo est illisible. Essayez de reprendre la photo.'
        } else if (backendResponse.status === 401 || backendResponse.status === 403) {
          userFriendlyMessage = "L'accès au service de reconnaissance a été refusé. Erreur d'authentification API."
        } else if (backendResponse.status === 429) {
          userFriendlyMessage = 'Trop de requêtes simultanées. Veuillez patienter quelques instants avant de réessayer.'
        } else if (backendResponse.status >= 500) {
          userFriendlyMessage = "Le moteur d'analyse IA d'HériTogo est temporairement indisponible ou surchargé."
        }
      }

      return NextResponse.json(
        { error: userFriendlyMessage },
        { status: backendResponse.status }
      )
    }

    // 6. Succès ou Réponse valide inconnue
    const data = await backendResponse.json()
    if (data.prediction_status === 'unknown' && !data.detail) {
      data.detail = "Monument non répertorié ou non identifiable au Togo."
    }
    return NextResponse.json(data)

  } catch (error) {
    console.error('[HériTogo] Erreur critique dans /api/scan :', error)
    return NextResponse.json(
      { error: "Connexion impossible avec le moteur d'analyse HériTogo." },
      { status: 500 }
    )
  }
}