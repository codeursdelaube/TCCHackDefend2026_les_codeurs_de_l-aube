from fastapi import FastAPI, File, Query, UploadFile, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
import io
from pydantic_settings import BaseSettings, SettingsConfigDict
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps
from google import genai
from haversine import calcul_de_l_haversine 
from fastapi import Security, Depends
from fastapi.security import api_key
from chatbot import router as chatbot_router


# ==========================================
# 1. CONFIGURATION ET VARIABLES D'ENVIRONNEMENT
# ==========================================

class Settings(BaseSettings):
    """
    Gestion centralisée des variables de configuration avec Pydantic Settings.
    Charge automatiquement les variables stockées dans le fichier '.env'.
    """
    gemini_api_key: str # Clé secrète pour s'authentifier auprès de l'API Google Gemini
    api_secret_key: str # Clé secrète requise pour sécuriser l'accès à certaines routes de notre API
    
    # Configuration pour lier Pydantic au fichier physique .env
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Instanciation des paramètres pour une utilisation globale
settings = Settings()

# Initialisation de l'application FastAPI
app = FastAPI(title="heritogo_backend")

app.include_router(chatbot_router)

# Initialisation du client de l'API Google GenAI avec la clé récupérée du .env
Client = genai.Client(api_key=settings.gemini_api_key)

# ==========================================
# 2. CONFIGURATION DU MIDDLEWARE (CORS)
# ==========================================

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

cle_api = "herit" # NE PAS CHANGER : Nom de l'en-tête (Header) attendu dans la requête HTTP
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

with open("monument.json", "r", encoding="utf-8") as fichier:
    BASE_MONUMENT = json.load(fichier)

with open("hotel.json", "r", encoding="utf-8") as fichier_hotel:
    BASE_HOTEL = json.load(fichier_hotel)

with open("resto.json", "r", encoding="utf-8") as fichier_resto:
    BASE_RESTO = json.load(fichier_resto)

# Cache global en mémoire pour mémoriser les résultats textuels de l'IA
CACHE_MONUMENTS_TEXTE = {}

# ==========================================
# 5. MODÈLES DE DONNÉES (PYDANTIC)
# ==========================================

class Monument(BaseModel):
    id: int
    nom: str
    localite: str
    region: str
    histoire: str
    latitude: float
    longitude: float

class hotel(BaseModel):
    nom: str
    latitude: float
    longitude: float
    prix_nuit: Optional[int] = None
    telephone: Optional[int] = None
    etoiles: Optional[int] = None
    description: Optional[str] = None
    lieux_proches: List[str]

class resto(BaseModel):
    id: int
    nom: str
    quartier: str
    adresse: str
    telephone: int
    latitude: float
    longitude: float
    horaires: str
    budget_fcfa: int
    plats: str

@app.get("/monument", response_model=List[Monument])
def get_Monument():
    return BASE_MONUMENT

@app.get("/nearby")
def get_points_interet_proches(lat: float, long: float):
    decouvertes = []

    # 1. Filtrage des hôtels proches
    for h in BASE_HOTEL:
        dist = calcul_de_l_haversine(lat, long, h["lat"], h["long"])
        if dist <= 5.0:
            h_data = h.copy()
            h_data["distance_km"] = dist
            h_data["type"] = "hotel"
            decouvertes.append(h_data)

    # 2. Filtrage des restaurants proches
    for r in BASE_RESTO:
        dist = calcul_de_l_haversine(lat, long, r["latitude"], r["longitude"])
        if dist <= 5.0:
            r_data = r.copy()
            r_data["distance_km"] = dist
            r_data["type"] = "restaurant"
            decouvertes.append(r_data)

    return sorted(decouvertes, key=lambda x: x["distance_km"])

@app.post("/predict", dependencies=[Depends(verifier_cle_api)])
async def predict_monument(
    file: UploadFile = File(..., description="photo prise par le touriste"), 
    lat: Optional[float] = Query(None, description="Latitude actuelle du touriste"), 
    long: Optional[float] = Query(None, description="Longitude actuelle du touriste")
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Le fichier doit être une image")

    try:
        # ----------------========================================
        # BOUCLIER 1 : FILTRAGE GÉOGRAPHIQUE GPS (Zéro Appel IA)
        # ----------------========================================
        if lat is not None and long is not None:
            for m in BASE_MONUMENT:
                distance_user_monument = calcul_de_l_haversine(lat, long, m["latitude"], m["longitude"])
                if distance_user_monument <= 0.3:
                    return {
                        "prediction_status": "success",
                        "data": {
                            "monument": m["nom"],
                            "histoire": m["histoire"],
                            "localite": m["localite"],
                            "region": m["region"],
                            "latitude": m["latitude"],
                            "longitude": m["longitude"],
                            "source": "gps_local_database"
                        }
                    }

        # Lecture du flux de données binaires de l'image
        image_bytes = await file.read()

        # 2. Sécurité : Validation de la taille maximale (10 Mo)
        max_file_size = 10 * 1024 * 1024
        if len(image_bytes) > max_file_size:
            raise HTTPException(status_code=413, detail="L'image est trop lourde, la taille maximale est 10 Mo")

        # Conversion et redressement automatique de l'orientation EXIF de l'image (Crucial pour smartphones)
        image = Image.open(io.BytesIO(image_bytes))
        image = ImageOps.exif_transpose(image)

        # 3. Optimisation : Redimensionnement de l'image (max 1024px)
        max_size = 1024
        image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

        # ----------------========================================
        # INJECTION DE TA BASE JSON DANS LE PROMPT (GROUNDING OPTIMISÉ)
        # ----------------========================================
        # CORRECTION HISTOIRE : On inclut l'histoire/description pour donner des indices visuels à Gemini !
        catalogue_officiel = [{
            "nom": m["nom"], 
            "localite": m["localite"], 
            "indices_visuels": m["histoire"]
        } for m in BASE_MONUMENT]
        catalogue_str = json.dumps(catalogue_officiel, ensure_ascii=False)

        prompt = f"""
        Tu es un expert en reconnaissance du patrimoine architectural et culturel togolais. 
        Ton unique mission est de vérifier si l'image correspond à l'un des monuments de cette liste officielle :
        {catalogue_str}

        RÈGLES DE SÉCURITÉ INVIOLABLES :
        1. Analyse les formes de la structure, les statues, les textures de pierre ou béton décrits dans les "indices_visuels". Tolère les variations d'angles, d'ombres ou de reflets propres aux caméras de smartphones.
        2. Si l'image correspond à un monument de la liste, renvoie "est_monument": true et le "nom_probable" exact correspondant dans la liste.
        3. Si le monument visible n'est absolument PAS dans la liste fournie, ou si l'image montre autre chose d'anondin (objet interne, selfie, animal sans rapport), réponds impérativement : {{"est_monument": false, "nom_probable": ""}}.
        4. Réponds uniquement en JSON brut valide, sans balises markdown ni texte décoratif.

        Format attendu : {{"est_monument": bool, "nom_probable": "nom exact du catalogue"}}
        """

        # 5. Appel de l'API Gemini 1.5 Flash
        response = Client.models.generate_content(
            model='gemini-1.5-flash',
            contents=[image, prompt]
        )

        # 6. Nettoyage de la réponse IA
        texte_brut = response.text.strip()
        if texte_brut.startswith("```json"):
            texte_brut = texte_brut.replace("```json", "").replace("```", "").strip()
        elif texte_brut.startswith("```"):
            texte_brut = texte_brut.replace("```", "").strip()

        data_touristique = json.loads(texte_brut)

        # Validation immédiate de la réponse de l'IA
        if not data_touristique.get("est_monument") or not data_touristique.get("nom_probable"):
            return {
                "prediction_status": "unknown",
                "detail": "Monument non répertorié ou non identifiable au Togo."
            }

        data_tour = data_touristique.get("nom_probable", "").lower().strip()

        # ----------------========================================
        # BOUCLIER 3 : TEXT-BASED CACHING (Performance accrue)
        # ----------------========================================
        if data_tour in CACHE_MONUMENTS_TEXTE:
            return {
                "prediction_status": "success",
                "data": CACHE_MONUMENTS_TEXTE[data_tour]
            }

        donnees_finales = None

        # 7. Algorithme de réconciliation
        for m in BASE_MONUMENT:
            if data_tour in m["nom"].lower() or m["nom"].lower() in data_tour:
                donnees_finales = {
                    "monument": m["nom"],
                    "histoire": m["histoire"],
                    "localite": m["localite"],
                    "region": m["region"],
                    "latitude": m["latitude"],
                    "longitude": m["longitude"],
                    "source": "local_database"
                }
                break

        if not donnees_finales:
            return {"prediction_status": "unknown"}

        # Sauvegarde du résultat dans le cache textuel global
        CACHE_MONUMENTS_TEXTE[data_tour] = donnees_finales

        return {
            "prediction_status": "success",
            "data": donnees_finales
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Format JSON invalide retourné par le moteur d'analyse.")
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RessourceExhausted" in error_msg:
            raise HTTPException(status_code=429, detail="Le serveur d'analyse est très sollicité. Veuillez réessayer.")
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse : {str(e)}")