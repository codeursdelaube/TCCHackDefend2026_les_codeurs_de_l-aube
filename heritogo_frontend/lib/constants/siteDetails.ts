export interface SiteActivity {
  title: string;
  desc: string;
  icon: 'camera' | 'footsteps' | 'eye' | 'compass' | 'shopping' | 'sparkles' | 'history' | 'sun';
}

export interface PracticalInfo {
  bestTime: string;
  duration: string;
  outfit: string;
  access: string;
  fee: string;
}

export interface TravelerReview {
  author: string;
  origin: string;
  date: string;
  rating: number;
  comment: string;
}

export interface SiteExtraDetails {
  tags: string[];
  activities: SiteActivity[];
  practicalInfo: PracticalInfo;
  dishesIds: string[];
  reviews: TravelerReview[];
}

export const SITE_DETAILS: Record<string, SiteExtraDetails> = {
  chateau_vial: {
    tags: ['Architecture', 'Vue Panoramique', 'Randonnée', 'Photo Spot', 'Nature'],
    activities: [
      {
        title: 'Explorer le manoir médiéval',
        desc: 'Visitez les terrasses fortifiées et les tourelles en pierre de taille surplombant la forêt tropicale.',
        icon: 'history'
      },
      {
        title: 'Belvédère & Vue sur le Ghana',
        desc: 'Profitez du panorama à 360° sur les crêtes verdoyantes du mont Kloto et les vallées frontalières.',
        icon: 'eye'
      },
      {
        title: 'Randonnée dans la forêt du Kloto',
        desc: 'Parcourez les sentiers ombragés bordés de cacaoyers, caféiers et papillons multicolores.',
        icon: 'footsteps'
      },
      {
        title: 'Séance photo au coucher du soleil',
        desc: 'La lumière dorée de fin d’après-midi sur les vieilles pierres offre un cadre photographique sublime.',
        icon: 'camera'
      }
    ],
    practicalInfo: {
      bestTime: 'Matinée fraîche (8h - 11h) ou fin d’après-midi (16h - 18h)',
      duration: '1h30 à 2h30',
      outfit: 'Chaussures de marche fermées, chapeau et répulsif anti-moustiques',
      access: 'Accessible en voiture 4x4 ou taxi-moto (Zem) depuis Kpalimé (~12 km)',
      fee: 'Visite extérieure gratuite, guide local bénévole conseillé (1 000 - 2 000 FCFA)'
    },
    dishesIds: ['fufu_togolais', 'agbeli_togolais', 'vebe_togolais'],
    reviews: [
      {
        author: 'Koffi A.',
        origin: 'Lomé',
        date: 'Il y a 2 semaines',
        rating: 5,
        comment: 'Une vue à couper le souffle sur les montagnes du Kloto ! L’ambiance brumeuse du matin donne au château des airs de conte de fées.'
      },
      {
        author: 'Sophie D.',
        origin: 'France',
        date: 'Il y a 1 mois',
        rating: 4.8,
        comment: 'Magnifique escale lors de notre randonnée à Kpalimé. La route monte un peu mais la récompense au sommet en vaut largement la peine.'
      }
    ]
  },

  grand_marche_lome: {
    tags: ['Commerce', 'Culture Éwé', 'Textiles', 'Street Food', 'Incontournable'],
    activities: [
      {
        title: 'Découverte des tissus Wax & Nana Benz',
        desc: 'Parcourez les allées de tissus imprimés légendaires guidé par l’histoire des célèbres commerçantes togolaises.',
        icon: 'shopping'
      },
      {
        title: 'Dégustation Street Food locale',
        desc: 'Goûtez à l’Ayimolou chaud au piment noir ou aux beignets de maïs vendus à chaque coin de rue.',
        icon: 'sparkles'
      },
      {
        title: 'Achat d’épices & artisanat authentique',
        desc: 'Retrouvez les piments séchés, gingembre sauvage, beurre de karité pur et perles traditionnelles.',
        icon: 'compass'
      },
      {
        title: 'Immersion dans l’ambiance loméenne',
        desc: 'Ressentez l’énergie débordante des marchandes et l’effervescence rythmée du cœur de la capitale.',
        icon: 'eye'
      }
    ],
    practicalInfo: {
      bestTime: 'Matin de 7h30 à 11h pour éviter la chaleur et la forte affluence',
      duration: '2h à 3h',
      outfit: 'Tenue légère et décontractée, sac bandoulière fermé et monnaie en petites coupures',
      access: 'En plein centre-ville de Lomé, accessible en taxi, Zem ou à pied',
      fee: 'Accès libre, prévoir du liquide pour les achats'
    },
    dishesIds: ['ayimolou_togolais', 'ablo_togolais', 'koliko_togolais'],
    reviews: [
      {
        author: 'Amina M.',
        origin: 'Cotonou',
        date: 'Il y a 3 semaines',
        rating: 4.9,
        comment: 'Le poumon vibrant de Lomé ! Les motifs de pagnes sont infinis et l’accueil des mamans marchandes est chaleureux.'
      },
      {
        author: 'Marc B.',
        origin: 'Suisse',
        date: 'Il y a 2 mois',
        rating: 4.7,
        comment: 'Une expérience sensorielle incroyable. Les couleurs, les épices, le son des négociations... Incontournable !'
      }
    ]
  },

  koutamakou: {
    tags: ['UNESCO', 'Architecture Écologique', 'Patrimoine Vivant', 'Spiritualité'],
    activities: [
      {
        title: 'Visiter une Tata Somba fortifiée',
        desc: 'Pénétrez à l’intérieur d’un château-fort de terre à deux étages et comprenez la cosmogonie Batammariba.',
        icon: 'history'
      },
      {
        title: 'Rencontre avec les gardiens de traditions',
        desc: 'Échangez avec les aînés du village sur les rites d’initiation (Difwani et Dikuntri) et la protection sacrée.',
        icon: 'compass'
      },
      {
        title: 'Randonnée dans les collines de l’Atakora',
        desc: 'Explorez le paysage culturel harmonieux où chaque maison s’intègre parfaitement à la nature environnante.',
        icon: 'footsteps'
      },
      {
        title: 'Dégustation du Tchoukoutou traditionnel',
        desc: 'Partagez une calebasse de bière de sorgho fraîche préparée selon la méthode ancestrale.',
        icon: 'sparkles'
      }
    ],
    practicalInfo: {
      bestTime: 'De novembre à mars (saison sèche) pour une circulation idéale sur les pistes',
      duration: 'Une demi-journée à 1 journée complète',
      outfit: 'Chaussures de randonnée, chapeau de soleil, crème solaire et respect des règles coutumières',
      access: 'Depuis Kara via Kandé puis piste jusqu’à Nadoba (~1h30 de route)',
      fee: 'Ticket d’entrée UNESCO + honoraires du guide officiel communautaire'
    },
    dishesIds: ['to_sorgho_togolais', 'tchoukoutou_togolais', 'djenkoume_togolais'],
    reviews: [
      {
        author: 'Elena R.',
        origin: 'Italie',
        date: 'Il y a 1 mois',
        rating: 5,
        comment: 'L’un des plus beaux trésors architecturaux d’Afrique. Les Takienta en terre sont des chefs-d’œuvre d’ingénierie durable.'
      },
      {
        author: 'Tidiane S.',
        origin: 'Sénégal',
        date: 'Il y a 3 mois',
        rating: 5,
        comment: 'Une immersion culturelle inoubliable. Le respect de la nature et la sagesse des Batammariba forcent l’admiration.'
      }
    ]
  },

  marche_fetiches_akodessewa: {
    tags: ['Vaudou', 'Médecine Traditionnelle', 'Mysticisme', 'Culture'],
    activities: [
      {
        title: 'Consultation avec un guérisseur traditionnel',
        desc: 'Découvrez les rituels de protection et les bienfaits des plantes médicinales africaines.',
        icon: 'sparkles'
      },
      {
        title: 'Comprendre les symboles sacrés du Vaudou',
        desc: 'Écoutez les explications d’un prêtre traditionnel sur les divinités protectrices et les talismans.',
        icon: 'history'
      },
      {
        title: 'Photographie guidée des artefacts',
        desc: 'Immortalisez les autels et objets rituels dans le respect des consignes du sanctuaire.',
        icon: 'camera'
      }
    ],
    practicalInfo: {
      bestTime: 'Tous les jours entre 9h et 16h',
      duration: '1h à 1h30',
      outfit: 'Tenue respectueuse, chaussures confortables',
      access: 'Quartier Akodésséwa à Lomé, facile d’accès en taxi ou Zem',
      fee: 'Entrée touristique + droit photo (environ 5 000 FCFA avec guide)'
    },
    dishesIds: ['gboma_dessi', 'ayimolou_togolais', 'kom_togolais'],
    reviews: [
      {
        author: 'Guillaume L.',
        origin: 'Belgique',
        date: 'Il y a 2 semaines',
        rating: 4.8,
        comment: 'Visite fascinante et très instructive sur la philosophie et la médecine traditionnelle. Très loin des clichés !'
      }
    ]
  },

  cascade_kpime: {
    tags: ['Cascade', 'Baignade', 'Écotourisme', 'Nature', 'Fraîcheur'],
    activities: [
      {
        title: 'Baignade dans le bassin naturel',
        desc: 'Profitez des eaux douces et vivifiantes au pied des chutes d’eau rocheuses.',
        icon: 'sun'
      },
      {
        title: 'Pique-nique ombragé au bord de l’eau',
        desc: 'Installez-vous sous les grands arbres tropicaux pour une pause gourmande en pleine nature.',
        icon: 'sparkles'
      },
      {
        title: 'Observation de la flore et des papillons',
        desc: 'Admirez les fougères géantes et les espèces d’insectes rares de la région des Plateaux.',
        icon: 'eye'
      }
    ],
    practicalInfo: {
      bestTime: 'Après la saison des pluies (juin à décembre) pour un débit d’eau impressionnant',
      duration: '2h à 3h',
      outfit: 'Maillot de bain, serviette, chaussures aquatiques ou sandales de marche',
      access: 'À 10 km de Kpalimé sur la route d’Atakpamé, accès facile',
      fee: 'Droit d’entrée modique géré par le comité villageois (500 - 1 000 FCFA)'
    },
    dishesIds: ['fufu_togolais', 'adzeme_togolais', 'agbeli_togolais'],
    reviews: [
      {
        author: 'Céline V.',
        origin: 'Togo',
        date: 'Il y a 1 semaine',
        rating: 4.9,
        comment: 'La fraîcheur absolue à quelques minutes de Kpalimé. Parfait pour une sortie en famille ou entre amis.'
      }
    ]
  },

  parc_fazao_malfakassa: {
    tags: ['Safari', 'Faune Sauvage', 'Montagnes', 'Randonnée', 'Grande Nature'],
    activities: [
      {
        title: 'Safari d’observation de la faune',
        desc: 'Partez à la rencontre des buffles, antilopes, singes et éléphants dans leur habitat naturel.',
        icon: 'compass'
      },
      {
        title: 'Trekking sur les crêtes de l’Atakora',
        desc: 'Grimpez sur les plateaux rocheux pour des panoramas spectaculaires sur la savane arborée.',
        icon: 'footsteps'
      },
      {
        title: 'Bivouac & Nuit sous les étoiles',
        desc: 'Écoutez les bruits nocturnes de la savane africaine lors d’une expérience immersive.',
        icon: 'sun'
      }
    ],
    practicalInfo: {
      bestTime: 'De décembre à avril pour une visibilité optimale des animaux près des points d’eau',
      duration: '1 à 2 jours avec nuitée',
      outfit: 'Vêtements de safari discrets (kaki/beige), jumelles, lampe torche et gourde',
      access: 'Accès depuis Sokodé ou Bassar en véhicule 4x4 obligatoire',
      fee: 'Permis d’entrée au parc + accompagnement obligatoire par un écogarde'
    },
    dishesIds: ['to_sorgho_togolais', 'wagasi_togolais', 'vebe_togolais'],
    reviews: [
      {
        author: 'Ousmane D.',
        origin: 'Mali',
        date: 'Il y a 1 mois',
        rating: 4.9,
        comment: 'Une nature sauvage brute et préservée. Les paysages vallonnés sont grandioses et les écogardes sont passionnés.'
      }
    ]
  },

  faille_aledjo: {
    tags: ['Géologie', 'Route Panoramique', 'Montagnes', 'Sensations'],
    activities: [
      {
        title: 'Traversée de la gorge taillée dans la roche',
        desc: 'Ressentez la verticalité impressionnante des parois rocheuses qui encadrent la route nationale.',
        icon: 'eye'
      },
      {
        title: 'Halte panoramique sur les monts Défalé',
        desc: 'Contemplez la chaîne montagneuse et les vallées verdoyantes de la Kara.',
        icon: 'camera'
      }
    ],
    practicalInfo: {
      bestTime: 'En journée avec bonne luminosité',
      duration: '45 min à 1h d’arrêt photo',
      outfit: 'Tenue de voyage',
      access: 'Sur la route nationale 1 entre Sokodé et Kara',
      fee: 'Gratuit (route nationale)'
    },
    dishesIds: ['djenkoume_togolais', 'tchoukoutou_togolais', 'wagasi_togolais'],
    reviews: [
      {
        author: 'Pascal K.',
        origin: 'Lomé',
        date: 'Il y a 3 semaines',
        rating: 4.8,
        comment: 'Un passage mythique lors de tout voyage vers le Nord. La vue en descendant la faille est spectaculaire.'
      }
    ]
  }
};

// Fallback dynamique intelligent généré pour tous les autres sites
export function getSiteExtraDetails(siteId: string, region: string): SiteExtraDetails {
  if (SITE_DETAILS[siteId]) {
    return SITE_DETAILS[siteId];
  }

  // Profil par défaut adapté à la région
  const isMaritime = region === 'Maritime';
  const isPlateaux = region === 'Plateaux';
  const isNorth = region === 'Kara' || region === 'Savanes' || region === 'Centrale';

  return {
    tags: [
      isMaritime ? 'Littoral' : isPlateaux ? 'Verdure' : 'Terroir',
      'Patrimoine',
      'Visite Guidée',
      'Photo Spot',
      'Culture'
    ],
    activities: [
      {
        title: 'Visite guidée et découverte historique',
        desc: 'Explorez le site avec un guide local pour percer les secrets et anecdotes de ce monument emblématique.',
        icon: 'history'
      },
      {
        title: 'Promenade et photographie',
        desc: 'Capturez les détails architecturaux et profitez de l’ambiance paisible des lieux.',
        icon: 'camera'
      },
      {
        title: 'Dégustation des saveurs du terroir',
        desc: 'Faites une pause gourmande dans les maquis et restaurants typiques à proximité.',
        icon: 'sparkles'
      },
      {
        title: 'Échange avec les artisans locaux',
        desc: 'Découvrez les savoir-faire traditionnels et repartez avec un souvenir authentique fait main.',
        icon: 'compass'
      }
    ],
    practicalInfo: {
      bestTime: isMaritime ? 'Matinée ou fin d’après-midi en bord de mer' : 'Matinée de 8h à 11h30',
      duration: '1h à 2h',
      outfit: 'Tenue décontractée et confortable, appareil photo et chapeau',
      access: 'Facilement accessible en taxi, transport local ou véhicule privé',
      fee: 'Accès libre ou participation symbolique selon le monument'
    },
    dishesIds: isMaritime
      ? ['ayimolou_togolais', 'ablo_togolais', 'soupe_poisson_togolaise']
      : isPlateaux
      ? ['fufu_togolais', 'agbeli_togolais', 'adzeme_togolais']
      : ['to_sorgho_togolais', 'wagasi_togolais', 'tchoukoutou_togolais'],
    reviews: [
      {
        author: 'Explorateur HeriTogo',
        origin: 'Voyageur certifié',
        date: 'Récemment',
        rating: 4.8,
        comment: 'Un lieu plein de charme et d’histoire. L’audioguide de l’application nous a permis de comprendre toute l’importance de ce patrimoine.'
      }
    ]
  };
}
