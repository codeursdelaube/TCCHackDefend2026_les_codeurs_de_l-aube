from fastapi import FastAPI, File, Query, UploadFile, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
import io
from pydantic_settings import BaseSettings, SettingsConfigDict
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from google import genai
from haversine import calcul_de_l_haversine
from fastapi import Security, Depends
from fastapi.security import api_key


# ==========================================
# 1. CONFIGURATION ET VARIABLES D'ENVIRONNEMENT
# ==========================================

class Settings(BaseSettings):
    """
    Gestion centralisée des variables de configuration avec   Pydantic Settings.
    Charge automatiquement les variables stockées dans le fichier '.env'.
    """
    gemini_api_key: str # Clé secrète pour s'authentifier auprès de l'API Google Gemini
    api_secret_key: str # Clé secrète requise pour sécuriser l'accès à certaines routes de notre API
    
    # Configuration pour lier Pydantic au fichier physique .env
    model_config = SettingsConfigDict(env_file=".env")

    # Instanciation des paramètres pour une utilisation globale
settings = Settings()

# Initialisation de l'application FastAPI
app = FastAPI(title="heritogo_backend")

# Initialisation du client de l'API Google GenAI avec la clé récupérée du .env
Client = genai.Client(api_key=settings.gemini_api_key)

# ==========================================
# 2. CONFIGURATION DU MIDDLEWARE (CORS)
# ==========================================

# Configuration du CORS (Cross-Origin Resource Sharing) pour permettre au Frontend 
# (situé sur un autre domaine/port) d'interroger cette API sans blocage de sécurité navigateur.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Autorise toutes les origines (utile en Hackathon, à restreindre en prod)
    allow_credentials=True, # Autorise l'envoi de cookies ou de headers d'authentification
    allow_methods=["*"], # Autorise toutes les méthodes HTTP (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Autorise tous les en-têtes HTTP de requêtes
)

# ==========================================
# 3. SÉCURISATION DES ROUTES (API KEY)
# ==========================================

cle_api = "herit" # Nom de l'en-tête (Header) attendu dans la requête HTTP (ex: herit: votre_cle_api)
api_key_header = api_key.APIKeyHeader(name=cle_api, auto_error=False)

def verifier_cle_api(api_key_recue: str = Depends(api_key_header)):
    """
    Dépendance de sécurité chargeant et vérifiant la présence de la clé API.
    Compare la clé fournie dans le header avec celle définie dans le fichier .env.
    """
    if api_key_recue == settings.api_secret_key:
        return api_key_recue
# Si la clé est incorrecte ou absente, on bloque immédiatement la requête
    raise HTTPException(
    status_code=403,
    detail="Accès interdit: Clé API invalide ou manquante"
    )

# ==========================================
# 4. CHARGEMENT DES BASES DE DONNÉES LOCALES (JSON)
# ==========================================

# Chargement en mémoire au démarrage de l'API de la liste officielle des monuments du Togo
with open("monument.json", "r", encoding="utf-8") as fichier:
    BASE_MONUMENT = json.load(fichier)

# Chargement en mémoire de la liste des hôtels répertoriés au Togo
with open("hotel.json", "r", encoding="utf-8") as fichier_hotel:
    BASE_HOTEL = json.load(fichier_hotel)

# ==========================================
# 5. MODÈLES DE DONNÉES (PYDANTIC)
# ==========================================

class Monument(BaseModel):
    """ Modèle de validation pour la structure d'un Monument """
    id: int
    nom: str
    histoire: str
    latitude: float
    longitude: float

class hotel(BaseModel):
    """ Modèle de validation pour la structure d'un Hôtel """
    nom: str
    latitude: float
    longitude: float
    prix_nuit: int

@app.get("/monument", response_model=List[Monument])
def get_Monument():
    """ Récupère la liste complète des monuments du Togo stockés en local """
    return BASE_MONUMENT

@app.get("/hotel")
def get_hotel_proche(
    lat: float = Query(..., description="Latitude du monument"), 
    long: float = Query(..., description="Longitude du monument")
):
    """
    Calcule la distance entre un monument donné et tous les hôtels de la base.
    Retourne la liste des hôtels triés du plus proche au plus lointain.
    """
    hotel_avec_distance = []

    for h in BASE_HOTEL:
    # Utilisation de la formule d'Haversine pour calculer la distance géographique (en km)
        distances = calcul_de_l_haversine(lat, long, h["latitude"], h["longitude"])
        hotel_data = h.copy()
        hotel_data["distance_km"] = distances # Injecte la distance calculée dans les données de l'hôtel
        hotel_avec_distance.append(hotel_data)

    # Tri décroissant/croissant basé sur le champ "distance_km"
    hotel_tries = sorted(hotel_avec_distance, key=lambda x: x["distance_km"])

    return hotel_tries

@app.post("/predict", dependencies=[Depends(verifier_cle_api)])
async def predict_monument(file: UploadFile = File(..., description="photo prise par le touriste")):
    