import Im1 from '@/public/parks/tatapark.jpg';
import Im2 from '@/public/parks/amoukadi.png';
import Im3 from '@/public/parks/aqualand.jpg';
import Im4 from '@/public/parks/nyumba.jpg';
import Im5 from '@/public/parks/filoparc.jpg';
import Im6 from '@/public/parks/funny park.jpg';
import Im7 from '@/public/parks/ludiparc.jpg';
import Im8 from '@/public/parks/olodge.jpg';
import Im9 from '@/public/parks/temedja.jpg';
import Im10 from '@/public/parks/faunacultura.jpg';
import Im11 from '@/public/parks/kodegbe.jpg';
import Im12 from '@/public/parks/o2zoo.png';
import Im13 from '@/public/parks/aleapark.jpg';
import Im14 from '@/public/parks/falzao.jpg';
import Im15 from '@/public/parks/keran.jpg';
import Im16 from '@/public/parks/fosseaulion.jpg';

import { StaticImageData } from 'next/image';

export interface Parc {
  id: string;
  lng: number;
  lat: number;
  numero: string;
  image: StaticImageData;
}

export const parcs: Parc[] = [
  {
    id: "africa_park_tata_park",
    lng: 1.222186,
    lat: 6.136629,
    numero: "+228 90 41 12 12",
    image: Im1
  },
  {
    id: "amoukadi_paradis",
    lng: 1.266667,
    lat: 6.216667,
    numero: "+228 98 38 23 73 / +228 70 45 77 58",
    image: Im2
  },
  {
    id: "espace_aere_aqualand",
    lng: 1.21227,
    lat: 6.13748,
    numero: "+228 98 84 ...",
    image: Im3
  },
  {
    id: "espace_loisirs_nyumba",
    lng: 1.3252103,
    lat: 6.1697653,
    numero: "+228 90 21 54 21",
    image: Im4
  },
  {
    id: "fil_o_parc",
    lng: 1.21227,
    lat: 6.13748,
    numero: "+228 22 25 08 36 / +228 22 35 18 28",
    image: Im5
  },
  {
    id: "funny_park",
    lng: 1.18585,
    lat: 6.21389,
    numero: "+228 92 11 01 10",
    image: Im6
  },
  {
    id: "ludi_park",
    lng: 1.21227,
    lat: 6.13748,
    numero: "+228 91 53 66 93 / +228 92 74 10 68",
    image: Im7
  },
  {
    id: "olodge",
    lng: 1.46314,
    lat: 6.2096,
    numero: "+228 90 10 94 94",
    image: Im8
  },
  {
    id: "parc_zoologique_temedja",
    lng: 1.04313,
    lat: 7.53055,
    numero: "+228 98 47 87 87 / +228 91 64 33 33",
    image: Im9
  },
  {
    id: "zoo_fauna_cultura",
    lng: 1.16614,
    lat: 6.17316,
    numero: "+228 92 03 59 99",
    image: Im10
  },
  {
    id: "parc_evou_kpodegbe",
    lng: 1.04313,
    lat: 7.52946,
    numero: "+228 90 15 81 84",
    image: Im11
  },
  {
    id: "o2_zoo",
    lng: 1.09892,
    lat: 6.23064,
    numero: "Non disponible",
    image: Im12
  },
  {
    id: "alea_park",
    lng: 1.16614,
    lat: 6.17316,
    numero: "+228 92 66 77 77 / +228 93 45 30 30 / +228 98 05 70 70",
    image: Im13
  },
  {
    id: "parc_national_fazao_malfakassa",
    lng: 0.8064,
    lat: 8.7362,
    numero: "Non disponible",
    image: Im14
  },
  {
    id: "parc_national_keran",
    lng: 0.63305,
    lat: 10.10698,
    numero: "Non disponible",
    image: Im15
  },
  {
    id: "parc_national_fosse_aux_lions",
    lng: 0.15907,
    lat: 10.7524,
    numero: "Non disponible",
    image: Im16
  }
];

export default parcs;