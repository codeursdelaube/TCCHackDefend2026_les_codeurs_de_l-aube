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

# À ajouter sous le chargement de hotel.json
with open("resto.json", "r", encoding="utf-8") as fichier_resto:
    BASE_RESTO = json.load(fichier_resto)

# Cache global en mémoire pour mémoriser les résultats textuels de l'IA
CACHE_MONUMENTS_TEXTE = {}

# ==========================================
# 5. MODÈLES DE DONNÉES (PYDANTIC)
# ==========================================

class Monument(BaseModel):
    """ Modèle de validation pour la structure d'un Monument """
    id: int
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
    """ Récupère la liste complète des monuments du Togo stockés en local """
    return BASE_MONUMENT

@app.get("/nearby")
def get_points_interet_proches(lat: float, long: float):
    """
    Parcourt les hôtels et les restaurants pour renvoyer tout ce qui se trouve 
    à moins de 5 kilomètres de l'utilisateur ou du monument.
    """
    decouvertes = []

    # 1. Filtrage des hôtels proches
    for h in BASE_HOTEL:
        dist = calcul_de_l_haversine(lat, long, h["lat"], h["lng"])
        if dist <= 5.0: # Rayon de 5 km
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

    # Tri global du plus proche au plus lointain
    return sorted(decouvertes, key=lambda x: x["distance_km"])

@app.post("/predict", dependencies=[Depends(verifier_cle_api)])
async def predict_monument(file: UploadFile = File(..., description="photo prise par le touriste"), lat: Optional[float] = Query(None, description="Latitude actuelle du touriste"), long: Optional[float] = Query(None, description="Longitude actuelle du touriste")):
    """
    Reçoit l'image envoyée par un utilisateur, l'analyse avec l'IA Google Gemini,
    et tente de faire correspondre le monument détecté avec notre base de données locale.
    Cette route est protégée par notre dépendance de clé API (verifier_cle_api).
    """
    # 1. Validation du type de fichier (uniquement des images)
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="le fichier doit etre une image")

    try:

        # ----------------========================================
        # BOUCLIER 1 : FILTRAGE GÉOGRAPHIQUE GPS (Zéro Appel IA)
        # ----------------========================================

        if lat is not None and long is not None:
            for m in BASE_MONUMENT:
              # Si l'appareil est à moins de 300 mètres (0.3 km) d'un monument de notre JSON 
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

        # 2. Sécurité : Validation de la taille maximale (10 Mo) pour éviter les saturations mémoire
        max_file_size = 10 * 1024 * 1024
        if len(image_bytes) > max_file_size:
            raise HTTPException(status_code=413, detail="L'image est trop lourd, la taille maximale est 10 Mo")

        # Conversion des octets binaires en un objet Image    manipulable par Pillow
        image = Image.open(io.BytesIO(image_bytes))

        # 3. Optimisation : Redimensionnement de l'image (max 1024px) pour accélérer l'envoi vers Gemini
        max_size = 1024
        image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

        # ----------------========================================
        # INJECTION DE TA BASE JSON DANS LE PROMPT (GROUNDING)
        # ----------------========================================

        # On crée une version texte simplifiée de ton JSON pour ne pas surcharger le prompt

        catalogue_officiel = [{"nom": m["nom"], "localite": m["localite"]} for m in BASE_MONUMENT]
        catalogue_str = json.dumps(catalogue_officiel, ensure_ascii=False)

        prompt = f"""
        Tu es un expert en reconnaissance du patrimoine togolais. 
        Ton unique mission est de vérifier si l'image correspond STRICTEMENT à l'un des monuments de cette liste officielle :
        {catalogue_str}

        RÈGLES DE SÉCURITÉ INVIOLABLES :
        1. Compare l'image avec les noms de la liste officielle fournie.
        2. Si l'image correspond à un monument de la liste, renvoie "est_monument": true et le "nom_probable" exact de la liste.
        3. Si le monument visible n'est PAS dans la liste fournie, ou si l'image montre autre chose (objet, personne, lieu étranger), tu dois impérativement répondre : {{"est_monument": false, "nom_probable": ""}}.
        4. INTERDICTION FORMELLE d'utiliser tes connaissances externes sur d'autres monuments mondiaux. Ne réponds que si c'est dans la liste.
        5. Réponds uniquement en JSON brut, sans balises markdown.

        Format : {{"est_monument": bool, "nom_probable": "nom exact du catalogue"}}
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
        if not donnees_finales:
            return {"prediction_status": "unknown"}

        # Sauvegarde du résultat dans notre cache textuel global
        CACHE_MONUMENTS_TEXTE[data_tour] = donnees_finales

        return {
                "prediction_status": "success",
                "data": donnees_finales
        }
    
    
        # Gestion des exceptions spécifiques
    except json.JSONDecodeError:
        # Erreur levée si Gemini renvoie du texte standard au lieu du format JSON demandé
        raise HTTPException(status_code=500, detail="Format JSON invalide gemini ne peut pas le renvoyé")
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RessourceExhausted" in error_msg:
            raise HTTPException(status_code=429, detail="Serveurs d'analyse saturés.")
        # Capture de toute autre erreur (problème réseau, API Key expirée, erreur Pillow...)
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse : {str(e)}")