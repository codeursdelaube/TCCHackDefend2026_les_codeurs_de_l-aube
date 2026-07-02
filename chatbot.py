from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
from supabase import create_client, Client
from google import genai  # Package officiel google-genai
from google.genai import types 
from typing import Optional

# Configuration centrale via Pydantic Settings
class Settings(BaseSettings):
    supabase_url: str
    sb_secret_key: str
    gemini_api_key_1: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

router = APIRouter(tags=["Chatbot"])

# Connexion à la base de données
supabase: Client = create_client(settings.supabase_url, settings.sb_secret_key)

# Initialisation propre du client Gemini (sans http_options pour éviter les conflits)
ai_client = genai.Client(api_key=settings.gemini_api_key_1)


# Modèles de requêtes
class ChatRequest(BaseModel):
    message: str
    extracted_location: Optional[str] = "Lomé" 
    extracted_budget: Optional[float] = 0.0


@router.get("/api/v1/models")
async def list_available_models():
    try:
        models = ai_client.models.list()
        return {"models": [m.name for m in models]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================================
# 🔥 ROUTE : Initialisation automatique des Embeddings (CORRIGÉE & SÛRE)
# =========================================================================
@router.post("/api/v1/init-embeddings")
async def initialize_monument_embeddings():
    """
    Cette route utilise le modèle fonctionnel 'gemini-embedding-001'
    en forçant sa dimension à 768 pour correspondre parfaitement à Supabase.
    """
    try:
        response = supabase.table("places").select("id", "name", "description").execute()
        monuments = response.data

        if not monuments:
            return {"message": "Aucun monument trouvé dans la table public.places."}

        counter = 0
        for m in monuments:
            text_to_embed = f"Monument: {m['name']}. Description: {m['description']}"
            
            # On utilise le modèle fonctionnel MAIS bridé à 768 dimensions
            embedding_response = ai_client.models.embed_content(
                model="gemini-embedding-001",
                contents=text_to_embed,
                config=types.EmbedContentConfig(output_dimensionality=768)
            )
            query_vector = embedding_response.embeddings[0].values
            
            # Sauvegarde du vecteur dans Supabase
            supabase.table("places").update({"embedding": query_vector}).eq("id", m["id"]).execute()
            counter += 1

        return {
            "status": "success",
            "message": f"Génération terminée ! {counter} monuments mis à jour avec des embeddings à 768 dimensions."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'initialisation : {str(e)}")


# =========================================================================
# 💬 ROUTE DU CHATBOT (SYNCHRONISÉE)
# =========================================================================
@router.post("/api/v1/chat")
async def chat_tourisme_advisor(payload: ChatRequest):
    try:
        # Étape 1 : Générer l'embedding avec le même modèle et la même dimension (768)
        embedding_response = ai_client.models.embed_content(
            model="gemini-embedding-001",  
            contents=payload.message,
            config=types.EmbedContentConfig(output_dimensionality=768)
        )
        query_vector = embedding_response.embeddings[0].values

        # Étape 2 : Appel Supabase RPC (match_places)
        supabase_response = supabase.rpc(
            "match_places",
            {
                "query_embedding": query_vector,          
                "match_threshold": 0.1,                  
                "match_count": int(5),                    
                "filter_location": payload.extracted_location, 
                "max_budget": float(payload.extracted_budget)  
            }
        ).execute()
        places_found = supabase_response.data

        if not places_found:
            return {"response": f"Aucune activité trouvée pour {payload.extracted_budget} FCFA à {payload.extracted_location}."}

        # Étape 3 : Construction du contexte
        context_data = "".join([
            f"- {p['nom']} ({p['categorie']}) : {p['histoire']} | Prix: {p['prix']} FCFA\n" 
            for p in places_found
        ])

        # Étape 4 : Prompt pour HériTogo
        system_prompt = (
            f"Tu es l'assistant virtuel officiel d'HériTogo, un guide touristique interactif, expert et chaleureux du Togo.\n\n"
            f"--- CONTEXTE DE LA REQUÊTE USER ---\n"
            f"- Message de l'utilisateur : '{payload.message}'\n"
            f"- Ville/Région ciblée : '{payload.extracted_location}'\n"
            f"- Budget maximum de l'utilisateur : {payload.extracted_budget} FCFA\n\n"
            f"--- DONNÉES RÉELLES DE LA BASE DE DONNÉES ---\n"
            f"{context_data}\n\n"
            f"--- REGLES DE COMPORTEMENT ET SÉCURITÉ (STRICT) ---\n"
            f"1. CADRAGE STRICT : Si l'utilisateur te pose une question qui SORT du cadre du tourisme au Togo, réponds strictement :\n"
            f"   'Je suis là pour répondre à vos questions sur HériTogo et vous faire une planification en fonction de votre budget et rien d'autres.'\n\n"
            f"2. INTERACTIVITÉ : Salutations simples -> invite chaleureusement à donner une destination et un budget.\n\n"
            f"3. PRIORITÉ : Base-toi uniquement sur les données réelles fournies. N'invente rien.\n\n"
            f"4. PLATS LOCAUX : Oriente vers l'onglet 'Cuisine' si l'utilisateur parle de nourriture :\n"
            f"   'Pour découvrir nos spécialités, je vous invite à regarder le menu en bas de votre écran : vous y trouverez l'onglet \"Cuisine\"...'\n"
        )

        # Étape 5 : Génération de la réponse finale
        ai_response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=system_prompt,
        )

        return {
            "response": ai_response.text,
            "sources_used": [p['nom'] for p in places_found]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))