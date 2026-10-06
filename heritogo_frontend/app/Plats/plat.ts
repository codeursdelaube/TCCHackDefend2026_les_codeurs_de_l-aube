import ImPlat1 from '@/public/Cuisine/fufuhero.png';
import ImPlat2 from '@/public/Cuisine/ablo.jpeg';
import ImPlat3 from '@/public/Cuisine/khom (2).jpeg';
import ImPlat4 from '@/public/Cuisine/ayimolou.png';
import ImPlat5 from '@/public/Cuisine/djenkoume.jpeg';
import ImPlat6 from '@/public/Cuisine/gboma.jpg';
import ImPlat7 from '@/public/Cuisine/akoume_ademe.jpg';
import ImPlat8 from '@/public/Cuisine/koliko.jpg';
import ImPlat9 from '@/public/Cuisine/azidessi.jpg';

// Nouveaux plats et boissons traditionnels
import ImPlat10 from '@/public/Cuisine/wagasi.jpg';
import ImPlat11 from '@/public/Cuisine/fetri_dessi.jpg';
import ImPlat12 from '@/public/Cuisine/ademe_dessi.jpg';
import ImPlat13 from '@/public/Cuisine/to_sorgho.jpg';
import ImPlat14 from '@/public/Cuisine/riz_gras.jpg';
import ImPlat15 from '@/public/Cuisine/soupe_poisson.jpg';
import ImPlat16 from '@/public/Cuisine/hanvidokpome.jpg';
import ImPlat17 from '@/public/Cuisine/tchoukoutou.jpg';
import ImPlat18 from '@/public/Cuisine/sodabi.jpg';
import ImPlat19 from '@/public/Cuisine/agbeli.jpg';

import { StaticImageData } from 'next/image';

export interface Plat {
  id: string;
  catégorie: 'Accompagnement' | 'Plat Principal' | 'Street Food' | 'Sauce' | 'Boisson';
  image: StaticImageData;
}

export const platsTogolais: Plat[] = [
  {
    id: "fufu_togolais",
    catégorie: "Plat Principal",
    image: ImPlat1
  },
  {
    id: "ablo_togolais",
    catégorie: "Accompagnement",
    image: ImPlat2
  },
  {
    id: "kom_togolais",
    catégorie: "Accompagnement",
    image: ImPlat3
  },
  {
    id: "ayimolou_togolais",
    catégorie: "Plat Principal",
    image: ImPlat4
  },
  {
    id: "djenkoume_togolais",
    catégorie: "Plat Principal",
    image: ImPlat5
  },
  {
    id: "gboma_dessi",
    catégorie: "Sauce",
    image: ImPlat6
  },
  {
    id: "adzeme_togolais",
    catégorie: "Sauce",
    image: ImPlat7
  },
  {
    id: "koliko_togolais",
    catégorie: "Street Food",
    image: ImPlat8
  },
  {
    id: "vebe_togolais",
    catégorie: "Sauce",
    image: ImPlat9
  },
  {
    id: "wagasi_togolais",
    catégorie: "Accompagnement",
    image: ImPlat10
  },
  {
    id: "fetri_dessi",
    catégorie: "Sauce",
    image: ImPlat11
  },
  {
    id: "to_sorgho_togolais",
    catégorie: "Plat Principal",
    image: ImPlat13
  },
  {
    id: "riz_gras_togolais",
    catégorie: "Plat Principal",
    image: ImPlat14
  },
  {
    id: "soupe_poisson_togolaise",
    catégorie: "Plat Principal",
    image: ImPlat15
  },
  {
    id: "hanvidokpome_aneho",
    catégorie: "Plat Principal",
    image: ImPlat16
  },
  {
    id: "agbeli_togolais",
    catégorie: "Accompagnement",
    image: ImPlat19
  },
  {
    id: "tchoukoutou_togolais",
    catégorie: "Boisson",
    image: ImPlat17
  },
  {
    id: "sodabi_togolais",
    catégorie: "Boisson",
    image: ImPlat18
  }
];

export default platsTogolais;