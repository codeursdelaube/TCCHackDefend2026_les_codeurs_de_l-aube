# Guide d'Intégration & Configuration Google AdSense — HeriTogo

Ce document détaille toutes les étapes nécessaires pour activer, configurer et administrer **Google AdSense** sur la Progressive Web App (PWA) **HeriTogo**, conformément aux règles de monétisation éthique, de respect de la vie privée (RGPD) et d'expérience utilisateur (Core Web Vitals / Lighthouse).

---

## 1. Vue d'Ensemble de l'Architecture

- **Client ID AdSense** : `ca-pub-3944525312929685` (ou votre propre identifiant)
- **Fichier `ads.txt`** : Déployé à la racine publique (`public/ads.txt` accessible sur `https://votre-domaine.com/ads.txt`)
- **Chargement du script** : Via `next/script` avec la stratégie `afterInteractive` dans `app/[locale]/layout.tsx`
- **Composant d'affichage** : `<AdSlot slot="..." format="auto" />` (`components/AdSlot.tsx`)
- **Exclusion automatique** : Aucune publicité n'est affichée pour les utilisateurs abonnés (Premium)
- **Gestion du consentement RGPD** : Intégration native avec le module **Google Privacy & Messaging** (Funding Choices) et lien de révocation dans le Footer

---

## 2. Variables d'Environnement

Ajoutez les variables suivantes dans votre fichier `.env` (et dans le dashboard Vercel en production) :

```env
# Google AdSense
# Format obligatoire: ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-3944525312929685

# Interrupteur général (true = pubs actives, false = aucune pub ni script chargé)
NEXT_PUBLIC_ADS_ENABLED=true
```

> **Note de sécurité & performance** : Si `NEXT_PUBLIC_ADSENSE_CLIENT_ID` est absent ou si `NEXT_PUBLIC_ADS_ENABLED=false`, aucun script Google AdSense n'est injecté dans le DOM et aucun composant `<AdSlot />` ne réserve d'espace.

---

## 3. Configuration dans le Tableau de Bord Google AdSense

### Étape 1 : Ajout et validation du site
1. Connectez-vous sur [Google AdSense](https://www.google.com/adsense/).
2. Allez dans **Sites** > **Ajouter un site**.
3. Saisissez votre nom de domaine de production (ex: `heritogo.codorah.com` ou `heritogo.vercel.app`).
4. **Validation `ads.txt`** :
   - Assurez-vous que le fichier `public/ads.txt` est bien en ligne à l'adresse `https://votre-domaine.com/ads.txt`.
   - Ligne présente :
     ```text
     google.com, pub-3944525312929685, DIRECT, f08c47fec0942fa0
     ```
   - *Où remplacer l'identifiant ?* : Remplacez `pub-3944525312929685` dans `public/ads.txt` et dans votre `.env` (`NEXT_PUBLIC_ADSENSE_CLIENT_ID`) si vous utilisez un autre compte.
5. Cliquez sur **Vérifier** dans AdSense. Le statut passera à *Prêt* après quelques heures.

---

### Étape 2 : Blocage des catégories sensibles (Monétisation éthique & culturelle)
Pour préserver la crédibilité culturelle d'HeriTogo et respecter les publics familiaux :
1. Dans Google AdSense, rendez-vous dans **Sécurité de la marque** > **Contrôles de blocage** (ou **Bloquer des annonces**).
2. Cliquez sur **Catégories sensibles**.
3. **Bloquez impérativement** les catégories suivantes :
   - 🚫 **Paris et jeux d'argent** (Gambling & Betting)
   - 🚫 **Alcool** (Alcoholic Beverages)
   - 🚫 **Rencontres et séduction** (Dating & Personals)
   - 🚫 **Politique** (Politics)
   - 🚫 **Religion** (Religion)
   - 🚫 **Cosmétique et chirurgie intrusive**
   - 🚫 **Prêts sur salaire et finance rapide à risque**

---

### Étape 3 : Configuration du Message de Consentement RGPD (Funding Choices)
Conformément à la directive européenne ePrivacy et au RGPD (applicable aux membres de la diaspora et touristes européens) :
1. Dans Google AdSense, allez dans **Confidentialité et messages** (Privacy & messaging).
2. Sous **Règlementation européenne (RGPD)**, cliquez sur **Créer un message**.
3. Paramètres recommandés :
   - **Langues sélectionnées** : Français, Anglais, Espagnol, Chinois.
   - **Options pour les utilisateurs** : Activez l'option *« Consentir »*, *« Gérer les options »*, et *« Ne pas consentir »*.
   - **URL de la politique de confidentialité** : Renseignez `https://votre-domaine.com/fr/confidentialite`.
4. Publiez le message. AdSense injectera automatiquement la CMP certifiée Google (IAB TCF v2.2) via le script `adsbygoogle.js`.
5. **Révocation du consentement** : Le lien *« Gérer mes préférences de publicité »* situé dans le Footer de l'application déclenche automatiquement `window.googlefc.showRevocationMessage()` pour permettre aux utilisateurs de modifier leurs choix à tout moment.

---

### Étape 4 : Création des Blocs d'Annonces (Ad Units)
1. Allez dans **Annonces** > **Par bloc d'annonces**.
2. Créez des blocs d'annonces display réactifs (Responsive Display) correspondant à vos emplacements :
   - `places-detail-slot` : Fiche monument / site touristique
   - `dishes-detail-slot` : Fiche gastronomie / plat
   - `places-list-slot` : Grille des sites touristiques
   - `dishes-list-slot` : Grille des spécialités culinaires
3. Récupérez l'identifiant numérique de chaque slot (ex: `1234567890`) et reportez-le dans les props `slot="..."` des composants `<AdSlot />`.

---

## 4. Emplacements Autorisés et Règles Strictes

| Emplacement | Fichier source | Position exacte | Format |
|---|---|---|---|
| **Fiche Site Touristique** | `app/[locale]/lieux/[id]/page.tsx` | Entre la description et la section Hôtels proches | `auto` |
| **Fiche Plat Culinaires** | `app/[locale]/cuisine/[id]/page.tsx` | Immédiatement après la liste des restaurants | `auto` |
| **Catalogue des Sites** | `app/[locale]/lieux/page.tsx` | Pub native intégrée après la 8ème carte | `auto` (pleine largeur de grille) |
| **Catalogue des Plats** | `app/[locale]/cuisine/page.tsx` | Pub native intégrée après la 8ème carte | `auto` (pleine largeur de grille) |

### ⛔ Emplacements strictement interdits (Aucune pub)
- Écran de scan IA et résultats de scan (`/scan`)
- Page de paywall et formules d'abonnement (`/subscription`)
- Pages d'authentification (`/auth/login`, `/auth/register`, `/auth/forgot-password`)
- Processus de réservation de guides (`/booking`)
- Tableaux de bord touristes et guides (`/dashboard/tourist`, `/dashboard/guide`)
- Console d'administration (`/dashboard/admin`)

---

## 5. Fonctionnement du composant `<AdSlot />`

Le composant `<AdSlot />` intègre des protections avancées :
1. **Garde anti-double appel (React Strict Mode)** : Grâce à un `useRef(false)`, `adsbygoogle.push({})` n'est invoqué qu'une seule et unique fois par bloc.
2. **Anti Cumulative Layout Shift (CLS)** : Une hauteur minimale (`min-h-[120px]` ou `min-h-[250px]`) est réservée avec un style DaisyUI épuré (`bg-base-200/50`).
3. **Gestion transparente des Adblockers** : Si l'utilisateur a activé un bloqueur d'annonces, le composant intercepte silencieusement l'événement et masque le bloc sans générer d'erreur console ni de trou visuel difforme.
4. **Pas de pub pour les abonnés** :
   - Vérifie `isSubscriber` côté serveur (sans double `getUser()`).
   - Vérifie `isClientSubscribed(user)` côté client (`user_metadata`, `app_metadata` ou stockage local PWA).
   - Si abonné, le composant retourne immédiatement `null`.

---

## 6. Tester en Local et en Pré-production

### Tester avec les publicités désactivées
Dans `.env.local` :
```env
NEXT_PUBLIC_ADS_ENABLED=false
```
Résultat attendu : Aucun script Google ne se charge, le DOM ne contient aucun élément publicitaire.

### Tester le comportement pour les utilisateurs abonnés
1. Rendez-vous sur la page `/fr/subscription`.
2. Cliquez sur **Activer l’accès Premium**.
3. Naviguez sur une fiche de monument (`/fr/lieux/...`) ou de plat (`/fr/cuisine/...`).
4. Résultat attendu : Les encarts publicitaires disparaissent automatiquement.

### Tester en mode développement avec AdSense
En environnement local (`localhost`), Google n'affiche généralement pas de véritables bannières (un bloc vide ou un avertissement AdSense peut apparaître en console). C'est le comportement normal tant que le domaine de production n'est pas vérifié.
