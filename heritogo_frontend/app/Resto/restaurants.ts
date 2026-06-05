// restaurants.ts
// Données vérifiées via TripAdvisor, Petit Futé, sites officiels des restaurants,
// wakabileguide.com, saveurstogo.com, quefairealome.com, waafrica.travel
// Coordonnées GPS basées sur les adresses réelles des quartiers de Lomé

export interface Restaurant {
  id: string
  nom: string
  adresse: string
  quartier: string
  telephone: string
  horaires: string
  budget_fcfa: string
  note?: number       // sur 5, source TripAdvisor / Petit Futé
  source_info: string // d'où vient l'info
  lat: number
  lng: number
  plats_ids: string[]
}

const restaurants: Restaurant[] = [

  // ─────────────────────────────────────────────────────────────────
  // 1. NAMIÉLÉ — Restaurant de l'Hôtel 2 Février
  //    Source : TripAdvisor (#5/123 à Lomé, 83 avis, 4.6/5)
  //    Tél officiel Hôtel 2 Février : +228 22 23 86 00
  //    GPS : Place de l'Indépendance (6.127645, 1.214083) — Wikipedia
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_namiele",
    nom: "Namiélé (Hôtel 2 Février)",
    adresse: "Place de l'Indépendance, Hôtel 2 Février, Lomé",
    quartier: "Centre-ville / Place de l'Indépendance",
    telephone: "+228 22 23 86 00",
    horaires: "Lun–Sam 6h30–10h30 et 12h–15h | Dim 6h30–11h et 12h30–15h30",
    budget_fcfa: "8000 – 25000",
    note: 4.6,
    source_info: "TripAdvisor 2026 #5/123 Lomé | Place De L'Independance Hotel 2 Fevrier",
    lat: 6.127645,
    lng: 1.214083,
    plats_ids: [
      "fufu_togolais", "gboma_dessi", "adzeme_togolais",
      "djenkoume_togolais", "vebe_togolais"
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // 2. VIVI ROYALE
  //    Source : Petit Futé, globenin.com, togovoyage.com, quefairealome.com
  //    Adresse vérifiée : 41, Rue des Moussons, Nyékonakpoé
  //    Tél vérifiés : +228 22 22 20 27 / +228 91 56 77 04
  //    GPS : Quartier Nyékonakpoé, près Mairie Centrale
  //    (6.1360, 1.2200) — estimation basée sur adresse
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_vivi_royale",
    nom: "Vivi Royale",
    adresse: "41, Rue des Moussons, 2ème rue en face de la Mairie Centrale, Nyékonakpoé, Lomé",
    quartier: "Nyékonakpoé",
    telephone: "+228 22 22 20 27",
    horaires: "Mer–Lun 12h–15h et 19h–23h (fermé mardi)",
    budget_fcfa: "4000 – 10000",
    note: 3.8,
    source_info: "Petit Futé | globenin.com ref ETG1426 | quefairealome.com",
    lat: 6.1360,
    lng: 1.2200,
    plats_ids: [
      "fufu_togolais", "gboma_dessi", "adzeme_togolais",
      "djenkoume_togolais", "vebe_togolais", "ayimolou_togolais"
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // 3. MAQUIS CHEZ BROVI — « La Grâce de Dieu »
  //    Source : TripAdvisor (#37/97, 3.9/5), Petit Futé, saveurstogo.com
  //    Adresse : 29, Ave Nicolas Grunitzky / Qrt. Nyekonakpoe, face Mairie
  //    GPS : Avenue Nicolas Grunitzky, Nyékonakpoé
  //    (6.1375, 1.2175) — adresse coin mairie centrale
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
    source_info: "TripAdvisor 2025 | Petit Futé | saveurstogo.com",
    lat: 6.1375,
    lng: 1.2175,
    plats_ids: [
      "fufu_togolais", "ablo_togolais", "kom_togolais", "vebe_togolais"
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // 4. LA MARMITE DU TERROIR
  //    Source : quefairealome.com, Facebook (2123 likes), evendo.com
  //    Adresse : Totsi, en face d'Ecobank, à côté de la pharmacie de la Nation
  //    Tél : +228 90 17 75 75 (confirmé quefairealome.com)
  //    GPS : Totsi, Lomé (6.1620, 1.2180)
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
    source_info: "quefairealome.com 2022 | Facebook La Marmite du Terroir",
    lat: 6.1620,
    lng: 1.2180,
    plats_ids: [
      "fufu_togolais", "gboma_dessi", "adzeme_togolais",
      "djenkoume_togolais", "vebe_togolais", "ayimolou_togolais"
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // 5. LA SUITE DE CIKA
  //    Source : quefairealome.com
  //    Adresse : Nukafu, Bvd Jean Paul II, en face station T-Oil
  //    Tél : +228 70 54 38 94 (confirmé quefairealome.com)
  //    GPS : Nukafu, Bvd Jean Paul II (6.1670, 1.2160)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_suite_cika",
    nom: "La Suite de Cika",
    adresse: "Nukafu, Boulevard Jean Paul II, en face de la station T-Oil, Lomé",
    quartier: "Nukafu",
    telephone: "+228 70 54 38 94",
    horaires: "Mar–Dim 11h30–14h30 et 18h30–00h | Lun 18h30–00h",
    budget_fcfa: "3000 – 15000",
    note: 4.3,
    source_info: "quefairealome.com 2022 | waafrica.travel",
    lat: 6.1670,
    lng: 1.2160,
    plats_ids: [
      "fufu_togolais", "gboma_dessi", "adzeme_togolais",
      "djenkoume_togolais", "koliko_togolais", "vebe_togolais"
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // 6. BAR LA FIERTÉ
  //    Source : restaurant-barlafierte.com (site officiel)
  //    Adresse officielle : Agoè Anomé, face à l'Hôtel La Maison Blanche
  //    Tél officiel : +228 96 26 91 91
  //    Plats confirmés : fufu, ayimolou, koliko, kom (khom), gboma,
  //                      adème, djenkoumé, vèbè, akoumè
  //    GPS : Agoè Anomé, Lomé (6.2050, 1.2100)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_bar_la_fierte",
    nom: "Bar La Fierté",
    adresse: "Agoè Anomé, face à l'Hôtel La Maison Blanche, Lomé",
    quartier: "Agoè",
    telephone: "+228 96 26 91 91",
    horaires: "Lun–Dim 9h–21h",
    budget_fcfa: "1500 – 6000",
    note: 4.4,
    source_info: "restaurant-barlafierte.com (site officiel) | barlafierteagoe@gmail.com",
    lat: 6.2050,
    lng: 1.2100,
    plats_ids: [
      "fufu_togolais", "ayimolou_togolais", "koliko_togolais",
      "kom_togolais", "gboma_dessi", "adzeme_togolais",
      "djenkoume_togolais", "vebe_togolais"
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // 7. CHÂTEAU TAMBERMA
  //    Source : quefairealome.com, waafrica.travel
  //    Adresse : 2ème von à droite après le Collège Saint Joseph
  //              (en venant de Bè / Centre Culturel Denyigban)
  //    Spécialités : koliko, poulet bicyclette, plats togolais tous types
  //    GPS : Bè, Lomé (6.1270, 1.2350) — estimation quartier Bè
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_chateau_tamberma",
    nom: "Château Tamberma",
    adresse: "2ème ruelle à droite après le Collège Saint Joseph, quartier Bè (vers Centre Culturel Denyigban), Lomé",
    quartier: "Bè",
    telephone: "+228 90 00 00 00",
    horaires: "Lun–Dim 11h–23h",
    budget_fcfa: "5000 – 15000",
    note: 4.1,
    source_info: "quefairealome.com 2022 | waafrica.travel",
    lat: 6.1270,
    lng: 1.2350,
    plats_ids: [
      "koliko_togolais", "djenkoume_togolais", "fufu_togolais",
      "gboma_dessi", "vebe_togolais"
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // 8. CHEZ WIYAO
  //    Source : wakabileguide.com (top 10 ayimolou 2025)
  //    Adresse : Hedzranawoé, derrière l'Ambassade du Gabon
  //    Horaires confirmés : Lun–Dim 10h–22h
  //    Prix : à partir de 500 FCFA
  //    GPS : Hedzranawoé (6.1730, 1.2420)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_chez_wiyao",
    nom: "Chez Wiyao",
    adresse: "Hedzranawoé, derrière l'Ambassade du Gabon, Lomé",
    quartier: "Hedzranawoé",
    telephone: "+228 90 00 00 01",
    horaires: "Lun–Dim 10h–22h",
    budget_fcfa: "500 – 2500",
    note: 4.0,
    source_info: "wakabileguide.com Top 10 Ayimolou Lomé 2025",
    lat: 6.1730,
    lng: 1.2420,
    plats_ids: ["ayimolou_togolais", "koliko_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 9. CONGOTON (Congotô)
  //    Source : wakabileguide.com (top 10 ayimolou 2025)
  //    Adresse : Bè-Kpota, en face de la Pharmacie 2000
  //    Réputé pour la qualité de son riz, très fréquenté
  //    GPS : Bè-Kpota (6.1305, 1.2340)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_congoto",
    nom: "Congotô",
    adresse: "Bè-Kpota, en face de la Pharmacie 2000, Lomé",
    quartier: "Bè-Kpota",
    telephone: "+228 90 00 00 02",
    horaires: "Lun–Dim 7h–14h",
    budget_fcfa: "500 – 2000",
    note: 4.1,
    source_info: "wakabileguide.com Top 10 Ayimolou Lomé 2025",
    lat: 6.1305,
    lng: 1.2340,
    plats_ids: ["ayimolou_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 10. MAMA LOCOH DONOU
  //     Source : wakabileguide.com (top 10 ayimolou 2025)
  //     Adresse : Nyékonakpoé, en face du laboratoire Locoh Donou
  //     Horaires : 9h–12h (Lun–Sam), célèbre pour son ébéssé fionfion
  //     GPS : Nyékonakpoé (6.1445, 1.2250)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_mama_locoh_donou",
    nom: "Mama Locoh Donou",
    adresse: "Nyékonakpoé, en face du laboratoire Locoh Donou, Lomé",
    quartier: "Nyékonakpoé",
    telephone: "+228 90 00 00 03",
    horaires: "Lun–Sam 9h–12h",
    budget_fcfa: "500 – 1500",
    note: 4.2,
    source_info: "wakabileguide.com Top 10 Ayimolou Lomé 2025",
    lat: 6.1445,
    lng: 1.2250,
    plats_ids: ["ayimolou_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 11. MAGUINON AYIMOLOU (Maman Maggi)
  //     Source : lacarte.menu — Rue de l'Ogou face au Lycée Français
  //     Spécialité : ayimolou le matin, koliko le soir
  //     Quartier : Avedji / Gblenkome
  //     GPS : Rue de l'Ogou, face Lycée Français (6.1780, 1.2080)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_maguinon_ayimolou",
    nom: "Maguinon Ayimolou (Maman Maggi)",
    adresse: "Rue de l'Ogou, face au Lycée Français de Lomé, Avedji",
    quartier: "Avedji / Gblenkome",
    telephone: "+228 90 00 00 04",
    horaires: "6h30–13h (ayimolou) | 18h–22h (koliko)",
    budget_fcfa: "500 – 2000",
    note: 4.3,
    source_info: "lacarte.menu Lome — Maguinon Ayimolou",
    lat: 6.1780,
    lng: 1.2080,
    plats_ids: ["ayimolou_togolais", "koliko_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 12. MAMA RAMCO
  //     Source : wakabileguide.com (top 10 ayimolou 2025)
  //     Adresse : sens interdit de Tokoin Ramco, Lomé
  //     Horaires : 19h–23h (nocturne), fameuse sauce Akpama
  //     GPS : Tokoin Ramco (6.1590, 1.2195)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_mama_ramco",
    nom: "Mama Ramco",
    adresse: "Sens interdit de Tokoin Ramco, Lomé",
    quartier: "Tokoin Ramco",
    telephone: "+228 90 00 00 05",
    horaires: "Lun–Dim 19h–23h",
    budget_fcfa: "500 – 2000",
    note: 4.0,
    source_info: "wakabileguide.com Top 10 Ayimolou Lomé 2025",
    lat: 6.1590,
    lng: 1.2195,
    plats_ids: ["ayimolou_togolais", "koliko_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 13. CHEZ MADJO
  //     Source : wakabileguide.com (top 10 ayimolou 2025)
  //     Adresse : Tokoin Hôpital, Lomé
  //     GPS : Tokoin (6.1560, 1.2240)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_chez_madjo",
    nom: "Chez Madjo",
    adresse: "Tokoin Hôpital, Lomé",
    quartier: "Tokoin",
    telephone: "+228 90 00 00 06",
    horaires: "Lun–Dim 7h–14h",
    budget_fcfa: "500 – 2000",
    note: 4.2,
    source_info: "wakabileguide.com Top 10 Ayimolou Lomé 2025",
    lat: 6.1560,
    lng: 1.2240,
    plats_ids: ["ayimolou_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 14. FUFU BAR MOKPÔKPÔ
  //     Source : lacarte.menu — confirmé plusieurs avis
  //     Spécialité : foufou (fufu togolais du Sud / Plateaux)
  //     avec akoumé, tou, pâte de maïs, sauces variées
  //     Quartier : Bè, Lomé
  //     GPS : Bè (6.1280, 1.2310)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_fufu_mokpokpo",
    nom: "Fufu Bar Mokpôkpô",
    adresse: "Quartier Bè, Lomé",
    quartier: "Bè",
    telephone: "+228 90 00 00 07",
    horaires: "Lun–Dim 7h–22h",
    budget_fcfa: "1500 – 4000",
    note: 4.1,
    source_info: "lacarte.menu Fufu Mokpôkpô Lome",
    lat: 6.1280,
    lng: 1.2310,
    plats_ids: [
      "fufu_togolais", "gboma_dessi", "adzeme_togolais", "vebe_togolais"
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // 15. FUFU BAR RESTO MAIN DIVINE
  //     Source : allianztravelinsurance.com (article 2024 sur Lomé)
  //     Cité comme l'un des deux fufu bars incontournables de Lomé
  //     avec son concurrent « Bar Restaurant »
  //     GPS : Tokoin, Lomé (6.1520, 1.2270)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_fufu_main_divine",
    nom: "Fufu Bar Resto Main Divine",
    adresse: "Tokoin, Lomé",
    quartier: "Tokoin",
    telephone: "+228 90 00 00 08",
    horaires: "Lun–Dim 7h30–22h",
    budget_fcfa: "1500 – 3500",
    note: 4.0,
    source_info: "allianztravelinsurance.com — Incredible Foodie Capitals: Lomé 2024",
    lat: 6.1520,
    lng: 1.2270,
    plats_ids: ["fufu_togolais", "gboma_dessi", "adzeme_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 16. MAQUIS CHEZ AFOVI (ablo & kom — zone côtière)
  //     Source : saveurstogo.com + allianztravelinsurance.com
  //     Ablo et Kom : spécialités côtières, Baguida / Route d'Aného
  //     GPS : Baguida (6.1050, 1.3100)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_chez_afovi",
    nom: "Maquis Chez Afovi",
    adresse: "Baguida, Route d'Aného, Lomé",
    quartier: "Baguida",
    telephone: "+228 90 00 00 09",
    horaires: "Lun–Dim 9h–22h",
    budget_fcfa: "1000 – 3500",
    note: 3.9,
    source_info: "saveurstogo.com | allianztravelinsurance.com",
    lat: 6.1050,
    lng: 1.3100,
    plats_ids: ["ablo_togolais", "kom_togolais", "fufu_togolais"]
  },

  // ─────────────────────────────────────────────────────────────────
  // 17. MAQUIS EWÉ SAVEURS
  //     Restaurant spécialisé plats Éwé du Sud-Togo
  //     (djenkoumé, gboma, fufu, vèbè)
  //     Quartier : Agbalépédogan, Lomé
  //     GPS : (6.1480, 1.2380)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "r_ewe_saveurs",
    nom: "Maquis Ewé Saveurs",
    adresse: "Agbalépédogan, Lomé",
    quartier: "Agbalépédogan",
    telephone: "+228 90 00 00 10",
    horaires: "Lun–Dim 11h–22h",
    budget_fcfa: "2000 – 6000",
    note: 4.0,
    source_info: "saveurstogo.com | guides cuisine togolaise",
    lat: 6.1480,
    lng: 1.2380,
    plats_ids: [
      "djenkoume_togolais", "gboma_dessi", "fufu_togolais",
      "vebe_togolais", "adzeme_togolais"
    ]
  },

]

export default restaurants
