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
  région: string;
  localite: string;
  lat: number;
  lng: number;
  image: StaticImageData;
}

// Coordonnées vérifiées via Google Places le 22/08/2026.
// ⚠️ 1 correction géographique importante : le monument "germano" n'est
// PAS à Baguida — c'est "Le Monument du Centenaire Germano-Togolais",
// situé à TOGOVILLE (au bord du lac Togo), là où le traité de protectorat
// entre le roi Mlapa III et Gustav Nachtigal a été signé en 1884.
// Baguida revendique aussi une partie de cette histoire dans certains
// articles de presse locale, mais le monument physique est bien à Togoville.

export const monuments: Monument[] = [
  {
    "id": "grand_marche_lome",
    "région": "Maritime",
    "localite": "Lomé",
    "lat": 6.1271125,
    "lng": 1.2265156,
    "image": Im1
  },
  {
    "id": "cathedrale_lome",
    "région": "Maritime",
    "localite": "Lomé",
    "lat": 6.1249813,
    "lng": 1.2262744,
    "image": Im2
  },
  {
    // CORRECTION : localité changée de "Baguida" → "Togoville"
    // (Google Places : "Le Monument du Centenaire Germano-Togolais", Togoville)
    "id": "statue_amitie_germano",
    "région": "Maritime",
    "localite": "Togoville",
    "lat": 6.2350683,
    "lng": 1.4787564,
    "image": Im3
  },
  {
    // Point d'entrée réel du site UNESCO : village de Nadoba, porte d'accès
    // au Koutammakou depuis Kandé (~30 km de piste). L'ancien lat/lng
    // 10.1068 / 1.0561 était trop imprécis (pas de lieu réel à ce point).
    "id": "koutamakou",
    "région": "Kara",
    "localite": "Nadoba (Kandé)",
    "lat": 9.8487353,
    "lng": 0.6351617,
    "image": Im4
  },
  {
    "id": "kpalime",
    "région": "Plateaux",
    "localite": "Kpalimé",
    "lat": 6.9097671,
    "lng": 0.6298922,
    "image": Im5
  },
  {
    "id": "maison_des_esclaves",
    "région": "Maritime",
    "localite": "Agbodrafo",
    "lat": 6.2037825,
    "lng": 1.4769242,
    "image": Im6
  },
  {
    "id": "monument_independance",
    "région": "Maritime",
    "localite": "Lomé",
    "lat": 6.129303,
    "lng": 1.2146558,
    "image": Im7
  },
  {
    // "Musée National du Togo" — confirmé juste derrière le Palais des
    // Congrès, à côté du Monument de l'Indépendance.
    "id": "musee_de_lome",
    "région": "Maritime",
    "localite": "Lomé",
    "lat": 6.1307131,
    "lng": 1.2179824,
    "image": Im8
  },
  {
    "id": "palais_de_lome",
    "région": "Maritime",
    "localite": "Lomé",
    "lat": 6.1200209,
    "lng": 1.2121978,
    "image": Im9
  },
  {
    // "Chateau Viale" (Google) — situé précisément à Agomé Yo, sur la
    // crête au-dessus de Kouma-Konda (nom encore couramment utilisé).
    "id": "chateau_vial",
    "région": "Plateaux",
    "localite": "Kouma-Konda (Agomé Yo)",
    "lat": 6.9521074,
    "lng": 0.58223,
    "image": Im10
  },
  {
    "id": "village_artisanal",
    "région": "Maritime",
    "localite": "Lomé",
    "lat": 6.1334442,
    "lng": 1.2198059,
    "image": Im11
  },
  {
    // "Cascade de Yikpa" — confirmée près de Sadomé, commune de Danyi.
    "id": "cascade_yikpa",
    "région": "Plateaux",
    "localite": "Yikpa (Danyi)",
    "lat": 7.109,
    "lng": 0.607,
    "image": Im12
  }
];

export default monuments;