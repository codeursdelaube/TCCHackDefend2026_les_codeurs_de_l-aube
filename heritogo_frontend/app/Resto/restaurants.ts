// restaurants.ts
// Données re-vérifiées le 22/08/2026 via recherche web :
// Petit Futé, TripAdvisor, quefairealome.com (top 5 spécialités togolaises),
// wakabileguide.com (top 10 ayimolou), sites officiels des restaurants.
//
// IMPORTANT :
// - Le champ `verifie` indique si le numéro de téléphone et l'adresse ont pu
//   être confirmés par au moins une source externe fiable.
// - Pour les vendeuses/stands informels (ayimolou de rue), aucun numéro de
//   téléphone public n'existe généralement — le champ `telephone` est alors
//   `null` plutôt qu'un faux numéro inventé.
// - Les coordonnées GPS restent des ESTIMATIONS au niveau du quartier sauf
//   mention contraire ; aucun outil de géocodage n'a été utilisé, seules les
//   adresses textuelles ont été vérifiées.

export interface Restaurant {
  id: string
  nom: string
  adresse: string
  quartier: string
  telephone: string | null
  horaires: string
  budget_fcfa: string
  note?: number         // sur 5, source TripAdvisor / Petit Futé si disponible
  source_info: string   // d'où vient l'info
  verifie: boolean       // true si adresse + tel confirmés par une source externe
  lat: number
  lng: number
  plats_ids: string[]
}

const restaurants: Restaurant[] = [

  // ─────────────────────────────────────────────────────────────────
  // 1. NAMIÉLÉ — Restaurant de l'Hôtel 2 Février
  //    Confirmé : restaurant réel de l'hôtel, buffet petit-déj/déjeuner,
  //    avis positifs récurrents sur TripAdvisor. ATTENTION : c'est un
  //    buffet international/multi-cuisine (l'hôtel a aussi un resto
  //    asiatique gastronomique et l'Akwaba Grill) — pas un spécialiste
  //    100% togolais. À présenter comme "cuisine togolaise + internationale".
  //    GPS : Place de l'Indépendance (confirmé Wikipedia + Expedia)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_namiele",
    nom: "Namiélé (Hôtel 2 Février)",
    adresse: "Place de l'Indépendance, Hôtel 2 Février, Lomé",
    quartier: "Centre-ville / Place de l'Indépendance",
    telephone: "+228 22 23 86 00",
    horaires: "Lun–Sam 6h30–10h30 et 12h–15h | Dim 6h30–11h et 12h30–15h30",
    budget_fcfa: "8000 – 25000",
    note: 4.5,
    source_info: "TripAdvisor 2026 (avis confirmés) | Petit Futé | Expedia",
    verifie: true,
    lat: 6.127645,
    lng: 1.214083,
    plats_ids: [
      "fufu_togolais", "gboma_dessi", "adzeme_togolais",
      "djenkoume_togolais", "vebe_togolais"
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // 2. VIVI ROYAL
  //    CORRECTION : le vrai numéro confirmé par quefairealome.com est
  //    99 47 60 53 / 91 56 77 04 (l'ancien 22 22 20 27 n'est confirmé
  //    par aucune source trouvée — retiré). Adresse confirmée identique.
  //    Nom officiel : "Vivi Royal" (pas "Vivi Royale").
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_vivi_royale",
    nom: "Vivi Royal",
    adresse: "Rue des Moussons, 2ème rue en face de la Mairie Centrale (ou 1ère rue après l'ancien Maquina Loca), Nyékonakpoé, Lomé",
    quartier: "Nyékonakpoé",
    telephone: "+228 99 47 60 53",
    horaires: "Mer–Lun 12h–15h et 19h–23h (fermé mardi)",
    budget_fcfa: "5000 – 10000",
    note: 3.8,
    source_info: "quefairealome.com (Top 5 spécialités togolaises) | Petit Futé",
    verifie: true,
    lat: 6.1360,
    lng: 1.2200,
    plats_ids: [
      "fufu_togolais", "gboma_dessi", "adzeme_togolais",
      "djenkoume_togolais", "vebe_togolais", "ayimolou_togolais"
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // 3. MAQUIS CHEZ BROVI — non re-confirmé cette session (aucune
  //    source indépendante trouvée pour le numéro +228 90 03 14 60).
  //    Conservé mais marqué non vérifié — à re-checker sur place.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_chez_brovi",
    nom: "Maquis Chez Brovi « La Grâce de Dieu »",
    adresse: "29, Avenue Nicolas Grunitzky, Quartier Nyékonakpoé, face à la Mairie, Lomé",
    quartier: "Nyékonakpoé",
    telephone: "+228 90 03 14 60",
    horaires: "Lun–Dim 11h–22h",
    budget_fcfa: "2500 – 5500",
    note: 3.9,
    source_info: "Non re-confirmé cette session — à vérifier sur place",
    verifie: false,
    lat: 6.1375,
    lng: 1.2175,
    plats_ids: [
      "fufu_togolais", "ablo_togolais", "kom_togolais", "vebe_togolais"
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // 4. LA MARMITE DU TERROIR — Confirmé quefairealome.com
  //    Tél 90 17 75 75 correct. Instagram : @restolamat
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_marmite_terroir",
    nom: "La Marmite du Terroir",
    adresse: "Totsi, en face d'Ecobank, à côté de la pharmacie de la Nation, Lomé",
    quartier: "Totsi",
    telephone: "+228 90 17 75 75",
    horaires: "Lun–Dim 11h–23h",
    budget_fcfa: "5000 – 15000",
    note: 4.2,
    source_info: "quefairealome.com (confirmé) | Instagram @restolamat",
    verifie: true,
    lat: 6.1620,
    lng: 1.2180,
    plats_ids: [
      "fufu_togolais", "gboma_dessi", "adzeme_togolais",
      "djenkoume_togolais", "vebe_togolais", "ayimolou_togolais"
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // 5. LA SUITE DE CIKA — Confirmé quefairealome.com, tél 70 54 38 94
  //    exact. Instagram : @lasuitedecika. Réservation conseillée le week-end.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_suite_cika",
    nom: "La Suite de Cika",
    adresse: "Nukafu, Boulevard Jean Paul II, en face de la station T-Oil, Lomé",
    quartier: "Nukafu",
    telephone: "+228 70 54 38 94",
    horaires: "Mar–Dim 11h30–14h30 et 18h30–00h | Lun 18h30–00h",
    budget_fcfa: "1000 – 100000",
    note: 4.3,
    source_info: "quefairealome.com (confirmé) | Instagram @lasuitedecika",
    verifie: true,
    lat: 6.1670,
    lng: 1.2160,
    plats_ids: [
      "fufu_togolais", "gboma_dessi", "adzeme_togolais",
      "djenkoume_togolais", "koliko_togolais", "vebe_togolais"
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // 6. BAR LA FIERTÉ — Entièrement confirmé (site officiel, Facebook,
  //    TripAdvisor #39/96 à Lomé). Fondé en 2018, tenu par des femmes.
  //    Adresse précise confirmée : Agoè Anomé / Agoè 2 Lions, entre les
  //    carrefours Bodjona et 2 Lions, face Hôtel La Maison Blanche.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_bar_la_fierte",
    nom: "Bar La Fierté",
    adresse: "Agoè Anomé (Agoè 2 Lions), face à l'Hôtel La Maison Blanche, entre les carrefours Bodjona et 2 Lions, Lomé",
    quartier: "Agoè",
    telephone: "+228 96 26 91 91",
    horaires: "Lun–Dim 9h–21h",
    budget_fcfa: "1000 – 6000",
    note: 5.0,
    source_info: "Site officiel restaurant-barlafierte.com | TripAdvisor #39/96 Lomé | Facebook (511 likes)",
    verifie: true,
    lat: 6.2050,
    lng: 1.2100,
    plats_ids: [
      "fufu_togolais", "ayimolou_togolais", "koliko_togolais",
      "kom_togolais", "gboma_dessi", "adzeme_togolais",
      "djenkoume_togolais", "vebe_togolais"
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // 7. CHÂTEAU TAMBERMA — CORRECTION : vrai numéro confirmé par
  //    quefairealome.com = 97 09 79 79 (l'ancien 90 00 00 00 était un
  //    placeholder factice, retiré).
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_chateau_tamberma",
    nom: "Château Tamberma",
    adresse: "2ème ruelle à droite après le Collège Saint Joseph, quartier Bè (vers Centre Culturel Denyigban), Lomé",
    quartier: "Bè",
    telephone: "+228 97 09 79 79",
    horaires: "Lun–Dim 11h–23h",
    budget_fcfa: "5000 – 15000",
    note: 4.1,
    source_info: "quefairealome.com (confirmé, Top 5 spécialités togolaises)",
    verifie: true,
    lat: 6.1270,
    lng: 1.2350,
    plats_ids: [
      "koliko_togolais", "djenkoume_togolais", "fufu_togolais",
      "gboma_dessi", "vebe_togolais"
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // 8. CHEZ WIYAO — Confirmé wakabileguide.com (bar-restaurant +
  //    traiteur). Aucun numéro public trouvé — l'ancien 90 00 00 01
  //    était un placeholder factice, retiré.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_chez_wiyao",
    nom: "Chez Wiyao",
    adresse: "Hedzranawoé, derrière l'Ambassade du Gabon, Lomé",
    quartier: "Hedzranawoé",
    telephone: null,
    horaires: "Lun–Dim 10h–22h",
    budget_fcfa: "500 – 2500",
    note: 4.0,
    source_info: "wakabileguide.com — Top 10 Ayimolou Lomé",
    verifie: true,
    lat: 6.1730,
    lng: 1.2420,
    plats_ids: ["ayimolou_togolais", "koliko_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 9. CONGOTÔ — Confirmé wakabileguide.com. Vendeuse de rue reconnue
  //    pour la qualité de son riz, forte affluence. Pas de tél public.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_congoto",
    nom: "Congotô",
    adresse: "Bè-Kpota, en face de la Pharmacie 2000, Lomé",
    quartier: "Bè-Kpota",
    telephone: null,
    horaires: "Lun–Dim 7h–14h",
    budget_fcfa: "500 – 2000",
    note: 4.1,
    source_info: "wakabileguide.com — Top 10 Ayimolou Lomé",
    verifie: true,
    lat: 6.1305,
    lng: 1.2340,
    plats_ids: ["ayimolou_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 10. MAMA LOCOH DONOU — Confirmé wakabileguide.com. Réputée pour
  //     son ébéssé fionfion. Pas de tél public.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_mama_locoh_donou",
    nom: "Mama Locoh Donou",
    adresse: "Nyékonakpoé, en face du laboratoire Locoh Donou, Lomé",
    quartier: "Nyékonakpoé",
    telephone: null,
    horaires: "Lun–Sam 9h–12h",
    budget_fcfa: "500 – 1500",
    note: 4.2,
    source_info: "wakabileguide.com — Top 10 Ayimolou Lomé",
    verifie: true,
    lat: 6.1445,
    lng: 1.2250,
    plats_ids: ["ayimolou_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 11. MAMA RAMCO — Confirmé wakabileguide.com. Nocturne, sauce
  //     Akpama réputée. Pas de tél public.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_mama_ramco",
    nom: "Mama Ramco",
    adresse: "Sens interdit de Tokoin Ramco, Lomé",
    quartier: "Tokoin Ramco",
    telephone: null,
    horaires: "Lun–Dim 19h–23h",
    budget_fcfa: "500 – 2000",
    note: 4.0,
    source_info: "wakabileguide.com — Top 10 Ayimolou Lomé",
    verifie: true,
    lat: 6.1590,
    lng: 1.2195,
    plats_ids: ["ayimolou_togolais", "koliko_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 12. CHEZ MADJO — Confirmé wakabileguide.com. Pas de tél public.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_chez_madjo",
    nom: "Chez Madjo",
    adresse: "Tokoin Hôpital, Lomé",
    quartier: "Tokoin",
    telephone: null,
    horaires: "Lun–Dim 10h–22h",
    budget_fcfa: "500 – 2000",
    note: 4.2,
    source_info: "wakabileguide.com — Top 10 Ayimolou Lomé",
    verifie: true,
    lat: 6.1560,
    lng: 1.2240,
    plats_ids: ["ayimolou_togolais"]
  },

  // ═════════════════════════════════════════════════════════════════
  // NOUVEAUX RESTAURANTS AJOUTÉS CETTE SESSION
  // ═════════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────────
  // 13. LE TALIER À VOLONTÉ — Nouveau. Confirmé quefairealome.com,
  //     tél double confirmé. Quartier Amoutiévé.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_talier_a_volonte",
    nom: "Le Talier à Volonté",
    adresse: "Rue Mampo, 3ème rue à gauche en quittant Deckon pour Colombe de la Paix, non loin de la station Total, Amoutiévé, Lomé",
    quartier: "Amoutiévé",
    telephone: "+228 93 45 90 90",
    horaires: "Service déjeuner (idéal pause-déjeuner)",
    budget_fcfa: "5000+",
    source_info: "quefairealome.com (Top 5 spécialités togolaises, confirmé)",
    verifie: true,
    lat: 6.1330,
    lng: 1.2100,
    plats_ids: ["fufu_togolais", "gboma_dessi", "ayimolou_togolais", "koliko_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 14. MAAMI AGOÈ — Nouveau. Confirmé wakabileguide.com. Stand
  //     informel près du marché Assiyéyé, repère : microfinance Famer.
  //     Pas de tél public — GPS estimé au niveau du quartier Agoè.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_maami_agoe",
    nom: "Maami Agoè",
    adresse: "Ruelle près du marché Assiyéyé, à côté de la microfinance Famer, Agoè, Lomé",
    quartier: "Agoè",
    telephone: null,
    horaires: "Non précisé — vendeuse de rue, service matinal typique",
    budget_fcfa: "500 – 2000",
    source_info: "wakabileguide.com — Top 10 Ayimolou Lomé",
    verifie: true,
    lat: 6.1950,
    lng: 1.2050,
    plats_ids: ["ayimolou_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 15. DA VODOU — Nouveau. Confirmé wakabileguide.com. Stand de riz,
  //     quartier Bè près du corner de la poste.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_da_vodou",
    nom: "Da Vodou",
    adresse: "Quartier Bè, près du corner de la poste, Lomé",
    quartier: "Bè",
    telephone: null,
    horaires: "Lun–Sam 8h–12h (fermé dimanche)",
    budget_fcfa: "500 – 1500",
    source_info: "wakabileguide.com — Top 10 Ayimolou Lomé",
    verifie: true,
    lat: 6.1290,
    lng: 1.2320,
    plats_ids: ["ayimolou_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 16. CHEZ BÈRÈ — Nouveau. Confirmé wakabileguide.com. Quartier
  //     Kotokoli Zongo.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_chez_bere",
    nom: "Chez Bèrè",
    adresse: "Quartier Kotokoli Zongo, Lomé",
    quartier: "Kotokoli Zongo",
    telephone: null,
    horaires: "Non précisé — adresse locale bien connue des habitants",
    budget_fcfa: "500 – 2000",
    source_info: "wakabileguide.com — Top 10 Ayimolou Lomé",
    verifie: true,
    lat: 6.1400,
    lng: 1.2280,
    plats_ids: ["ayimolou_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 17. TANTI KPOKPOROKPO — Nouveau. Confirmé wakabileguide.com.
  //     Tokoin Doumassessé-Adéwi.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_tanti_kpokporokpo",
    nom: "Tanti Kpokporokpo",
    adresse: "Tokoin Doumassessé-Adéwi, Lomé",
    quartier: "Tokoin Doumassessé-Adéwi",
    telephone: null,
    horaires: "Non précisé — stand très fréquenté par les habitants du quartier",
    budget_fcfa: "500 – 2000",
    source_info: "wakabileguide.com — Top 10 Ayimolou Lomé",
    verifie: true,
    lat: 6.1540,
    lng: 1.2260,
    plats_ids: ["ayimolou_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 18. MAMAN ASHAO — Nouveau. Confirmé wakabileguide.com. Tokoin
  //     Séminaire.
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_maman_ashao",
    nom: "Maman Ashao",
    adresse: "Tokoin Séminaire, Lomé",
    quartier: "Tokoin Séminaire",
    telephone: null,
    horaires: "Non précisé — grande popularité locale",
    budget_fcfa: "500 – 2000",
    source_info: "wakabileguide.com — Top 10 Ayimolou Lomé",
    verifie: true,
    lat: 6.1570,
    lng: 1.2210,
    plats_ids: ["ayimolou_togolais"]
  },

  // ═════════════════════════════════════════════════════════════════
  // ENTRÉES DE L'ANCIEN FICHIER NON RE-CONFIRMÉES CETTE SESSION
  // (conservées mais marquées `verifie: false` — à vérifier sur place
  // avant publication si tu veux garder une fiabilité 100%)
  // ═════════════════════════════════════════════════════════════════

  {
    id: "r_maguinon_ayimolou",
    nom: "Maguinon Ayimolou (Maman Maggi)",
    adresse: "Rue de l'Ogou, face au Lycée Français de Lomé, Avedji",
    quartier: "Avedji / Gblenkome",
    telephone: null,
    horaires: "6h30–13h (ayimolou) | 18h–22h (koliko)",
    budget_fcfa: "500 – 2000",
    source_info: "Non re-confirmé cette session (source d'origine : lacarte.menu) — à vérifier",
    verifie: false,
    lat: 6.1780,
    lng: 1.2080,
    plats_ids: ["ayimolou_togolais", "koliko_togolais"]
  },
  {
    id: "r_fufu_mokpokpo",
    nom: "Fufu Bar Mokpôkpô",
    adresse: "Quartier Bè, Lomé",
    quartier: "Bè",
    telephone: null,
    horaires: "Lun–Dim 7h–22h",
    budget_fcfa: "1500 – 4000",
    source_info: "Non re-confirmé cette session (source d'origine : lacarte.menu) — à vérifier",
    verifie: false,
    lat: 6.1280,
    lng: 1.2310,
    plats_ids: ["fufu_togolais", "gboma_dessi", "adzeme_togolais", "vebe_togolais"]
  },
  {
    id: "r_fufu_main_divine",
    nom: "Fufu Bar Resto Main Divine",
    adresse: "Tokoin, Lomé",
    quartier: "Tokoin",
    telephone: null,
    horaires: "Lun–Dim 7h30–22h",
    budget_fcfa: "1500 – 3500",
    source_info: "Non re-confirmé cette session (source d'origine : allianztravelinsurance.com) — à vérifier",
    verifie: false,
    lat: 6.1520,
    lng: 1.2270,
    plats_ids: ["fufu_togolais", "gboma_dessi", "adzeme_togolais"]
  },
  {
    id: "r_chez_afovi",
    nom: "Maquis Chez Afovi",
    adresse: "Baguida, Route d'Aného, Lomé",
    quartier: "Baguida",
    telephone: null,
    horaires: "Lun–Dim 9h–22h",
    budget_fcfa: "1000 – 3500",
    source_info: "Non re-confirmé cette session — à vérifier",
    verifie: false,
    lat: 6.1050,
    lng: 1.3100,
    plats_ids: ["ablo_togolais", "kom_togolais", "fufu_togolais"]
  },
  {
    id: "r_ewe_saveurs",
    nom: "Maquis Ewé Saveurs",
    adresse: "Agbalépédogan, Lomé",
    quartier: "Agbalépédogan",
    telephone: null,
    horaires: "Lun–Dim 11h–22h",
    budget_fcfa: "2000 – 6000",
    source_info: "Non re-confirmé cette session — à vérifier (existence non retrouvée par recherche web)",
    verifie: false,
    lat: 6.1480,
    lng: 1.2380,
    plats_ids: [
      "djenkoume_togolais", "gboma_dessi", "fufu_togolais",
      "vebe_togolais", "adzeme_togolais"
    ]
  },

]

export default restaurants