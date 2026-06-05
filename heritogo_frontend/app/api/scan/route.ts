import { NextRequest, NextResponse } from 'next/server'

// Retry automatique optimisé pour le Hackathon (Évite de dépasser les 10s de timeout Vercel)
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
    if (lat) queryParams.append('lat', lat)
    if (long) queryParams.append('long', long)
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

      try {
        const parsedError = JSON.parse(errorText)
        if (parsedError.detail) {
          // Gestion propre des erreurs Pydantic (Tableaux ou Objets) pour éviter le crash React
          if (Array.isArray(parsedError.detail)) {
            userFriendlyMessage = parsedError.detail[0].msg || JSON.stringify(parsedError.detail)
          } else if (typeof parsedError.detail === 'object') {
            userFriendlyMessage = parsedError.detail.msg || JSON.stringify(parsedError.detail)
          } else {
            userFriendlyMessage = parsedError.detail
          }
        }
      } catch {
        // Fallback sur les codes HTTP standards si le backend ne renvoie pas du JSON
        if (backendResponse.status === 400 || errorText.includes('multipart')) {
          userFriendlyMessage = 'Le format de la photo est illisible. Essayez de reprendre la photo.'
        } else if (backendResponse.status === 401 || backendResponse.status === 403) {
          userFriendlyMessage = "L'accès au service de reconnaissance a été refusé. Erreur de clé de sécurité."
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