// hotels.ts
// ─────────────────────────────────────────────────────────────────────────────
// Ré-vérification du 22/08/2026 en complément du fichier d'origine.
// Sources ajoutées cette session : Petit Futé (Le Sphinx), togotourisme.tg
// (annuaire officiel hôtels), iokahospitality.com (site officiel IOKA),
// planetofhotels.com / trivago / booking.com / expedia (Résidence Océane).
//
// Nouveau champ `contact_verifie` : true si le téléphone affiché provient
// d'une source vérifiable (site officiel, annuaire officiel, TripAdvisor
// listing avec numéro). Les 3 entrées qui avaient des numéros placeholder
// factices (+228 22 21 00 00, +228 22 22 00 00, +228 22 00 00 00) ont été
// remplacées par de vrais numéros trouvés, ou par `null` si rien de fiable
// n'a été trouvé.
// ─────────────────────────────────────────────────────────────────────────────

export interface Hotel {
  id: string
  nom: string
  adresse: string
  quartier: string
  telephone: string | null
  email?: string
  site_web?: string
  etoiles: number
  nuit_fcfa_min: number
  nuit_fcfa_max: number
  services: string[]
  note_tripadvisor?: number
  note_booking?: number
  source_info: string
  gps_fiable: boolean      // true = source GPS explicite
  contact_verifie: boolean // true = téléphone confirmé par source externe
  lat: number
  lng: number
}

const hotels: Hotel[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. HÔTEL 2 FÉVRIER — inchangé, déjà entièrement vérifié
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "h_2fevrier",
    nom: "Hôtel 2 Février",
    adresse: "Place de l'Indépendance, BP 131, Lomé",
    quartier: "Centre-ville / Place de l'Indépendance",
    telephone: "+228 22 23 86 00",
    email: "reservation@2fevrier.com",
    site_web: "https://2fevrier.com",
    etoiles: 5,
    nuit_fcfa_min: 60000,
    nuit_fcfa_max: 250000,
    services: [
      "Piscine extérieure", "Gym / Steam room", "3 restaurants", "Bar & nightclub",
      "WiFi gratuit", "Parking sécurisé", "Navette aéroport",
      "Centre d'affaires", "Room service 24h"
    ],
    note_tripadvisor: 4.3,
    note_booking: 8.7,
    source_info: "2fevrier.com (officiel) | Wikipedia GPS | Booking.com",
    gps_fiable: true,
    contact_verifie: true,
    lat: 6.127645,
    lng: 1.214083,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. HÔTEL SARAKAWA — inchangé
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "h_sarakawa",
    nom: "Hôtel Sarakawa",
    adresse: "Boulevard du Mono, BP 2232, Lomé",
    quartier: "Bord de mer / Zone portuaire Ouest",
    telephone: "+228 22 27 65 90",
    email: "contact@sarakawa-hotel.com",
    site_web: "https://sarakawa-hotel.com",
    etoiles: 4,
    nuit_fcfa_min: 80000,
    nuit_fcfa_max: 300000,
    services: [
      "Piscine olympique", "3 courts de tennis", "Golf driving range",
      "Centre équestre", "Spa & massage", "2 restaurants gastronomiques",
      "Bar", "WiFi gratuit", "Parking gratuit", "Navette aéroport",
      "Business center", "2 ATM"
    ],
    note_tripadvisor: 4.4,
    note_booking: 7.5,
    source_info: "sarakawa-hotel.com (officiel) | Facebook @HotelSarakawa | Booking.com",
    gps_fiable: false,
    contact_verifie: true,
    lat: 6.1268,
    lng: 1.2195,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. ONOMO HOTEL LOMÉ — inchangé
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "h_onomo",
    nom: "ONOMO Hotel Lomé",
    adresse: "Boulevard du Mono – Bê Souzanétimé, BP 2135, Lomé",
    quartier: "Bê / Bord de mer",
    telephone: "+228 22 53 63 00",
    email: "lome@onomohotels.com",
    site_web: "https://www.onomohotels.com/en/hotel/onomo-hotel-lome/",
    etoiles: 4,
    nuit_fcfa_min: 55000,
    nuit_fcfa_max: 180000,
    services: [
      "Piscine à débordement", "Restaurant O'Kope (cuisine africaine fusion)",
      "Bar lounge", "WiFi gratuit", "Parking gratuit", "Navette aéroport gratuite",
      "Spa", "Fitness", "Reception 24h"
    ],
    note_tripadvisor: 4.2,
    note_booking: 8.1,
    source_info: "onomohotels.com (officiel) | aeroportdelome.com | Booking.com",
    gps_fiable: false,
    contact_verifie: true,
    lat: 6.1261,
    lng: 1.2340,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. HÔTEL SANCTA MARIA — inchangé
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "h_sancta_maria",
    nom: "Hôtel Sancta Maria",
    adresse: "Boulevard du Mono 08, Lomé",
    quartier: "Bê / Bord de mer",
    telephone: "+228 22 27 00 00",
    email: "contact@hotelsanctamaria.com",
    site_web: "https://www.hotelsanctamaria.com",
    etoiles: 4,
    nuit_fcfa_min: 45000,
    nuit_fcfa_max: 160000,
    services: [
      "Piscine extérieure", "Plage privée", "Restaurant Imani (gastronomique)",
      "Bar", "WiFi gratuit", "Parking gratuit", "Navette aéroport gratuite",
      "Salle de séminaire", "Barbecue", "Réception 24h"
    ],
    note_tripadvisor: 4.5,
    note_booking: 9.0,
    source_info: "hotelsanctamaria.com (officiel) | cybevasion.fr GPS explicite | Booking.com",
    gps_fiable: true,
    contact_verifie: true,
    lat: 6.12859,
    lng: 1.23872,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. HÔTEL ROBINSON PLAGE — inchangé
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "h_robinson_plage",
    nom: "Hôtel Robinson Plage",
    adresse: "Zone portuaire, bord de mer, près du Port Autonome de Lomé",
    quartier: "Zone portuaire Ouest / Baguida",
    telephone: "+228 22 41 98 22",
    email: "robinson.plage@gmail.com",
    etoiles: 3,
    nuit_fcfa_min: 18000,
    nuit_fcfa_max: 50000,
    services: [
      "Plage privée", "Restaurant (langoustes, gambas, poissons)",
      "Bar & snack bar", "WiFi gratuit", "Parking gratuit",
      "Aire de jeux enfants", "Accepte animaux"
    ],
    note_tripadvisor: 4.0,
    note_booking: 8.5,
    source_info: "globenin.com tél | TripAdvisor #2 Lomé | ehotelsreviews.com GPS 6.150814/1.299338",
    gps_fiable: true,
    contact_verifie: true,
    lat: 6.150814,
    lng: 1.299338,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. HÔTEL NAPOLÉON LAGUNE — inchangé
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "h_napoleon_lagune",
    nom: "Hôtel Napoléon Lagune",
    adresse: "01 Rue 20, Quartier Bê, BP 30228, Lomé",
    quartier: "Bê / Bords de la lagune",
    telephone: "+228 22 43 18 75",
    email: "contact@napotogo.com",
    site_web: "https://napotogo.com",
    etoiles: 3,
    nuit_fcfa_min: 32900,
    nuit_fcfa_max: 80000,
    services: [
      "Piscine extérieure", "Jacuzzi 8 places", "Restaurant vue lagune",
      "Bar Blue Lagoon", "Bar Napo Beach", "WiFi gratuit",
      "Parking gratuit", "Navette aéroport", "Salle de réunion",
      "Cybercentre", "Groupe électrogène"
    ],
    note_tripadvisor: 3.8,
    note_booking: 7.2,
    source_info: "napotogo.com (officiel) | togo-tourisme.com tél | Petit Futé",
    gps_fiable: false,
    contact_verifie: true,
    lat: 6.1295,
    lng: 1.2410,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. HÔTEL DU GOLFE — inchangé
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "h_du_golfe",
    nom: "Hôtel du Golfe",
    adresse: "10, Avenue Sylvanus Olympio, Lomé",
    quartier: "Centre-ville",
    telephone: "+228 99 13 88 88",
    site_web: "https://hoteldugolfelome.com",
    etoiles: 4,
    nuit_fcfa_min: 50000,
    nuit_fcfa_max: 170000,
    services: [
      "Piscine extérieure", "Terrasse soleil", "Restaurant (africain & européen)",
      "Bar", "Fitness", "WiFi gratuit", "Parking gratuit",
      "Navette aéroport gratuite", "Room service", "Réception 24h", "Concierge"
    ],
    note_tripadvisor: 4.1,
    note_booking: 8.3,
    source_info: "Trivago adresse | HotelsCombined tél | hoteldugolfelome.com | Booking.com",
    gps_fiable: false,
    contact_verifie: true,
    lat: 6.1318,
    lng: 1.2185,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. HÔTEL LE SPHINX
  //    CORRECTION : vrai numéro trouvé — annuaire officiel Togo Tourisme
  //    ET Petit Futé concordent : +228 22 21 59 89 (fax 22 21 59 34).
  //    Email confirmé : sphinxhotel@gmail.com. Ancien site web www.sphinx.tg.
  //    Adresse confirmée : Boulevard Félix Houphouët-Boigny (inchangée).
  //    Attention : plusieurs avis TripAdvisor mentionnent un établissement
  //    "difficile à trouver en ligne" et des retours mitigés sur la gestion —
  //    à vérifier sur place avant de le mettre en avant.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "h_le_sphinx",
    nom: "Hôtel Le Sphinx",
    adresse: "Boulevard Félix Houphouët-Boigny, Lomé",
    quartier: "Centre-ville",
    telephone: "+228 22 21 59 89",
    email: "sphinxhotel@gmail.com",
    site_web: "http://www.sphinx.tg",
    etoiles: 3,
    nuit_fcfa_min: 36000,
    nuit_fcfa_max: 80000,
    services: [
      "Restaurant (5ème étage)", "Rooftop terrasse (observation du ciel)",
      "Cyber snack bar", "Salle de conférence",
      "WiFi", "Parking", "Sécurité & CCTV 24h", "Nightclub"
    ],
    note_tripadvisor: 3.9,
    source_info: "togotourisme.tg (annuaire officiel) | Petit Futé (confirmé) | TripAdvisor (avis + tarifs)",
    gps_fiable: false,
    contact_verifie: true,
    lat: 6.1350,
    lng: 1.2230,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. COCO BEACH HOTEL (Zone portuaire) — inchangé
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "h_coco_beach_port",
    nom: "Hôtel Coco Beach (Zone Portuaire)",
    adresse: "9, Rue Zone Portuaire 12502, Lomé",
    quartier: "Zone portuaire Est / Katanga",
    telephone: "+228 70 28 69 11",
    etoiles: 3,
    nuit_fcfa_min: 35000,
    nuit_fcfa_max: 90000,
    services: [
      "Plage privée", "Piscine extérieure", "Restaurant",
      "Bar", "WiFi gratuit", "Parking gratuit", "Navette aéroport"
    ],
    note_tripadvisor: 3.8,
    note_booking: 7.6,
    source_info: "dontstopliving.net (tél confirmé 2024) | hotelsone.com (adresse) | Booking.com",
    gps_fiable: false,
    contact_verifie: true,
    lat: 6.1298,
    lng: 1.2978,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. COCO BEACH CHEZ ANTOINE (Baguida) — inchangé
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "h_coco_beach_baguida",
    nom: "Coco Beach Chez Antoine (Baguida)",
    adresse: "12 BP 399, Baguida, Lomé",
    quartier: "Baguida (15 min est de Lomé)",
    telephone: "+228 90 32 53 73",
    email: "cocobeach.avepozo@gmail.com",
    site_web: "https://cocobeach-togo.com",
    etoiles: 3,
    nuit_fcfa_min: 25000,
    nuit_fcfa_max: 70000,
    services: [
      "Plage sécurisée (baignade possible)", "Piscine", "Restaurant",
      "Bar", "WiFi", "Parking", "Jardin", "Accepte animaux",
      "Tortues géantes sur site"
    ],
    note_tripadvisor: 4.3,
    note_booking: 8.8,
    source_info: "cocobeach-togo.com (officiel) | zenhotels.com",
    gps_fiable: false,
    contact_verifie: true,
    lat: 6.0930,
    lng: 1.3520,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. RÉSIDENCE HÔTELIÈRE OCÉANE
  //     CORRECTIONS :
  //     - Adresse précise trouvée : 42 rue de la Gare, Quartier Assivito
  //       (PAS Nyékonakpoé comme indiqué à l'origine — proche gare/marché,
  //       à 2,7 km de la plage de Lomé).
  //     - Restaurant réel identifié : "Restaurant les Trois Lys" / "Ambiances"
  //       (cuisine française et africaine), tenu par un patron français.
  //     - Pas de piscine confirmée (source trivago FAQ) — ne pas en promettre.
  //     - Aucun numéro de téléphone public fiable trouvé cette session
  //       (uniquement réservable via OTA type Booking/Expedia) — le
  //       +228 22 22 00 00 d'origine était un placeholder, retiré.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "h_oceane",
    nom: "Résidence Hôtelière Océane",
    adresse: "42, Rue de la Gare, Quartier Assivito, Lomé",
    quartier: "Assivito (près de la gare et du Grand Marché)",
    telephone: null,
    etoiles: 3,
    nuit_fcfa_min: 20000,
    nuit_fcfa_max: 55000,
    services: [
      "Restaurant (Les Trois Lys — cuisine française & africaine)", "Bar",
      "WiFi gratuit", "Parking", "Réception 24h", "Navette aéroport gratuite",
      "Massage sur demande", "Service blanchisserie inclus"
    ],
    note_tripadvisor: 4.0,
    note_booking: 8.0,
    source_info: "planetofhotels.com | Expedia | Trivago (adresse confirmée) | Booking.com (avis) — pas de tél public trouvé",
    gps_fiable: false,
    contact_verifie: false,
    lat: 6.1330,
    lng: 1.2185,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. IOKA HOTEL & SUITES
  //     CORRECTIONS :
  //     - Adresse exacte confirmée : 134 Boulevard du 13 Janvier, BP 12317,
  //       Nyékonakpoè (PAS "Tokoin / résidentiel nord" comme à l'origine).
  //     - Vrai téléphone (site officiel iokahospitality.com) :
  //       +228 22 53 01 53. Email : info@iokahospitality.com.
  //     - Établissement 4★, 11 étages, seul golf simulator d'Afrique
  //       francophone, coworking space, rooftop avec vue mer/lagune,
  //       à 1 km de la Place de l'Indépendance et du Palais des Congrès.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "h_ioka",
    nom: "IOKA Hotel & Suites",
    adresse: "134, Boulevard du 13 Janvier, BP 12317, Nyékonakpoè, Lomé",
    quartier: "Nyékonakpoè (quartier administratif, près Place de l'Indépendance)",
    telephone: "+228 22 53 01 53",
    email: "info@iokahospitality.com",
    site_web: "https://www.iokahospitality.com/ioka-hotel-and-suites-lome",
    etoiles: 4,
    nuit_fcfa_min: 55000,
    nuit_fcfa_max: 200000,
    services: [
      "Rooftop terrasse (vue mer & lagune)", "Golf simulator (unique en Afrique francophone)",
      "Coworking space", "Piscine", "Restaurant", "Sky bar",
      "WiFi gratuit", "Parking gratuit", "Salle de conférence",
      "Business center", "Réception 24h"
    ],
    note_tripadvisor: 4.6,
    note_booking: 9.1,
    source_info: "iokahospitality.com (officiel, tél confirmé) | travelagewest.com | evendo.com",
    gps_fiable: false,
    contact_verifie: true,
    lat: 6.1310,
    lng: 1.2195,
  },

]

export default hotels