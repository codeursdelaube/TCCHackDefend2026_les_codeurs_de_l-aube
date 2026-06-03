import Im1 from '@/public/Sites/assigamé.jpg';
import Im2 from '@/public/Sites/catédrale.jpg';
import Im3 from '@/public/Sites/germano.jpg';
import Im4 from '@/public/Sites/koutamakou.jpg';
import Im5 from '@/public/Sites/kpalimé.jpg';
import Im6 from '@/public/Sites/maison_des_esclaves.jpg';
import Im7 from '@/public/Sites/monuments_independance.jpg';
import Im8 from '@/public/Sites/musée_lomé.jpg';
import Im9 from '@/public/Sites/palais_de_lome.webp';
import Im10 from '@/public/Sites/vial.jpg';
import Im11 from '@/public/Sites/village_artisanal.jpg';
import Im12 from '@/public/Sites/yikpa.jpg';

import { StaticImageData } from 'next/image';

export interface Monument {
  id: string;
  nom: string;
  région: string;
  localite: string;
  description: string;
  histoire: string;
  lat: number;
  lng: number;
  image: StaticImageData;
}

export const monuments: Monument[] = [
  {
    "id": "grand_marche_lome",
    "nom": "Grand Marché Assigamé",
    "région": "Maritime",
    "localite": "Lomé",
    "description": "Le célèbre grand marché de la capitale togolaise, haut lieu de commerce et carrefour culturel incontournable.",
    "histoire": "C'est au sein du grand marché Assigamé que l'on découvre les Nana Benz, de célèbres et puissantes commerçantes de tissus imprimés qui ont marqué l'histoire économique du pays.",
    "lat": 6.1245,
    "lng": 1.2224,
    "image": Im1
  },
  {
    "id": "cathedrale_lome",
    "nom": "Cathédrale Sacré-Cœur de Lomé",
    "région": "Maritime",
    "localite": "Lomé",
    "description": "Un joyau architectural de style gothique édifié au début du XXe siècle au centre de la capitale.",
    "histoire": "Construite entre 1901 et 1902 par les missionnaires du Verbe Divin pendant la période coloniale allemande, cet édifice de style gothique est l'un des repères architecturaux et spirituels les plus importants de la capitale togolaise. Elle a été restaurée à la suite de la visite du Pape Jean-Paul II en 1985.",
    "lat": 6.1239,
    "lng": 1.2227,
    "image": Im2
  },
  {
    "id": "statue_amitie_germano",
    "nom": "Statue de l'Amitié Germano-Togolaise",
    "région": "Maritime",
    "localite": "Baguida",
    "description": "Monument historique symbolisant les premiers accords diplomatiques et le traité de protectorat de 1884.",
    "histoire": "Érigée à Baguida en commémoration de la signature du traité de protectorat du 5 juillet 1884 entre l'explorateur allemand Gustav Nachtigal et le roi Mlapa III de Togoville. Ce monument symbolise le point de départ des relations diplomatiques et historiques complexes entre le Togo et l'Allemagne.",
    "lat": 6.17099,
    "lng": 1.32521,
    "image": Im3
  },
  {
    "id": "koutamakou",
    "nom": "Pays Batammariba (Koutamakou)",
    "région": "Kara",
    "localite": "Kandé",
    "description": "Le fameux pays des Batammariba, réputé pour son architecture fortifiée unique en Afrique de l'Ouest.",
    "histoire": "Dans cette région, les maisons sont de véritables fermes-forteresses à étages, très originales par leurs formes fortifiées dotées de terrasses. Conçues pour contenir tout ce que possède le chef de famille, elles sont regroupées en petits villages d'une dizaine d'unités correspondant à un clan.",
    "lat": 10.1068,
    "lng": 1.0561,
    "image": Im4
  },
  {
    "id": "kpalime",
    "nom": "Kpalimé (Le Paradis Vert)",
    "région": "Plateaux",
    "localite": "Kpalimé",
    "description": "Région du café et du cacao, surnommée le paradis vert du Togo pour ses paysages naturels d'exception.",
    "histoire": "Entouré de collines aux bois épais, de plateaux verdoyants, de jungles et de vallées profondes, Kpalimé est encerclé par une nature luxuriante où se trouve le pic d'Agou (plus haut sommet du Togo). C'est également le plus important centre artisanal du pays où travaillent de nombreux sculpteurs sur bois, batikeurs, potiers et tisserands.",
    "lat": 6.9074,
    "lng": 0.6339,
    "image": Im5
  },
  {
    "id": "maison_des_esclaves",
    "nom": "Maison des Esclaves (Woold Home)",
    "région": "Maritime",
    "localite": "Agbodrafo",
    "description": "Un haut lieu de mémoire poignant situé à Agbodrafo, témoin historique du commerce négrier.",
    "histoire": "Située à Agbodrafo, une ancienne cité portugaise reconnue comme faisant partie intégrante de la 'Côte des esclaves', la maison des esclaves (Woold Home) ainsi que le puits des enchaînés constituent les vestiges majeurs de ce passé douloureux où l'émotion reste toujours vive.",
    "lat": 6.2041,
    "lng": 1.4815,
    "image": Im6
  },
  {
    "id": "monument_independance",
    "nom": "Monument de l'Indépendance",
    "région": "Maritime",
    "localite": "Lomé",
    "description": "Un des grands monuments nationaux emblématiques situé au cœur de la capitale togolaise.",
    "histoire": "Situé à Lomé aux côtés de la place de la liberté, ce grand monument majestueux symbolise l'histoire contemporaine, l'indépendance retrouvée et la souveraineté du peuple togolais.",
    "lat": 6.1314,
    "lng": 1.2163,
    "image": Im7
  },
  {
    "id": "musee_de_lome",
    "nom": "Musée National des Arts",
    "région": "Maritime",
    "localite": "Lomé",
    "description": "L'institution nationale dédiée à la préservation des arts, de l'artisanat et de la culture togolaise.",
    "histoire": "Ce fameux musée national situé dans la capitale rassemble les plus belles collections artistiques et patrimoniales du pays, retraçant l'histoire culturelle et les traditions des différentes communautés du Togo.",
    "lat": 6.1319,
    "lng": 1.2149,
    "image": Im8
  },
  {
    "id": "palais_de_lome",
    "nom": "Palais de Lomé",
    "région": "Maritime",
    "localite": "Lomé",
    "description": "Ancien palais colonial transformé en un prestigieux centre d'art et un parc botanique en bord de mer.",
    "histoire": "Ancien Palais des Gouverneurs construit en 1905 par les colons allemands (puis occupé par les gouverneurs français), cet édifice majestueux a été entièrement rénové en 2019 pour devenir un centre d'art et de culture d'envergure internationale, entouré d'un parc botanique d'une biodiversité exceptionnelle en bordure d'océan.",
    "lat": 6.1192,
    "lng": 1.2157,
    "image": Im9
  },
  {
    "id": "chateau_vial",
    "nom": "Château Vial",
    "région": "Plateaux",
    "localite": "Kouma-Konda",
    "description": "Une demeure historique aux allures médiévales surplombant les forêts et vallées du mont Kloto.",
    "histoire": "Construite dans les années 1940 par le gouverneur français d'alors sur les hauteurs verdoyantes du mont Kloto à proximité de Kpalimé, ce château aux allures médiévales sert de résidence d'État. Il offre une vue imprenable sur les vallées forestières frontalières avec le Ghana.",
    "lat": 6.9443,
    "lng": 0.5794,
    "image": Im10
  },
  {
    "id": "village_artisanal",
    "nom": "Le Marché Artisanal de Lomé",
    "région": "Maritime",
    "localite": "Lomé",
    "description": "L'endroit idéal pour découvrir les créations locales et observer les artisans à l'œuvre.",
    "histoire": "C'est l'endroit parfait pour acheter des souvenirs de valeur. Le visiteur peut y observer directement les artisans togolais en pleine création : travail du batik, sculpture sur bois, gravure ou encore techniques de tissage traditionnel.",
    "lat": 6.1261,
    "lng": 1.2291,
    "image": Im11
  },
  {
    "id": "cascade_yikpa",
    "nom": "Cascade de Yikpa",
    "région": "Plateaux",
    "localite": "Yikpa (Danyi)",
    "description": "L'une des plus spectaculaires et hautes chutes d'eau du Togo, nichée dans une nature sauvage.",
    "histoire": "Aussi appelée Douala Falls, c'est l'une des cascades les plus impressionnantes et les plus hautes du Togo. Située à l'extrême nord du plateau de Danyi, elle se déverse le long d'une falaise abrupte dans une végétation dense, marquant de manière spectaculaire la frontière naturelle avec le Ghana.",
    "lat": 7.2347,
    "lng": 0.6542,
    "image": Im12
  }
];

export default monuments;