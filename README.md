# 🇹🇬 Heritogo — Guide Touristique Intelligent du Togo

> PWA multilingue propulsée par l'IA pour découvrir le patrimoine culturel, historique et culinaire du Togo.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google)](https://ai.google.dev/)

---

##  Problématique & Track

**Track :** Apps & Web

**Problématique :** Le patrimoine culturel, historique et gastronomique du Togo est peu accessible aux touristes locaux et internationaux. Il n'existe pas d'outil numérique unifié permettant de découvrir les sites historiques, les monuments et la cuisine togolaise de manière interactive et autonome. Heritogo y répond en proposant une application web progressive intelligente, disponible hors-ligne, multilingue(pour plus tard) et géolocalisée.

---

## Fonctionnalités

- **Scanner IA de monuments** — Photographiez un monument et obtenez instantanément son histoire complète grâce à Gemini 2.5 Flash
- **Géolocalisation & Proximité** — Sites historiques, hôtels et restaurants les plus proches calculés en temps réel (formule de Haversine)
- **Patrimoine Culinaire** — Explorez les plats typiques togolais (Fufu, Ablo, Kom…) et trouvez où les déguster
- **Guide Audio (TTS)** — Synthèse vocale intégrée pour une expérience de guide touristique de poche
- **Mode hors-ligne (PWA)** — Fonctionne sans connexion après le premier chargement
- **Thème clair/sombre** — Interface adaptée à tous les environnements

---

## Stack Technologique

### Frontend

| Technologie | Rôle |
|---|---|
| Next.js 16 (App Router) | Framework React, routing, SSR |
| TypeScript | Typage statique |
| Tailwind CSS v4 + DaisyUI | Styling & theming (thèmes `light` / `synthwave`) |
| Framer Motion | Animations |
| Leaflet + React-Leaflet | Cartographie interactive |
| Swiper.js | Carrousels |
| Lucide react | Icônes |

### Backend

| Technologie | Rôle |
|---|---|
| FastAPI (Python 3.10+) | API REST |
| Google GenAI SDK | Analyse d'images via Gemini 2.5 Flash |
| Pillow | Traitement d'images |
| JSON (fichiers locaux) | Base de données légère & portable |
| Haversine (haversine.py) | Calcul de distances GPS |

### Infrastructure

| Service | Usage |
|---|---|
| Vercel | Déploiement frontend |
| Railway | Déploiement backend |

---

## 📂 Structure du Projet
```
TCCHackDefend2026_Heritogo/
├── heritogo_backend/
│   ├── Main.py              # Point d'entrée FastAPI
│   ├── haversine.py         # Calcul de distances GPS
│   ├── monument.json        # Base de données des sites historiques
│   ├── hotel.json           # Base de données des hébergements
│   ├── resto.json           # Base de données des restaurants
│   └── requirements.txt
│
└── heritogo_frontend/
├── app/
│   ├── _components/     # Composants réutilisables
│   ├── api/             # Routes API Next.js (hotels, scan)
│   ├── cuisine/         # Section patrimoine culinaire
│   ├── lieux/           # Sites touristiques
│   ├── loisirs/         # Loisirs
│   ├── nearbyhotels/    # Hôtels à proximité
│   ├── Plats/           # Détail des plats
│   ├── Resto/           # Restaurants
│   ├── scan/            # Scanner IA monuments
│   ├── globals.css      # Config Tailwind v4 + thèmes DaisyUI
│   ├── layout.tsx       # Layout racine
│   └── page.tsx         # Page d'accueil
├── public/
│   ├── Cuisine/         # Images des plats
│   ├── Sites/           # Images des monuments
│   ├── parks/           # Images des parcs
│   ├── manifest.json    # Config PWA
│   └── sw.js            # Service Worker
├── next.config.ts
├── postcss.config.mjs
└── tsconfig.json

```
---

## Installation & Lancement

### Prérequis

- [Node.js](https://nodejs.org) v18+
- [Python](https://python.org) v3.10+
- Une clé API Google Gemini — [Google AI Studio](https://aistudio.google.com/)

---

### 1. Cloner le dépôt

```bash
git clone https://github.com/codeursdelaube/TCCHackDefend2026_les_codeurs_de_l-aube.git

```

### 2. Backend (FastAPI)

```bash
cd heritogo_backend

# Créer et activer l'environnement virtuel
python -m venv venv

# Linux / macOS
source venv/bin/activate

# Windows (CMD)
venv\Scripts\activate

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
# Créez un fichier .env et ajoutez :
# GEMINI_API_KEY=votre_cle_api
# API_SECRET_KEY=votre_secret

# Lancer le serveur
uvicorn Main:app --reload
```

API disponible sur `https://heritogo-production.up.railway.app`  
Documentation Swagger : `https://heritogo-production.up.railway.app/docs`

---

### 3. Frontend (Next.js)

```bash
cd heritogo_frontend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
# Créez un fichier .env.local et ajoutez :
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# Lancer l'application
npm run dev
```

Application disponible sur `http://localhost:3000`

---

### 4. Démo en ligne

 **[https://heritogo.vercel.app/](https://heritogo.vercel.app/)**

Aucune installation requise pour tester la version déployée.

---

##  Équipe

| Nom | Rôle | Filière |
|---|---|---|
| ADOKOU Koffi Éric | Frontend / Next.js | Génie logiciel |
| AFANOU Kossi tété Samuel | Backend / FastAPI /IA| Génie logiciel |
| ALABI Mbarak | Data  | Génie logiciel |
| HAZOUME gérard wilfried | Data| réseaux & système informatique |


---

##  Hackathon

Projet développé dans le cadre du **TCC Hack & Defend 2026** — Thématique Apps Web & IA.  
Objectif : digitaliser le patrimoine culturel et touristique togolais pour dynamiser l'économie locale.

---

*Codez avec intention. Présentez avec conviction. Défendez avec passion. 🇹🇬*
