import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 1. Récupération des données envoyées par le composant ScanPage
    const incomingFormData = await request.formData()

    // FIX #1 : Accepte aussi bien 'image' que 'file' comme nom de champ
    // pour rendre la route robuste peu importe ce que ScanPage envoie
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

    // 2. Préparation du FormData pour FastAPI
    // FIX #2 : On crée un nouveau FormData propre et on laisse fetch
    // générer lui-même le Content-Type avec le bon boundary multipart.
    // Ne jamais ajouter 'Content-Type' manuellement sur un FormData.
    const fastapiFormData = new FormData()
    const buffer = await imageFile.arrayBuffer()
    const blob = new Blob([buffer], { type: imageFile.type || 'image/jpeg' })

    // FastAPI attend le champ nommé exactement 'file' (défini dans file: UploadFile = File(...))
    fastapiFormData.append('file', blob, imageFile.name || 'photo.jpg')

    // 3. Construction de l'URL cible
    // FIX #3 : Vérification stricte de FASTAPI_URL en production.
    // Si la variable est absente sur Vercel, on lève une erreur claire
    // plutôt que de silencieusement tomber sur 127.0.0.1 (inaccessible depuis Vercel).
    const rawBaseUrl = process.env.FASTAPI_URL

    if (!rawBaseUrl && process.env.NODE_ENV === 'production') {
      console.error(
        '[HériTogo] FASTAPI_URL est manquante dans les variables Vercel !'
      )
      return NextResponse.json(
        {
          error:
            'Configuration serveur incomplète. Contactez le support HériTogo.',
        },
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
    // FIX #5 : On ne passe QUE le header 'herit' (la clé API).
    // Surtout pas de 'Content-Type' — fetch gère le boundary multipart automatiquement.
    const apiSecretKey = process.env.API_SECRET_KEY

    if (!apiSecretKey) {
      console.error('[HériTogo] API_SECRET_KEY est manquante.')
      return NextResponse.json(
        {
          error:
            'Configuration serveur incomplète. Contactez le support HériTogo.',
        },
        { status: 503 }
      )
    }

    const backendResponse = await fetch(targetUrl, {
      method: 'POST',
      body: fastapiFormData,
      headers: {
        herit: apiSecretKey,
        // ✅ Aucun Content-Type ici — fetch le génère avec le bon boundary
      },
    })

    // 5. Gestion des erreurs retournées par FastAPI
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error(
        `[HériTogo] Erreur backend (HTTP ${backendResponse.status}) :`,
        errorText
      )

      let userFriendlyMessage =
        "Le scanner rencontre des difficultés à analyser cette image. Veuillez réessayer."

      try {
        const parsedError = JSON.parse(errorText)
        if (parsedError.detail) {
          // 🛡️ CORRECTIF MAJEUR : Évite le crash "Objects are not valid as a React child"
          // Si Pydantic renvoie un tableau d'erreurs [{msg, type, loc, input}] (ex: erreur 422)
          if (Array.isArray(parsedError.detail)) {
            userFriendlyMessage = parsedError.detail[0].msg || JSON.stringify(parsedError.detail)
          } else if (typeof parsedError.detail === 'object') {
            userFriendlyMessage = parsedError.detail.msg || JSON.stringify(parsedError.detail)
          } else {
            // Si c'est déjà une chaîne de caractères brute (ex: "Clé de sécurité invalide")
            userFriendlyMessage = parsedError.detail
          }
        }
      } catch {
        // Réponse non-JSON : on applique un message alternatif selon le code HTTP
        if (backendResponse.status === 400 || errorText.includes('multipart')) {
          userFriendlyMessage =
            'Le format de la photo est illisible. Essayez de reprendre la photo.'
        } else if (
          backendResponse.status === 401 ||
          backendResponse.status === 403
        ) {
          userFriendlyMessage =
            "L'accès au service de reconnaissance est refusé. Vérifiez la clé API sur Vercel."
        } else if (backendResponse.status === 429) {
          userFriendlyMessage =
            'Trop de requêtes de scan envoyées à Gemini. Veuillez patienter une minute avant de réessayer.'
        } else if (backendResponse.status === 503) {
          userFriendlyMessage =
            "Le service d'analyse de monuments est temporairement indisponible. Veuillez réessayer."
        } else if (backendResponse.status >= 500) {
          userFriendlyMessage =
            "Le serveur d'intelligence artificielle est surchargé. Veuillez patienter."
        }
      }

      return NextResponse.json(
        { error: userFriendlyMessage },
        { status: backendResponse.status }
      )
    }

    // 6. Succès — on retransmet la réponse FastAPI au client
    const data = await backendResponse.json()
    return NextResponse.json(data)

  } catch (error) {
    // FIX #6 : Log de l'erreur complète pour débugger dans Vercel Functions
    console.error('[HériTogo] Erreur critique dans /api/scan :', error)

    return NextResponse.json(
      { error: "Connexion impossible avec le moteur d'analyse HériTogo." },
      { status: 500 }
    )
  }
}
