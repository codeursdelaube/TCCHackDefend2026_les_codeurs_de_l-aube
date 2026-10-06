import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])

function parseCoord(value: string | null, min: number, max: number): string | null {
  if (!value) return null
  const num = Number(value)
  if (!Number.isFinite(num) || num < min || num > max) return null
  return String(num)
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
  delayMs = 1500
): Promise<Response> {
  const res = await fetch(url, options)
  // Si Rate Limit (429) ou Erreur Serveur temporaire (502/503/504)
  if ((res.status === 429 || res.status >= 502) && retries > 0) {
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

    if (!checkRateLimit(`scan:${user.id}`, 8, 60000)) {
      return NextResponse.json(
        { error: 'Trop de scans. Réessayez dans une minute.' },
        { status: 429 }
      )
    }

    // 1. Récupération des données envoyées par le composant ScanPage
    const incomingFormData = await request.formData()

    // Robustesse du champ image
    const imageFile =
      (incomingFormData.get('image') as File | null) ??
      (incomingFormData.get('file') as File | null)

    const lat = incomingFormData.get('lat') as string | null
    const long = incomingFormData.get('long') as string | null

    if (!imageFile || typeof imageFile === 'string') {
      return NextResponse.json(
        { error: "Aucune image n'a été reçue par le serveur." },
        { status: 400 }
      )
    }

    const mime = (imageFile.type || '').toLowerCase()
    if (mime && !ALLOWED_IMAGE_TYPES.has(mime)) {
      return NextResponse.json(
        { error: 'Format de photo non autorisé. JPEG, PNG ou WEBP uniquement.' },
        { status: 400 }
      )
    }

    // CORRECTION DANGER TAILLE : Vérification de la taille limite de Vercel (4.5 Mo max)
    // Évite que Vercel ne coupe brutalement la fonction avec une erreur obscure pour le jury
    const MAX_SIZE_BYTES = 4.5 * 1024 * 1024 // 4.5 Mo
    if (imageFile.size > MAX_SIZE_BYTES) {
      console.error(`[HériTogo] L'image est trop lourde (${(imageFile.size / (1024 * 1024)).toFixed(2)} Mo).`)
      return NextResponse.json(
        { 
          error: "La photo est trop lourde pour être analysée en direct. Veuillez réduire sa résolution ou utiliser une image de moins de 4 Mo." 
        },
        { status: 413 } // Payload Too Large
      )
    }

    // 2. Préparation du FormData pour FastAPI
    const fastapiFormData = new FormData()
    const buffer = await imageFile.arrayBuffer()
    const blob = new Blob([buffer], { type: imageFile.type || 'image/jpeg' })

    // FastAPI attend le champ nommé exactement 'file'
    fastapiFormData.append('file', blob, imageFile.name || 'photo.jpg')

    // 3. Construction de l'URL cible
    const rawBaseUrl = process.env.FASTAPI_URL

    if (!rawBaseUrl && process.env.NODE_ENV === 'production') {
      console.error('[HériTogo] FASTAPI_URL est manquante dans les variables Vercel !')
      return NextResponse.json(
        { error: 'Configuration serveur incomplète (FASTAPI_URL manquante). Contactez l\'équipe HériTogo.' },
        { status: 503 }
      )
    }

    // Fallback localhost uniquement en développement local
    const baseUrl = (rawBaseUrl || 'http://127.0.0.1:8000').replace(/\/$/, '')
    let targetUrl = `${baseUrl}/predict`

    // Ajout des paramètres GPS optionnels
    const queryParams = new URLSearchParams()
    const safeLat = parseCoord(lat, -90, 90)
    const safeLong = parseCoord(long, -180, 180)
    if (safeLat) queryParams.append('lat', safeLat)
    if (safeLong) queryParams.append('long', safeLong)
    if (queryParams.toString()) {
      targetUrl += `?${queryParams.toString()}`
    }

    // 4. Envoi de la requête au backend FastAPI
    //  CORRECTION CASSE : Utilisation stricte des MAJUSCULES pour la variable d'environnement
    const apiSecretKey = process.env.API_SECRET_KEY

    if (!apiSecretKey) {
      console.error('[HériTogo] API_SECRET_KEY est manquante dans l\'environnement.')
      return NextResponse.json(
        { error: 'Configuration serveur incomplète (Clé API manquante). Contactez l\'équipe HériTogo.' },
        { status: 503 }
      )
    }

    // Envoi avec le système de retry intelligent
    const backendResponse = await fetchWithRetry(targetUrl, {
      method: 'POST',
      body: fastapiFormData,
      headers: { herit: apiSecretKey },
    })

    // 5. Gestion des erreurs retournées par FastAPI
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error(`[HériTogo] Erreur backend (HTTP ${backendResponse.status}) :`, errorText)

      let userFriendlyMessage = "Le scanner rencontre des difficultés à analyser cette image. Veuillez réessayer."

      if (backendResponse.status === 400) {
        userFriendlyMessage = 'Le format de la photo est illisible. Essayez de reprendre la photo.'
      } else if (backendResponse.status === 401 || backendResponse.status === 403) {
        userFriendlyMessage = "Accès au scanner refusé. Réessayez plus tard."
      } else if (backendResponse.status === 413) {
        userFriendlyMessage = 'La photo est trop lourde. Réduisez sa taille et réessayez.'
      } else if (backendResponse.status === 429) {
        userFriendlyMessage = 'Trop de requêtes simultanées. Veuillez patienter quelques instants avant de réessayer.'
      } else if (backendResponse.status >= 500) {
        userFriendlyMessage = "Le moteur d'analyse IA d'HériTogo est temporairement indisponible ou surchargé."
      }

      return NextResponse.json(
        { error: userFriendlyMessage },
        { status: backendResponse.status }
      )
    }

    // 6. Succès — transmission directe au client
    const data = await backendResponse.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('[HériTogo] Erreur critique dans /api/scan :', error)
    return NextResponse.json(
      { error: "Connexion impossible avec le moteur d'analyse HériTogo." },
      { status: 500 }
    )
  }
}