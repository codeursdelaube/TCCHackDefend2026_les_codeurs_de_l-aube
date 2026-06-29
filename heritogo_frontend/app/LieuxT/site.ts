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

export const monuments: Monument[] = [
  {
    "id": "grand_marche_lome",
    "région": "Maritime",
    "localite": "Lomé",
    "lat": 6.1245,
    "lng": 1.2224,
    "image": Im1
  },
  {
    "id": "cathedrale_lome",
    "région": "Maritime",
    "localite": "Lomé",
    "lat": 6.1239,
    "lng": 1.2227,
    "image": Im2
  },
  {
    "id": "statue_amitie_germano",
    "région": "Maritime",
    "localite": "Baguida",
    "lat": 6.17099,
    "lng": 1.32521,
    "image": Im3
  },
  {
    "id": "koutamakou",
    "région": "Kara",
    "localite": "Kandé",
    "lat": 10.1068,
    "lng": 1.0561,
    "image": Im4
  },
  {
    "id": "kpalime",
    "région": "Plateaux",
    "localite": "Kpalimé",
    "lat": 6.9074,
    "lng": 0.6339,
    "image": Im5
  },
  {
    "id": "maison_des_esclaves",
    "région": "Maritime",
    "localite": "Agbodrafo",
    "lat": 6.2041,
    "lng": 1.4815,
    "image": Im6
  },
  {
    "id": "monument_independance",
    "région": "Maritime",
    "localite": "Lomé",
    "lat": 6.1314,
    "lng": 1.2163,
    "image": Im7
  },
  {
    "id": "musee_de_lome",
    "région": "Maritime",
    "localite": "Lomé",
    "lat": 6.1319,
    "lng": 1.2149,
    "image": Im8
  },
  {
    "id": "palais_de_lome",
    "région": "Maritime",
    "localite": "Lomé",
    "lat": 6.1192,
    "lng": 1.2157,
    "image": Im9
  },
  {
    "id": "chateau_vial",
    "région": "Plateaux",
    "localite": "Kouma-Konda",
    "lat": 6.9443,
    "lng": 0.5794,
    "image": Im10
  },
  {
    "id": "village_artisanal",
    "région": "Maritime",
    "localite": "Lomé",
    "lat": 6.1261,
    "lng": 1.2291,
    "image": Im11
  },
  {
    "id": "cascade_yikpa",
    "région": "Plateaux",
    "localite": "Yikpa (Danyi)",
    "lat": 7.2347,
    "lng": 0.6542,
    "image": Im12
  }
];

export default monuments;