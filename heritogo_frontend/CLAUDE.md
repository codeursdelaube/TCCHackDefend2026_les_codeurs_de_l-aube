# SKILL — Discipline design HeriTogo (à donner à Codex)

## 🔴 Le bordel actuel, précisément

Ce n'est pas un avis vague, voici ce qui ne va pas, avec preuves du CSS et des captures :

1. **3 accents qui se battent** — orange (`--primary: #FF9700`), vert
   (bouton "Trouver à proximité", `--color-togo-savane: #2D5A27`), et le
   header en noir pur. Aucune app professionnelle ne fait ça. Une seule
   couleur d'accent, toujours.
2. **`--color-togo-laterite` et `--color-togo-or` ont exactement la même
   valeur** (`#C68B59`) — deux noms pour une seule couleur, signe de
   copier-coller sans réflexion.
3. **Le fichier CSS a AU MOINS 3 blocs `[data-theme='dark']` différents et
   contradictoires** empilés les uns après les autres (un premier bloc
   propre en haut, puis deux autres blocs de "compatibilité" tout en bas
   qui redéfinissent `--background`, `--card`, `--primary` avec des valeurs
   différentes). Le dernier bloc écrase les précédents de façon
   imprévisible selon l'ordre de chargement. C'est un fichier qui n'a
   jamais été nettoyé, juste empilé patch après patch.
4. **Des dizaines de règles `!important` sur des classes Tailwind
   arbitraires hardcodées** (`bg-[#FFFFFF]`, `text-[#1A1A1A]`,
   `border-[#E0DBD3]`...) — ça veut dire que les composants eux-mêmes
   utilisent des couleurs en dur au lieu des tokens `bg-background`,
   `text-foreground`, `border-border`. Le thème sombre n'est pas un vrai
   thème, c'est un rustinage global qui devine quelles classes existent
   dans le DOM et les écrase à la volée. Ça va casser à chaque nouveau
   composant.
5. **Boutons flottants "Boîte à outils" mal positionnés** (orange/vert,
   coupés en bas de viewport sur la capture "À ne pas manquer") — on
   dirait un widget de debug oublié, pas un élément de design intentionnel.
6. **Incohérence de rayons** — badges numérotés (01/02/03/04) en carré à
   angles droits, boutons en pilule complète, cards à coins arrondis
   moyens : trois systèmes de radius différents sur le même écran.
7. **Le thème sombre par défaut alors que la référence (image 1) est un
   design clair, pâle, aéré** — Codex est parti dans la direction opposée
   de ce qui était demandé.

## Règle de discipline pour la suite (à respecter à partir de maintenant)

- **Une seule couleur d'accent.** Jamais deux accents qui se disputent
  l'attention sur un même écran. Si un bouton a besoin de se distinguer,
  on joue sur l'opacité ou le contraste clair/foncé de LA MÊME couleur
  d'accent, pas sur une couleur différente.
- **Un seul token pour une seule couleur.** Ne jamais créer deux noms de
  variable CSS pour la même valeur hex.
- **Jamais de couleur en dur dans un composant.** Toujours `bg-background`,
  `text-foreground`, `bg-primary`, etc. Si une couleur n'existe pas encore
  comme token, on l'ajoute au thème — on ne l'écrit jamais en `bg-[#xxxxxx]`
  dans le JSX.
- **Un seul bloc `:root` et un seul bloc `[data-theme='dark']` dans tout le
  fichier.** Avant d'ajouter quoi que ce soit, chercher s'il existe déjà un
  bloc et l'éditer — ne jamais en empiler un nouveau à la fin du fichier.
- **Un seul système de radius.** `--radius` et ses dérivés
  (`--radius-sm/md/lg/xl/full`) couvrent tous les cas. Pas de rayons codés
  en dur ailleurs.
- **Pas d'éléments flottants non spécifiés.** Si un bouton/badge n'a pas
  été explicitement demandé dans le brief, ne pas l'ajouter "au cas où".

---

# PROMPT — Refonte visuelle exacte (à copier-coller pour Codex)

Refais entièrement le design d'HeriTogo pour qu'il ressemble **exactement**
au style de l'image de référence fournie (mockup 3 écrans de téléphone,
fond clair, cartes blanches à ombre douce, un seul accent doré-orangé,
typographie sobre, beaucoup d'espace blanc). Palette imposée : **blanc pâle
et jaune doré uniquement**. Pas de noir en fond, pas de vert, pas d'orange
vif façon `#FF9700` — un jaune doré plus chaud et plus sobre.

## Palette à appliquer (remplace tout ce qui existe dans `globals.css`)

```css
:root {
  --background:       #FBF9F4;
  --foreground:       #221D17;
  --card:             #FFFFFF;
  --card-foreground:  #221D17;
  --popover:          #FFFFFF;
  --popover-foreground: #221D17;

  --primary:          #D9A441;
  --primary-foreground: #241A08;

  --secondary:        #F4EAD4;
  --secondary-foreground: #6B5324;

  --accent:           #D9A441;
  --accent-foreground: #241A08;

  --muted:            #F4EFE4;
  --muted-foreground: #79726419;

  --border:           #ECE6D8;
  --input:            #ECE6D8;
  --ring:              #D9A441;
  --radius:            1.25rem;

  --destructive:      #DC2626;
  --destructive-foreground: #FFFFFF;

  --chart-1: #D9A441;
  --chart-2: #E5BE72;
  --chart-3: #F0D6A3;
  --chart-4: #79726B;
  --chart-5: #F4EFE4;
}

[data-theme='dark'] {
  --background:       #1C1710;
  --foreground:       #F7F1E4;
  --card:             #262016;
  --card-foreground:  #F7F1E4;
  --popover:          #262016;
  --popover-foreground: #F7F1E4;

  --primary:          #E5BE72;
  --primary-foreground: #241A08;

  --secondary:        #3A2F1C;
  --secondary-foreground: #F7F1E4;

  --accent:           #E5BE72;
  --accent-foreground: #241A08;

  --muted:            #2A2418;
  --muted-foreground: #B9AF9C;

  --border:           #3A331F;
  --input:            #3A331F;
  --ring:              #E5BE72;

  --destructive:      #FCA5A5;
  --destructive-foreground: #7F1D1D;
}
```

Corrige `--muted-foreground` ci-dessus si la valeur affichée comporte une
faute de frappe (`#79726419` a 8 caractères, ce n'est pas un hex valide) —
utilise `#7A7264`.

## Ce qu'il faut littéralement supprimer du fichier actuel

- Les blocs `--color-togo-savane`, `--color-togo-laterite`, `--color-togo-or`
  et tout ce qui contient "Togo Vivant" — plus aucune couleur verte nulle
  part dans le projet.
- **Tous** les blocs `[data-theme='dark']` en double en bas du fichier (il
  y en a au moins deux après le premier, avec des commentaires du style
  "HeriTogo mobile" et "Compatibility layer") — un seul bloc `[data-theme=
  'dark']` doit exister dans tout `globals.css`, celui donné ci-dessus.
- Toutes les règles avec des sélecteurs `bg-\[#...\]`, `text-\[#...\]`,
  `border-\[#...\]` et leurs `!important` associés — une fois que les
  composants utilisent les vrais tokens (`bg-card`, `text-foreground`...),
  ces rustines n'ont plus de raison d'exister.
- L'alias `heritage-weave` marqué "Legacy compatibility" — s'il n'est plus
  utilisé nulle part dans le code, supprime-le. S'il est encore utilisé,
  renomme les usages vers `togo-underline` et supprime l'alias.

## Ce qu'il faut construire, écran par écran, dans l'esprit de la référence

- **Fond de page** : `--background` (blanc cassé chaud), jamais de noir.
- **Cards** : fond `--card` blanc pur, `box-shadow` doux uniquement
  (`0 8px 24px rgba(34,29,23,.08)`), pas de bordure dure visible en plus
  de l'ombre — comme les cards flottantes de la référence.
- **Un seul bouton d'action visible par écran de contenu** — couleur
  `--primary` (le jaune doré), forme pilule (`rounded-full`). Les actions
  secondaires ("Trouver à proximité", filtres) passent en `--secondary`
  (fond crème clair, texte foncé), jamais en couleur concurrente.
- **Photos** : coins arrondis cohérents avec `--radius`, jamais de badge
  numéroté en angle droit à côté d'un bouton en pilule sur le même écran —
  choisis une seule forme de badge (pastille ronde ou étiquette
  arrondie, jamais de carré à angle droit).
- **Supprime les boutons flottants "Boîte à outils"** en bas d'écran tels
  qu'ils apparaissent actuellement (mal cadrés, coupés) — s'ils doivent
  exister, ce sera un composant dédié, positionné et testé, pas un ajout
  flottant improvisé.
- **Header** : fond clair (`--card` ou `--background`), pas de noir plein
  comme actuellement — reprends la légèreté du header de la référence.

## Validation avant de considérer que c'est fini

- Grep le repo pour `bg-[#`, `text-[#`, `border-[#` — zéro résultat en
  dehors de `globals.css` lui-même.
- Grep `globals.css` pour `[data-theme='dark']` — une seule occurrence.
- Aucune couleur verte (`#2D5A27`, `#81A87B`, ou équivalent) nulle part
  dans le projet.
- Compare visuellement chaque écran principal (Home, Lieux, Cuisine,
  Scanner) à l'image de référence : un seul accent, fond clair, cards
  blanches à ombre douce, pas de contraste noir/orange/vert.