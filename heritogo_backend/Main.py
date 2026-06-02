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
