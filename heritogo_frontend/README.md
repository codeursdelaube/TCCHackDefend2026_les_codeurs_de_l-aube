# HeriTogo — Frontend

PWA de tourisme et de patrimoine culturel togolais, en production sur [heritogo.codorah.com](https://heritogo.codorah.com) : sites patrimoniaux (dont le Koutammakou, UNESCO), gastronomie, parcs et loisirs, scanner IA de monuments et réservation de guides locaux vérifiés.

## Stack

| Domaine | Choix |
|---|---|
| Framework | Next.js 16 (App Router) — lire `node_modules/next/dist/docs/` avant de coder (voir `AGENTS.md`) |
| UI | Tailwind CSS v4 + DaisyUI v5 (configuration CSS-first dans `app/globals.css`), Lucide, Framer Motion |
| Données | Supabase (auth, stockage) + Prisma / PostgreSQL (`prisma/schema.prisma`) |
| i18n | `next-intl` — `fr` (défaut), `en`, `es`, `zh`, préfixe de langue toujours présent |
| IA | Backend FastAPI (scanner, chatbot) appelé via `app/api/scan` et `app/api/chatbot` |

## Démarrage

```bash
cp .env.example .env   # puis renseigner les clés
npm install
npx prisma generate
npm run dev            # http://localhost:3000/fr
```

Scripts : `npm run build`, `npm run start`, `npm run lint`.

## Organisation

```
app/[locale]/        Pages localisées (accueil, lieux, cuisine, régions, loisirs, guides, booking, scan, dashboard…)
app/api/             Routes API (catalogue, réservations, avis, guides, KYC, scan, chatbot, admin)
components/          Composants partagés (ui/, bookings/, legal/, ads/, providers/)
lib/                 Logique métier : auth, catalogue, réservations, sécurité, utilitaires
lib/data/            Données locales de repli (sites, plats, parcs, restaurants, hôtels)
messages/            Traductions (fr, en, es, zh)
proxy.ts             Middleware Next 16 : langue + garde de session des routes protégées
```

## Mise en relation guide ↔ touriste

1. Le touriste consulte un guide vérifié et envoie une **demande de devis** (`POST /api/bookings`).
2. Le guide répond par un **devis ferme** en XOF ou décline (`POST /api/guide/bookings`).
3. Le touriste **accepte** ou refuse le devis (`POST /api/tourist/bookings`) ; les coordonnées des deux parties ne sont partagées qu'après confirmation.
4. Le guide démarre puis clôture la mission ; le touriste laisse un **avis vérifié** (`POST /api/reviews`).

Chaque transition crée une notification in-app et, si `RESEND_API_KEY` est configurée, un e-mail. Les règles de transition sont centralisées dans `lib/bookings/`.

## Charte graphique

Palette terre cuite / doré / vert forêt et typographies Fraunces + Manrope : voir `CLAUDE.md` et les tokens de `app/globals.css`. Pas de données fictives ni d'images de remplacement.
