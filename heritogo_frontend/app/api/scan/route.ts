import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // En TypeScript, on force le type avec "as File | null" pour pouvoir manipuler le fichier proprement
    const imageFile = formData.get('image') as File | null; 

    // 1. Vérification de la présence et de la validité du fichier
    if (!imageFile || !(imageFile instanceof Blob)) {
      return NextResponse.json(
        { error: "Aucune photo n'a été détectée. Veuillez reprendre ou sélectionner une image." }, 
        { status: 400 }
      );
    }

    // 2. Récupération des variables d'environnement indispensables
    const fastapiBaseUrl = process.env.FASTAPI_URL;
    const secretKey = process.env.API_SECRET_KEY;

    if (!fastapiBaseUrl || !secretKey) {
      console.error("--- ERREUR CONFIGURATION --- URL ou Clé API manquante dans les variables d'environnement.");
      return NextResponse.json(
        { error: "Le service d'analyse subit une maintenance technique. Veuillez réessayer plus tard." }, 
        { status: 500 }
      );
    }

    // 3. Préparation du formulaire multipart pour FastAPI (Correction du flux binaire)
    const fastapiFormData = new FormData();
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const blob = new Blob([buffer], { type: imageFile.type });
    
    // On ajoute le fichier reformaté en Blob natif avec son nom d'origine
    fastapiFormData.append('file', blob, imageFile.name); 

    // 4. Appel à la route "/predict" de FastAPI avec l'en-tête de sécurité
    // Nettoyage de l'URL pour éviter les doubles slashes (//predict)
    const targetUrl = `${fastapiBaseUrl.replace(/\/$/, '')}/predict`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'herit': secretKey 
        // Ne pas forcer le Content-Type, le fetch s'en charge avec le bon boundary binaire
      },
      body: fastapiFormData,
    });

    // 5. Gestion des erreurs renvoyées par le backend FastAPI
    if (!response.ok) {
      const errorDetail = await response.text();
      
      // On garde les logs techniques visibles uniquement côté serveur pour le développeur
      console.error(`--- ERREUR MOTEUR IA (Status ${response.status}) ---`, errorDetail);

      // On initialise des messages par défaut polis et clairs pour l'utilisateur
      let userFriendlyMessage = "Le scanner rencontre des difficultés à analyser cette image. Veuillez réessayer.";
      
      if (response.status === 400 || errorDetail.includes("multipart")) {
        userFriendlyMessage = "Le format ou la structure de la photo est illisible. Essayez de reprendre la photo.";
      } else if (response.status === 401 || response.status === 403) {
        userFriendlyMessage = "L'accès au service de reconnaissance est temporairement bloqué. Contactez le support.";
      } else if (response.status >= 500) {
        userFriendlyMessage = "Le serveur d'intelligence artificielle est saturé ou indisponible. Veuillez patienter quelques instants.";
      }

      return NextResponse.json(
        { error: userFriendlyMessage }, 
        { status: response.status }
      );
    }

    // 6. Succès : renvoi direct des données de prédiction à votre composant Client
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: unknown) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    
    // Log de l'erreur réseau ou crash interne pour le dev
    console.error("--- CRASH INTERNE ROUTE API ---", rawMessage);

    // Message rassurant si le serveur FastAPI est injoignable (ex: ECONNREFUSED)
    let globalErrorMessage = "Une erreur imprévue est survenue lors de l'envoi. Veuillez vérifier votre connexion.";
    if (rawMessage.includes("fetch failed") || rawMessage.includes("connect")) {
      globalErrorMessage = "Connexion au serveur d'analyse impossible. Assurez-vous d'être connecté à Internet.";
    }

    return NextResponse.json(
      { error: globalErrorMessage }, 
      { status: 500 }
    );
  }
}