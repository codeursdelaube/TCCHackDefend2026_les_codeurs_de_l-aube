# Instructions d'Architecture : Internationalisation (i18n) et Fix Thème DaisyUI

## 1. Contexte du Projet & Stack
Tu travailles actuellement dans le dossier racine du frontend : `heritogo_frontend`.
**HériTogo** est une application web et mobile de valorisation et de documentation numérique du patrimoine culturel et des monuments du Togo (incluant un scanner de monuments et un guide touristique intelligent).

### Structure du projet :
- Pas de dossier `src/`. Le dossier `app/` est directement à la racine du projet (`heritogo_frontend/app/`).

### Stack Technologique (Strict) :
- **Framework :** Next.js 16 (App Router, React Server Components obligatoires)
- **Styles :** Tailwind CSS v4
- **Composants / Thèmes :** DaisyUI v5
- **Langues à supporter :** Français (fr), Anglais (en), Espagnol (es), Chinois (zh)

---

## 2. Phase 1 : Audit et Scan Global
Avant toute modification de code, tu dois **scanner l'intégralité de l'application** dans le dossier racine `app/` et ses sous-dossiers pour identifier toutes les chaînes de caractères (textes, titres, placeholders, descriptions) écrites en dur. 
Prends note de ces textes pour préparer les dictionnaires de traduction.

---

## 3. Phase 2 : Implémentation de l'Internationalisation (i18n)
Installe et configure la bibliothèque recommandée pour Next.js 16 App Router : `next-intl`.

### Règles d'implémentation :
1. **Routage dynamique :** Déplace les pages actuelles sous un dossier racine `app/[locale]/` pour activer le routage par langue (ex: `/fr/scan`, `/en/scan`), tout en veillant à ce que les routes d'API (`app/api/`) et le dossier `public/` (à la racine) restent en dehors du dossier `[locale]` pour ne pas casser le backend ou les assets.
2. **Middleware :** Crée ou configure le middleware Next.js (`middleware.ts` à la racine) pour détecter automatiquement la langue du navigateur de l'utilisateur, avec redirection automatique vers `/fr` par défaut si la langue n'est pas supportée.
3. **Fichiers de traduction :** Crée les fichiers de messages dans un dossier dédié à la racine (ex: `messages/fr.json`, `messages/en.json`, `messages/es.json`, `messages/zh.json`). Remplis-les avec les textes scannés lors de la Phase 1.
4. **Composant Language Switcher (Navbar) :**
   - Intègre un menu déroulant (Dropdown) propre dans la `Navbar` existante en utilisant les classes natives de DaisyUI 5.
   - **Inspiration UI :** Inspire-toi de la sobriété et de l'efficacité du sélecteur de langue du site `https://edufast.academy/`. Le menu doit afficher la langue actuelle (avec une icône de globe ou le nom de la langue) et ouvrir un dropdown pour switcher proprement en changeant de route via le composant `Link` ou `useRouter` de `next-intl`.

---

## 4. Phase 3 : Correction de la persistance du Thème DaisyUI (Clair/Sombre)
**Problème actuel :** Le switch entre le thème clair et sombre fonctionne via DaisyUI, mais le choix ne persiste pas au rechargement de la page (FOUC - Flash of Unstyled Content).

### Mission (À faire STRICTEMENT après avoir fini l'i18n) :
1. Analyse comment le thème est actuellement appliqué (State local, attribut `data-theme` sur la balise `<html>`).
2. Implémente une solution de persistance robuste adaptée à Next.js 16 :
   - Utilise les cookies (via les Server Actions ou un Middleware) ou un script inline bloquant dans le `RootLayout` (`app/[locale]/layout.tsx`) pour lire le thème stocké (localStorage/cookies) côté serveur avant le premier rendu graphique.
   - Assure-toi que le changement de langue n'écrase pas et ne réinitialise pas le thème choisi par l'utilisateur.

---

## 5. Directives de Qualité
- Ne casse pas le design existant en Tailwind v4 / DaisyUI 5.
- Utilise le typage TypeScript strict pour les clés de traduction de `next-intl` afin d'avoir l'autocomplétion.
- Teste le fonctionnement en mode développement après chaque étape majeure et rapporte les erreurs si tu en rencontres.