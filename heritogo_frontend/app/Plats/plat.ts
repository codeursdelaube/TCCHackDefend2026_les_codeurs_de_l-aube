import ImPlat1 from '@/public/Cuisine/fufu.jpeg';
import ImPlat2 from '@/public/Cuisine/ablo.jpeg';
import ImPlat3 from '@/public/Cuisine/khom (2).jpeg';
import ImPlat4 from '@/public/Cuisine/ayimolou.jpg';
import ImPlat5 from '@/public/Cuisine/djenkoume.jpeg';
import ImPlat6 from '@/public/Cuisine/gboma.jpg';
import ImPlat7 from '@/public/Cuisine/akoume_ademe.jpg';
import ImPlat8 from '@/public/Cuisine/koliko.jpg';
import ImPlat9 from '@/public/Cuisine/azidessi.jpg';

import { StaticImageData } from 'next/image';

export interface Plat {
  id: string;
  catégorie: 'Accompagnement' | 'Plat Principal' | 'Street Food' | 'Sauce';
  image: StaticImageData;
}

export const platsTogolais: Plat[] = [
  {
    "id": "fufu_togolais",
    "catégorie": "Plat Principal",
    "image": ImPlat1
  },
  {
    "id": "ablo_togolais",
    "catégorie": "Accompagnement",
    "image": ImPlat2
  },
  {
    "id": "kom_togolais",
    "catégorie": "Accompagnement",
    "image": ImPlat3
  },
  {
    "id": "ayimolou_togolais",
    "catégorie": "Plat Principal",
    "image": ImPlat4
  },
  {
    "id": "djenkoume_togolais",
    "catégorie": "Plat Principal",
    "image": ImPlat5
  },
  {
    "id": "gboma_dessi",
    "catégorie": "Sauce",
    "image": ImPlat6
  },
  {
    "id": "adzeme_togolais",
    "catégorie": "Sauce",
    "image": ImPlat7
  },
  {
    "id": "koliko_togolais",
    "catégorie": "Street Food",
    "image": ImPlat8
  },
  {
    "id": "vebe_togolais",
    "catégorie": "Sauce",
    "image": ImPlat9
  }
];

export default platsTogolais;