# HeriTogo Web — Briefing de refonte UI/UX

## 0. Présentation du projet (contexte à lire avant toute action)

HeriTogo est une plateforme de tourisme et de patrimoine culturel togolais,
en production sous forme de PWA (`heritogo.codorah.com`). Elle permet de :

- Découvrir **29 sites patrimoniaux** togolais (monuments, dont le
  Koutammakou, classé UNESCO — cases traditionnelles Tata Somba)
- Identifier un monument en photo via un **scanner IA** (vision par
  ordinateur)
- Explorer **5 régions** touristiques (Littoral/Maritime, Écotourisme
  Plateaux & Kloto, UNESCO Kara & Koutammakou, etc.)
- Découvrir la **gastronomie togolaise** (31 plats : Ayimolou, Fufu, Ablo,
  Djenkoumé, Wagasi...)
- Explorer des **parcs et loisirs** (16 lieux : Aqualand, Kéran, Tata Park,
  O2 Zoo...)
- Réserver des **guides locaux certifiés** (profils vérifiés, tarifs,
  avis, paiement Mobile Money — Flooz/T-Money)

Le contenu réel (images, textes) existe déjà dans `public/Sites/`,
`public/Cuisine/`, `public/parks/`, plus les visuels hero (`Hero1.png`,
`Hero2.png`, `Hero3.png`, `fufuhero`, `deuxlions`). **Toute refonte doit
utiliser ce contenu réel, jamais de placeholders.**

Le backend est Next.js App Router (routes API + Supabase/Prisma), avec un
schéma de données couvrant profils, guides, réservations, avis, documents
de vérification (voir `schema.prisma` déjà fourni au projet si disponible
dans le repo).

Une version mobile (React Native/Expo) est en cours de développement en
parallèle, avec sa propre identité visuelle en cours de définition — les
deux plateformes devront converger sur la même palette une fois validée,
mais **ce briefing concerne uniquement le site web**.

---

## 1. Ce qui est demandé

**Refonte complète de l'UI/UX du site web**, pas un ajustement cosmétique :

- Page d'accueil (hero inclus)
- Toutes les cards (sites, régions, cuisine, guides, parcs)
- Toutes les sections de contenu
- Boutons (primaire, secondaire, ghost, etc.) et tout le système d'icônes
- Cohérence visuelle sur l'ensemble des pages existantes, pas seulement
  l'accueil

Le design actuel ne convient pas et doit être repensé, pas patché.

---

## 2. Stack technique à utiliser

| Domaine | Choix |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Composants UI de base | DaisyUI v5 (plugin Tailwind v4) |
| Icônes | `lucide-react` |
| Animations | `framer-motion` |

**Point d'attention technique important pour Tailwind v4** : la
configuration ne passe plus principalement par `tailwind.config.js` mais
par la directive `@theme` directement dans le CSS global (`globals.css`
ou équivalent), avec `@import "tailwindcss";`. DaisyUI v5 s'installe comme
plugin CSS (`@plugin "daisyui";`) et non plus via `plugins: []` dans un
fichier JS. L'agent doit vérifier la configuration actuelle du projet
avant de commencer, pour ne pas mélanger l'ancienne syntaxe Tailwind v3
(`tailwind.config.js` avec `theme.extend.colors`) et la nouvelle syntaxe
CSS-first de v4 — les deux ne fonctionnent pas de la même façon et un
mélange incohérent est une source d'erreurs fréquente lors de ce genre de
migration/refonte.

---

## 3. Direction artistique et palette de couleurs

### Intention générale

Le sujet — patrimoine togolais, architecture Koutammakou, gastronomie,
guides locaux — appelle une identité **chaude, terreuse, vivante**, pas une
identité "app corporate" générique (pas de bleu nuit froid, pas de
noir/orange qui ressemble à n'importe quelle app tech). L'inspiration vient
des matériaux réels : terre cuite et enduit ocre des cases Tata Somba,
teintes de la gastronomie locale (fufu, gari, sauce arachide), tissus wax.
Pas de motifs "tribaux" clichés — la couleur et la typographie suffisent à
porter cette identité si elles sont bien choisies.

### Palette (à définir en `@theme` CSS, Tailwind v4)

```css
@theme {
  /* Marque — terre cuite profonde, pas un orange criard */
  --color-primary: #B5502E;
  --color-primary-dark: #8A3A20;
  --color-primary-light: #D97A52;

  /* Accent — doré chaud, réservé aux éléments de valeur */
  --color-accent: #D9A441;

  /* Touche rare — vert forêt, écotourisme/région Plateaux, équilibre visuel */
  --color-forest: #3E5C45;

  /* Mode clair */
  --color-background: #FBF6EF;   /* ivoire chaud, jamais blanc pur */
  --color-surface: #FFFFFF;
  --color-ink: #2A1E16;
  --color-ink-muted: #7A6A5C;

  /* Mode sombre */
  --color-background-dark: #171009;  /* brun très foncé, jamais noir pur */
  --color-surface-dark: #241A11;
  --color-ink-on-dark: #F2E9DC;
  --color-ink-muted-dark: #B5A390;
}
```

Règles d'usage :
- **Terracotta (`primary`) comme couleur dominante**, pas juste un accent
  — c'est la couleur des CTA principaux, headers, éléments structurants.
- **Doré (`accent`) utilisé avec parcimonie** — réservé aux badges de
  valeur (UNESCO, notes/avis, mise en avant du scanner), jamais en fond
  large.
- **Vert forêt en touche rare** — région Écotourisme, icônes nature
  uniquement. Ne pas en abuser, la palette doit rester dominée par les
  tons terre/doré.
- **Jamais de noir ou blanc purs** dans l'UI — utiliser les fonds
  légèrement teintés définis ci-dessus.

### Typographie

- **Titres** : une serif à empattements marqués et du caractère (Fraunces
  en priorité, Lora en alternative plus sobre si Fraunces pose un souci de
  licence/poids de chargement) — ton "guide patrimoine/livre de voyage",
  pas "landing page SaaS".
- **Corps de texte** : Manrope ou Inter — neutre et lisible, laisse la
  vedette aux titres et aux photos.

---

## 4. Principes UI/UX à appliquer

- **Photo-first** : le contenu réel (30 sites, 31 plats, 16 parcs) est
  visuellement fort. Les cards doivent laisser la photo dominer (grand
  ratio image, texte en overlay ou juste en dessous), pas la noyer dans du
  chrome UI superflu.
- **Badge UNESCO visuellement distinct** — Koutammakou est l'argument le
  plus fort du projet, un badge doré bien identifiable sur les fiches
  concernées renforce la crédibilité perçue.
- **Le scanner IA reste l'élément signature** — doit rester mis en avant
  visuellement (couleur accent/doré, position privilégiée), c'est la
  fonctionnalité différenciante du produit.
- **Boutons** : coins arrondis modérés (pas trop ronds, ça infantilise le
  propos), pas d'ombres portées génériques type Material Design par
  défaut de DaisyUI sans personnalisation — adapter le thème DaisyUI à la
  palette ci-dessus plutôt que garder ses couleurs par défaut.
- **Animations Framer Motion** : subtiles et fonctionnelles (fade-in au
  scroll, transition douce sur hover des cards, parallax léger sur le
  hero) — jamais gratuites ou distrayantes. Respecter
  `prefers-reduced-motion`.
- **Icônes Lucide** : cohérence de poids de trait sur tout le site, pas de
  mélange avec d'autres sets d'icônes. Prévoir des icônes custom en SVG
  uniquement si Lucide ne couvre pas un besoin spécifique (ex. motifs
  patrimoine togolais).
- **Accessibilité** : contrastes suffisants même avec la palette chaude
  (vérifier notamment le texte sur fond `accent` doré, qui peut manquer de
  contraste en clair — préférer du texte foncé dessus, pas blanc).

---

## 5. Consignes non négociables (rappel du projet)

- **Aucune donnée mock** : chaque section doit continuer à consommer les
  vraies données existantes (API routes / Supabase), la refonte ne
  touche que le visuel et la structure des composants, pas la source des
  données.
- **Utiliser les vraies images** de `public/Sites/`, `public/Cuisine/`,
  `public/parks/` et les visuels hero existants — pas de nouvelles images
  générées ou de placeholders.
- **Ne pas casser les routes/URLs existantes** (`/lieux`, `/regions`,
  `/cuisine`, `/scan`, `/guides`...) — la refonte est visuelle et
  structurelle au niveau des composants, pas une réorganisation de
  l'architecture des pages sauf si explicitement demandé plus tard.

---

## 6. Ce qui est attendu comme premier livrable

Avant de tout refaire d'un coup, procéder dans cet ordre et rapporter
l'avancement :

1. Vérifier la configuration actuelle Tailwind v4 / DaisyUI v5 du projet
   (fichier CSS global, présence ou non de `tailwind.config.js` résiduel
   de v3 à nettoyer).
2. Mettre en place la palette (`@theme`) et le thème DaisyUI personnalisé.
3. Refaire le **hero de la page d'accueil** en premier, comme validation
   de direction artistique avant de propager sur le reste.
4. Une fois le hero validé, enchaîner sur : cards génériques (site, plat,
   parc, guide), sections de la page d'accueil, boutons, puis les pages
   secondaires (lieux, régions, cuisine, guides).

Ne pas attendre une confirmation entre chaque étape mineure si le compte
est en mode gratuit — mais s'arrêter après le hero pour validation avant
de propager à l'ensemble du site.