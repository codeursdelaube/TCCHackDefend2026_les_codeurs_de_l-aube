# HeriTogo → TripAdvisor Togolais : Plan de Refonte Complète

## Objectif
Transformer HeriTogo en un **équivalent TripAdvisor pour le Togo** : UX moderne et intuitive, orientée découverte + avis + réservation, avec une identité visuelle **africaine et chaleureuse** différente de la palette café actuelle (trop sombre, trop close).

---

## Analyse des References (Screenshots TripAdvisor)

| Élément TripAdvisor | Adaptation HeriTogo |
|---|---|
| Vert vif `#34E0A1` como couleur primaire | **Vert Savane togolaise** `#1B7E4B` + **Terre de latérite** `#C85C2D` |
| Cards photo avec note ⭐ | Cards monuments / plats / guides avec notes |
| Barre de navigation tabs (Photos, Avis, Activités) | Tabs (Sites, Guides, Cuisine, Histoire) |
| Hero search "Où voulez-vous aller ?" | Hero search "Que découvrir au Togo ?" |
| Avis utilisateurs | Système reviews Supabase existant |
| Hébergements | Hôtels proches (déjà dans le code) |
| Itinéraire | GPS (déjà implémenté) |

---

## Nouvelle Palette — « Togo Vivant »

> [!IMPORTANT]
> Remplacement de la palette Café (trop sombre/luxe) par une palette **African Travel** vive, accessible et moderne — comme TripAdvisor mais avec l'âme du Togo.

| Nom | Hex | Usage |
|---|---|---|
| **Savane Verte** | `#1B7E4B` | Primary — boutons CTA, accents |
| **Latérite** | `#C85C2D` | Secondary — badges urgents, CTA secondaires |
| **Or Kpalimé** | `#E8A923` | Accent — étoiles, badges premium |
| **Blanc Propre** | `#FFFFFF` | Fond de page |
| **Gris Clair** | `#F5F5F0` | Fond cartes, sections |
| **Gris Texte** | `#3D3D3D` | Texte principal |
| **Gris Discret** | `#767676` | Texte secondaire |

---

## Open Questions

> [!NOTE]
> Aucune question bloquante — on procède à la refonte complète.

---

## Fichiers à Modifier

### Design System
#### [MODIFY] [globals.css](file:///c:/Users/HP/Desktop/TCCHackDefend2026_les_codeurs_de_l-aube/heritogo_frontend/app/globals.css)
- Remplacement palette Café & Blanc → palette Togo Vivant
- Ajout Google Fonts : `Inter` (corps) + `Playfair Display` (titres de sections)
- Composants utilitaires : `.trip-card`, `.rating-badge`, `.search-bar`

---

### Composants Globaux
#### [MODIFY] [Navbar.tsx](file:///c:/Users/HP/Desktop/TCCHackDefend2026_les_codeurs_de_l-aube/heritogo_frontend/components/Navbar.tsx)
- Reprise du style TripAdvisor : logo + barre de recherche centrale + actions utilisateur à droite
- Onglets de navigation principaux sous la navbar (Sites, Cuisine, Guides, Histoire)

#### [MODIFY] [SplashScreen.tsx](file:///c:/Users/HP/Desktop/TCCHackDefend2026_les_codeurs_de_l-aube/heritogo_frontend/components/SplashScreen.tsx)
- Mise à jour avec nouvelle palette verte Savane

---

### Pages Principales
#### [MODIFY] [page.tsx (Accueil)](file:///c:/Users/HP/Desktop/TCCHackDefend2026_les_codeurs_de_l-aube/heritogo_frontend/app/[locale]/page.tsx)
- **Hero** : Grande barre de recherche centrale style TripAdvisor + photo immersive Togo
- **Catégories** : Icônes horizontales scrollables (Sites, Cuisine, Nature, Guides…)
- **Incontournables** : Cards photo avec notation ⭐ et bouton "Voir"
- **Section Avis récents** : Style TripAdvisor — avatar + note + texte extrait
- **Section "Où dormir"** : Hôtels proches avec prix FCFA
- **Carte interactive** : Toujours présente mais compacte

#### [MODIFY] [lieux/page.tsx](file:///c:/Users/HP/Desktop/TCCHackDefend2026_les_codeurs_de_l-aube/heritogo_frontend/app/[locale]/lieux/page.tsx)
- Layout TripAdvisor "Liste résultats" : filtres gauche + grille droite
- Cards avec photo, note, catégorie, localité, bouton d'action

#### [MODIFY] [lieux/[id]/page.tsx](file:///c:/Users/HP/Desktop/TCCHackDefend2026_les_codeurs_de_l-aube/heritogo_frontend/app/[locale]/lieux/[id]/page.tsx)
- Tabs : Aperçu / Avis / Carte / Similaires
- Section avis avec étoiles interactives
- Bouton GPS grand format

#### [MODIFY] [cuisine/page.tsx](file:///c:/Users/HP/Desktop/TCCHackDefend2026_les_codeurs_de_l-aube/heritogo_frontend/app/[locale]/cuisine/page.tsx)
- Même structure que lieux — adaptée gastronomie

#### [MODIFY] [error.tsx](file:///c:/Users/HP/Desktop/TCCHackDefend2026_les_codeurs_de_l-aube/heritogo_frontend/app/[locale]/error.tsx)
- Mise à jour avec nouvelle palette

#### [MODIFY] [loading.tsx](file:///c:/Users/HP/Desktop/TCCHackDefend2026_les_codeurs_de_l-aube/heritogo_frontend/app/[locale]/loading.tsx)
- Mise à jour skeletons avec nouvelle palette

---

## Vérification
- `npm run build` sans erreurs
- Cohérence visuelle sur toutes les pages
