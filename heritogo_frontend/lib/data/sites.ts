const Im1 = '/Sites/assigamé.jpg';
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

// Nouveaux sites ajoutés pour couvrir les 5 régions du Togo à 100%
import Im13 from '@/public/Sites/akodessewa.jpg';
import Im14 from '@/public/Sites/togoville.jpg';
import Im15 from '@/public/Sites/aneho.jpg';
import Im16 from '@/public/Sites/plage_lome.jpg';
import Im17 from '@/public/Sites/kpime.jpg';
import Im18 from '@/public/Sites/aklowa.jpg';
import Im19 from '@/public/Sites/notse_agbogbo.jpg';
import Im20 from '@/public/Sites/fazao_malfakassa.jpg';
import Im21 from '@/public/Sites/lac_nangbeto.jpg';
import Im22 from '@/public/Sites/sokode.jpg';
import Im23 from '@/public/Sites/aledjo.jpg';
import Im24 from '@/public/Sites/sarakawa.jpg';
import Im25 from '@/public/Sites/forgerons_tchare.jpg';
import Im26 from '@/public/Sites/oti_mandouri.jpg';
import Im27 from '@/public/Sites/namoundjoga.jpg';
import Im28 from '@/public/Sites/grottes_nok.jpg';
import Im29 from '@/public/Sites/dapaong.jpg';

import { StaticImageData } from 'next/image';

export interface Monument {
  id: string;
  région: 'Maritime' | 'Plateaux' | 'Centrale' | 'Kara' | 'Savanes';
  localite: string;
  lat: number;
  lng: number;
  image: StaticImageData | string;
}

export const monuments: Monument[] = [
  // ── RÉGION MARITIME ──
  {
    id: "grand_marche_lome",
    région: "Maritime",
    localite: "Lomé",
    lat: 6.1271125,
    lng: 1.2265156,
    image: Im1
  },
  {
    id: "cathedrale_lome",
    région: "Maritime",
    localite: "Lomé",
    lat: 6.1249813,
    lng: 1.2262744,
    image: Im2
  },
  {
    id: "statue_amitie_germano",
    région: "Maritime",
    localite: "Togoville",
    lat: 6.2350683,
    lng: 1.4787564,
    image: Im3
  },
  {
    id: "maison_des_esclaves",
    région: "Maritime",
    localite: "Agbodrafo",
    lat: 6.2037825,
    lng: 1.4769242,
    image: Im6
  },
  {
    id: "monument_independance",
    région: "Maritime",
    localite: "Lomé",
    lat: 6.129303,
    lng: 1.2146558,
    image: Im7
  },
  {
    id: "musee_de_lome",
    région: "Maritime",
    localite: "Lomé",
    lat: 6.1307131,
    lng: 1.2179824,
    image: Im8
  },
  {
    id: "palais_de_lome",
    région: "Maritime",
    localite: "Lomé",
    lat: 6.1200209,
    lng: 1.2121978,
    image: Im9
  },
  {
    id: "village_artisanal",
    région: "Maritime",
    localite: "Lomé",
    lat: 6.1334442,
    lng: 1.2198059,
    image: Im11
  },
  {
    id: "marche_fetiches_akodessewa",
    région: "Maritime",
    localite: "Lomé",
    lat: 6.1580,
    lng: 1.2290,
    image: Im13
  },
  {
    id: "togoville_sanctuaire",
    région: "Maritime",
    localite: "Togoville",
    lat: 6.2310,
    lng: 1.4980,
    image: Im14
  },
  {
    id: "aneho_cite_coloniale",
    région: "Maritime",
    localite: "Aného",
    lat: 6.2280,
    lng: 1.5950,
    image: Im15
  },
  {
    id: "plage_de_lome",
    région: "Maritime",
    localite: "Lomé",
    lat: 6.1100,
    lng: 1.2150,
    image: Im16
  },

  // ── RÉGION DES PLATEAUX ──
  {
    id: "kpalime",
    région: "Plateaux",
    localite: "Kpalimé",
    lat: 6.9097671,
    lng: 0.6298922,
    image: Im5
  },
  {
    id: "chateau_vial",
    région: "Plateaux",
    localite: "Kouma-Konda (Agomé Yo)",
    lat: 6.9521074,
    lng: 0.58223,
    image: Im10
  },
  {
    id: "cascade_yikpa",
    région: "Plateaux",
    localite: "Yikpa (Danyi)",
    lat: 7.109,
    lng: 0.607,
    image: Im12
  },
  {
    id: "cascade_kpime",
    région: "Plateaux",
    localite: "Kpalimé",
    lat: 6.8960,
    lng: 0.5820,
    image: Im17
  },
  {
    id: "cascade_aklowa",
    région: "Plateaux",
    localite: "Badou",
    lat: 7.5870,
    lng: 0.5970,
    image: Im18
  },
  {
    id: "notse_agbogbo",
    région: "Plateaux",
    localite: "Notsè",
    lat: 6.9790,
    lng: 1.1680,
    image: Im19
  },

  // ── RÉGION CENTRALE ──
  {
    id: "parc_fazao_malfakassa",
    région: "Centrale",
    localite: "Sokodé",
    lat: 8.7500,
    lng: 0.7000,
    image: Im20
  },
  {
    id: "lac_de_nangbeto",
    région: "Centrale",
    localite: "Nangbéto",
    lat: 7.4350,
    lng: 1.3270,
    image: Im21
  },
  {
    id: "sokode_centre",
    région: "Centrale",
    localite: "Sokodé",
    lat: 8.9880,
    lng: 1.1440,
    image: Im22
  },

  // ── RÉGION DE LA KARA ──
  {
    id: "koutamakou",
    région: "Kara",
    localite: "Nadoba (Kandé)",
    lat: 9.8487353,
    lng: 0.6351617,
    image: Im4
  },
  {
    id: "faille_aledjo",
    région: "Kara",
    localite: "Alédjo",
    lat: 9.2020,
    lng: 1.1300,
    image: Im23
  },
  {
    id: "reserve_sarakawa",
    région: "Kara",
    localite: "Sarakawa",
    lat: 9.6110,
    lng: 1.1670,
    image: Im24
  },
  {
    id: "forgerons_tchare",
    région: "Kara",
    localite: "Tcharè",
    lat: 9.6500,
    lng: 1.1500,
    image: Im25
  },

  // ── RÉGION DES SAVANES ──
  {
    id: "reserve_oti_mandouri",
    région: "Savanes",
    localite: "Mandouri",
    lat: 10.9000,
    lng: 0.5500,
    image: Im26
  },
  {
    id: "peintures_namoundjoga",
    région: "Savanes",
    localite: "Namoundjoga",
    lat: 10.8500,
    lng: 0.2800,
    image: Im27
  },
  {
    id: "grottes_de_nok",
    région: "Savanes",
    localite: "Nano",
    lat: 10.8200,
    lng: 0.4200,
    image: Im28
  },
  {
    id: "dapaong_marche",
    région: "Savanes",
    localite: "Dapaong",
    lat: 10.8640,
    lng: 0.2100,
    image: Im29
  }
];

export default monuments;