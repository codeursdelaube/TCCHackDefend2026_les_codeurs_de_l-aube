from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
from supabase import create_client, Client
from google import genai  # <-- Le nouveau package officiel de Google

# Configuration centrale via Pydantic Settings
class Settings(BaseSettings):
    supabase_url: str
    sb_secret_key: str
    gemini_api_key: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()

app = FastAPI(title=" Chatbot API")

# Connexion à la base de données
supabase: Client = create_client(settings.supabase_url, settings.sb_secret_key)

# Initialisation du NOUVEAU client Gemini
ai_client = genai.Client(
    api_key=settings.gemini_api_key,
    http_options={"api_version": "v1"}
)
# Modèles de requêtes
class ChatRequest(BaseModel):
    message: str
    extracted_location: str  
    extracted_budget: float   

@app.get("/api/v1/models")
async def list_available_models():
    try:
        # Demande à Google la liste des modèles disponibles pour TA clé API
        models = ai_client.models.list()
        return {"models": [m.name for m in models]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/chat")
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

        # Étape 4 : Prompt
        system_prompt = (
            f"Tu es un guide touristique expert et chaleureux du Togo.\n"
            f"L'utilisateur te dit : '{payload.message}'. Il a un budget max de {payload.extracted_budget} FCFA.\n"
            f"Voici nos données réelles :\n{context_data}\n"
            f"Consigne : Propose un itinéraire respectant le budget, liste les coûts, et n'invente rien."
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