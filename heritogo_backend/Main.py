from fastapi import FastAPI, File, Query, UploadFile, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
import io
from pathlib import Path
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
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # Configuration pour lier Pydantic au fichier physique .env
    model_config = SettingsConfigDict(env_file=Path(__file__).resolve().parent / ".env")

    # Instanciation des paramètres pour une utilisation globale
settings = Settings()

# Initialisation de l'application FastAPI
app = FastAPI(title="heritogo_backend")
cle_api = "herit" # Nom de l'en-tête (Header) attendu dans la requête HTTP (ex: herit: votre_cle_api)

# Initialisation du client de l'API Google GenAI avec la clé récupérée du .env
Client = genai.Client(api_key=settings.gemini_api_key)

# ==========================================
# 2. CONFIGURATION DU MIDDLEWARE (CORS)
# ==========================================

# Configuration du CORS (Cross-Origin Resource Sharing) pour permettre au Frontend 
# (situé sur un autre domaine/port) d'interroger cette API sans blocage de sécurité navigateur.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["content-type", cle_api],
)

# ==========================================
# 3. SÉCURISATION DES ROUTES (API KEY)
# ==========================================

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
BASE_DIR = Path(__file__).resolve().parent

with open(BASE_DIR / "monument.json", "r", encoding="utf-8") as fichier:
    BASE_MONUMENT = json.load(fichier)

for monument in BASE_MONUMENT:
    if "latitude" not in monument and "lat" in monument:
        monument["latitude"] = monument["lat"]
    if "longitude" not in monument and "lng" in monument:
        monument["longitude"] = monument["lng"]

# Chargement en mémoire de la liste des hôtels répertoriés au Togo
with open(BASE_DIR / "hotel.json", "r", encoding="utf-8") as fichier_hotel:
    BASE_HOTEL = json.load(fichier_hotel)

# ==========================================
# 5. MODÈLES DE DONNÉES (PYDANTIC)
# ==========================================

class Monument(BaseModel):
    """ Modèle de validation pour la structure d'un Monument """
    id: str
    nom: str
    localite: str
    region: str
    histoire: str
    latitude: float
    longitude: float

class hotel(BaseModel):
    """ Modèle de validation pour la structure d'un Hôtel """
    nom: str
    latitude: float
    longitude: float
    prix_nuit: int

def coordonnee(item: dict):
    latitude = item.get("latitude", item.get("lat"))
    longitude = item.get("longitude", item.get("lng"))
    if latitude is None or longitude is None:
        raise KeyError("coordonnees manquantes")
    return float(latitude), float(longitude)

def hotels_tries_par_distance(lat: float, long: float, rayon_km: Optional[float] = None):
    hotels_avec_distance = []

    for index, h in enumerate(BASE_HOTEL):
        hotel_lat, hotel_long = coordonnee(h)
        distance = calcul_de_l_haversine(lat, long, hotel_lat, hotel_long)
        if rayon_km is not None and distance > rayon_km:
            continue

        hotel_data = h.copy()
        hotel_data["id"] = hotel_data.get("id", f"hotel-{index}")
        hotel_data["latitude"] = hotel_lat
        hotel_data["longitude"] = hotel_long
        hotel_data["distance_km"] = distance
        hotel_data["type"] = "hotel"
        hotel_data["nuit_fcfa"] = hotel_data.get("nuit_fcfa", hotel_data.get("prix_nuit"))
        hotels_avec_distance.append(hotel_data)

    return sorted(hotels_avec_distance, key=lambda x: x["distance_km"])

@app.get("/monument", response_model=List[Monument])
def get_Monument():
    """ Récupère la liste complète des monuments du Togo stockés en local """
    return BASE_MONUMENT

@app.get("/hotel")
def get_hotel_proche(
    lat: float = Query(..., description="Latitude du monument"), 
    long: float = Query(..., description="Longitude du monument"),
    rayon_km: Optional[float] = Query(None, ge=0, le=100, description="Rayon de recherche optionnel en km")
):
    """
    Calcule la distance entre un monument donné et tous les hôtels de la base.
    Retourne la liste des hôtels triés du plus proche au plus lointain.
    """
    return hotels_tries_par_distance(lat, long, rayon_km)

@app.get("/nearby")
def get_decouvertes_proches(
    lat: float = Query(..., description="Latitude du monument"),
    long: float = Query(..., description="Longitude du monument"),
    rayon_km: float = Query(5, ge=0, le=100, description="Rayon de recherche en km")
):
    return hotels_tries_par_distance(lat, long, rayon_km)

@app.post("/predict", dependencies=[Depends(verifier_cle_api)])
async def predict_monument(file: UploadFile = File(..., description="photo prise par le touriste")):
    """
    Reçoit l'image envoyée par un utilisateur, l'analyse avec l'IA Google Gemini,
    et tente de faire correspondre le monument détecté avec notre base de données locale.
    Cette route est protégée par notre dépendance de clé API (verifier_cle_api).
    """
    # 1. Validation du type de fichier (uniquement des images)
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="le fichier doit etre une image")

    try:
        # Lecture du flux de données binaires de l'image
        image_bytes = await file.read()

        # 2. Sécurité : Validation de la taille maximale (10 Mo) pour éviter les saturations mémoire
        max_file_size = 10 * 1024 * 1024
        if len(image_bytes) > max_file_size:
            raise HTTPException(status_code=413, detail="L'image est trop lourd, la taille maximale est 10 Mo")

        # Conversion des octets binaires en un objet Image    manipulable par Pillow
        image = Image.open(io.BytesIO(image_bytes))

        # 3. Optimisation : Redimensionnement de l'image (max 1024px) pour accélérer l'envoi vers Gemini
        max_size = 1024
        image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

        prompt = """
        Agis en tant que guide expert du Togo. Analyse cette photo touristique.
        Identifie le monument ou le lieu (ex: Monument de l'Indépendance, Colombe de la Paix, Palais de Lomé, Tata Tamberma, Grand Marché).

        Tu dois renvoyer TOUJOURS une histoire courte au cas où le lieu n'est pas dans notre base.

        Réponds STRICTEMENT au format JSON suivant, sans balises Markdown :
        {
            "monument": "Nom officiel du lieu",
            "histoire": "Histoire ou description culturelle rapide en français.",
            "localité": "localité dans lequel le monument se trouve",
            "region": "region dans laquelle se trouve le monument"
        }
        """

        # 5. Appel de l'API Gemini avec le modèle multimédia léger et performant gemini-2.5-flash

        response = Client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[image, prompt]
        )

        # 6. Nettoyage de la réponse IA pour enlever d'éventuels blocs de code Markdown (```json ... ```)

        texte_brut = response.text.strip()
        if texte_brut.startswith("```json"):
            texte_brut = texte_brut.replace("```json", "").replace("```", "").strip()
        elif texte_brut.startswith("```"):
            texte_brut = texte_brut.replace("```", "").strip()

        # Conversion de la chaîne de texte nettoyée en un dictionnaire Python
        data_touristique = json.loads(texte_brut)
        data_tour = data_touristique.get("monument", "").lower()

        donnees_finales = None

         # 7. Algorithme de réconciliation : Recherche si le monument trouvé par l'IA existe dans notre JSON local

        for m in BASE_MONUMENT:
         # Vérification croisée par inclusion de chaînes (insensible à la casse)
             if data_tour in m["nom"].lower() or m["nom"].lower() in data_tour:
                donnees_finales = {
                    "monument": m["nom"],
                    "histoire": m["histoire"],
                    "localite": m["localite"],
                    "region": m["region"],
                    "latitude": m["latitude"],
                    "longitude": m["longitude"],
                    "source": "local_database" # Indique que la donnée vient du fichier local sûr
            }
                break
        # 8. Système de secours (Fallback) : Si non trouvé en base locale, on adopte les coordonnées génériques du Togo

        if not donnees_finales:
             donnees_finales = {
                 "monument": data_touristique.get("monument", "Monument inconnu"),
                 "histoire": data_touristique.get("histoire", "Monument identifié au Togo. Description officielle en cours de rédaction"),
                 "localite": data_touristique.get("localite", "localité dans lequel le monument se trouve"),
                 "region": data_touristique.get("region", "region dans laquelle se trouve le monument"),
                 "latitude": data_touristique.get("latitude", 6.1311), # Coordonnées par défaut (ex: Lomé)
                 "longitude": data_touristique.get("longitude", 1.2227),
                 "source": "ai_fallback" # Indique que la donnée provient exclusivement de l'IA
            }

        return {
                "prediction_status": "success",
                "data": donnees_finales
        }
    
    
        # Gestion des exceptions spécifiques
    except json.JSONDecodeError:
        # Erreur levée si Gemini renvoie du texte standard au lieu du format JSON demandé
        raise HTTPException(status_code=500, detail="Format JSON invalide gemini ne peut pas le renvoyé")
    except Exception as e:
        # Capture de toute autre erreur (problème réseau, API Key expirée, erreur Pillow...)
<<<<<<< HEAD
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse avec Gemini : {str(e)}")
    


    
  
=======
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse avec Gemini : {str(e)}")
>>>>>>> 927c6a07db10b2c1475a462dd4fcc2895f8e998f
