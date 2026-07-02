from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
from google import genai  # <-- Le nouveau package officiel de Google
from typing import Optional

# Configuration centrale via Pydantic Settings
class Settings(BaseSettings):
    supabase_url: str
    sb_secret_key: str
    gemini_api_key_1: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

# Connexion à la base de données
supabase: Client = create_client(settings.supabase_url, settings.sb_secret_key)

# Initialisation du NOUVEAU client Gemini
ai_client = genai.Client(
    api_key=settings.gemini_api_key_1,
    http_options={"api_version": "v1"}
)

# ==========================================
# 2. CONFIGURATION DU MIDDLEWARE (CORS)
# ==========================================

# Configuration du CORS (Cross-Origin Resource Sharing) pour permettre au Frontend 
# (situé sur un autre domaine/port) d'interroger cette API sans blocage de sécurité navigateur.
router.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Autorise toutes les origines (utile en Hackathon, à restreindre en prod)
    allow_credentials=True, # Autorise l'envoi de cookies ou de headers d'authentification
    allow_methods=["*"], # Autorise toutes les méthodes HTTP (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Autorise tous les en-têtes HTTP de requêtes
)


# Modèles de requêtes
class ChatRequest(BaseModel):
    message: str
    extracted_location: Optional[str] = "Lomé" # Valeur par défaut si non fournie
    extracted_budget: Optional[float] = 0.0

@router.get("/api/v1/models")
async def list_available_models():
    try:
        # Demande à Google la liste des modèles disponibles pour TA clé API
        models = ai_client.models.list()
        return {"models": [m.name for m in models]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/v1/chat")
async def chat_tourisme_advisor(payload: ChatRequest):
    try:
        # Étape 1 : Générer l'embedding avec le modèle exact de ta liste (768 dimensions)
        embedding_response = ai_client.models.embed_content(
            model="gemini-embedding-001",  # <-- Modifié ici avec le nom exact de ton GET !
            contents=payload.message
        )
        # Extraction propre du vecteur avec le nouveau SDK
        query_vector = embedding_response.embeddings[0].values

        # Étape 2 : Appel Supabase (Filtre sémantique + Budget strict)
        supabase_response = supabase.rpc(
            "match_places",
            {
                "query_embedding": query_vector,          # Doit être une liste de floats
                "match_threshold": 0.1,                  # float / double precision
                "match_count": int(5),                    # integer
                "filter_location": payload.extracted_location, # text
                "max_budget": float(payload.extracted_budget)  # double precision
            }
        ).execute()
        places_found = supabase_response.data

        if not places_found:
            return {"response": f"Aucune activité trouvée pour {payload.extracted_budget} FCFA à {payload.extracted_location}."}

        # Étape 3 : Construction du contexte
        context_data = "".join([
            f"- {p['name']} ({p['category']}) : {p['description']} | Prix: {p['price']} FCFA\n" 
            for p in places_found
        ])

        # Étape 4 : Prompt amélioré et ultra-sécurisé pour HériTogo
        system_prompt = (
            f"Tu es l'assistant virtuel officiel d'HériTogo, un guide touristique interactif, expert et chaleureux du Togo.\n\n"
            
            f"--- CONTEXTE DE LA REQUÊTE USER ---\n"
            f"- Message de l'utilisateur : '{payload.message}'\n"
            f"- Ville/Région ciblée : '{payload.extracted_location}'\n"
            f"- Budget maximum de l'utilisateur : {payload.extracted_budget} FCFA\n\n"
            
            f"--- DONNÉES RÉELLES DE LA BASE DE DONNÉES (Lieux, Monuments & Restaurants) ---\n"
            f"{context_data}\n\n"
            
            f"--- REGLES DE COMPORTEMENT ET SÉCURITÉ (STRICT) ---\n"
            f"1. CADRAGE STRICT : Si l'utilisateur te pose une question qui SORT COMPLÈTEMENT du cadre d'HériTogo, du tourisme au Togo, de la culture, ou de la planification de budget de voyage, tu dois obligatoirement et strictement répondre cette phrase :\n"
            f"   'Je suis là pour répondre à vos questions sur HériTogo et vous faire une planification en fonction de votre budget et rien d'autres.'\n\n"
            
            f"2. INTERACTIVITÉ & SALUTATIONS : Si le message de l'utilisateur est une simple salutation ou une politesse (ex: 'Bonjour', 'Salut', 'Ça va ?') sans demande de planification immédiate, réponds-lui simplement de manière très polie et chaleureuse, présente-toi comme le guide HériTogo, et demande-lui sa destination au Togo et son budget pour commencer.\n\n"
            
            f"3. PRIORITÉ RECOMMANDATION & BUDGET : Ta mission principale est de conseiller l'utilisateur sur HériTogo et de concevoir un itinéraire sur-mesure. Base-toi uniquement sur les données réelles fournies dans 'context_data'. N'invente aucun lieu, ni aucun prix.\n\n"
            
            f"4. LIEN LIEUX / RESTOS & PLATS LOCAUX : Utilise les données pour associer intelligemment les monuments à visiter et les restaurants à proximité où il peut manger des plats locaux togolais.\n\n"
            
            f"5. ORIENTATION VERS LES FONCTIONNALITÉS FRONTEND : Dès que l'utilisateur s'intéresse à la nourriture, à la cuisine togolaise ou cherche un restaurant, tu dois intégrer naturellement cette orientation dans ta réponse :\n"
            f"   'Pour découvrir nos spécialités, je vous invite à regarder le menu en bas de votre écran : vous y trouverez l'onglet \"Cuisine\". En cliquant dessus, vous verrez tous les délicieux plats locaux du Togo. Si un plat vous fait envie, cliquez simplement dessus et l'application vous affichera instantanément tous les restaurants partenaires qui le proposent à moins de 5 km de vous !'\n"
        )

        # Étape 5 : Génération de la réponse avec le nouveau SDK
        ai_response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=system_prompt,
        )

        return {
            "response": ai_response.text,
            "sources_used": [p['name'] for p in places_found]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))