const fs = require('fs');
const path = require('path');

const translations = {
  fr: {
    tagline: 'Votre compagnon de voyage',
    app_name: 'HeriTogo',
    header_kicker: 'Guide du Patrimoine & Tourisme Togolais',
    header_title: 'Découvrez les destinations et le patrimoine togolais autour de vous.',
    destinations_title: 'Nos destinations',
    destinations_subtitle: 'Sélection coup de cœur au Togo',
    destinations_see_all: 'Voir plus',
    pill_discover: 'Découvrir',
    pill_discover_region: 'Découvrir la région',
    downloaded_title: 'Mes destinations enregistrées',
    downloaded_subtitle: 'Accessibles même sans connexion Internet',
    downloaded_badge: 'Hors-ligne',
    downloaded_cached: 'Disponible partout',
    treasures_title: '1001 sites et trésors incontournables du Togo',
    treasures_subtitle: 'Explorez notre patrimoine par catégorie.',
    categories: {
      monuments: 'Monuments',
      tamberma: 'Châteaux Tamberma',
      nature: 'Cascades & Monts',
      cuisine: 'Gastronomie & Terroir',
      guides: 'Guides Locaux Certifiés',
      scan: 'Scanner IA',
      plages: 'Plages & Lac Togo',
      histoire: 'Histoire & Musées'
    },
    category_counts: {
      monuments: '12 sites majeurs',
      tamberma: 'UNESCO Koutammakou',
      nature: 'Plateaux & Kloto',
      cuisine: '9 délices traditionnels',
      guides: 'Accompagnateurs certifiés',
      scan: 'Reconnaissance instantanée',
      plages: 'Littoral & Lac Togo',
      histoire: 'Mémoire vivante'
    },
    incontournables_title: 'Les incontournables',
    incontournables_see_all: 'Tout voir',
    regions_section_title: 'Les 5 régions du Togo à portée de main',
    regions_section_desc: 'Du littoral atlantique aux falaises du Nord, parcourez la richesse géographique et humaine du Togo.',
    regions: {
      maritime: {
        name: 'Maritime & Grand Lomé',
        tag: 'Capitale & Côte Atlantique',
        desc: 'Palais de Lomé, Maison des Esclaves d\'Agbodrafo, Lac Togo et plages de sable fin.',
        badge: 'Littoral'
      },
      plateaux: {
        name: 'Plateaux & Kloto',
        tag: 'Café, Forêts & Cascades',
        desc: 'Kpalimé, Mont Agou, Cascades de Yikpa, Château Viale et plantations fertiles.',
        badge: 'Écotourisme'
      },
      centrale: {
        name: 'Centrale & Sokodé',
        tag: 'Artisanat & Traditions',
        desc: 'Sokodé, Parc Fazao-Malfakassa, tissage artisanal et grandes festivités culturelles.',
        badge: 'Tradition'
      },
      kara: {
        name: 'Kara & Koutammakou',
        tag: 'Châteaux Tata Tamberma UNESCO',
        desc: 'Habitat traditionnel fortifié Batammariba, monts Défalé et forges ancestrales.',
        badge: 'UNESCO'
      },
      savanes: {
        name: 'Savanes & Dapaong',
        tag: 'Grottes & Falaises Sahéliennes',
        desc: 'Grottes rupestres de Nano et Bogou, fosse aux lions et panoramas sauvages.',
        badge: 'Aventure'
      }
    },
    audioguides_section_title: 'De nombreux récits et audioguides pour enrichir votre visite',
    audioguides_section_desc: 'Écoutez les récits captivants de nos monuments et sites sacrés racontés à voix haute dans votre langue préférée.',
    audioguide_sample_title: 'Monument de l\'Indépendance',
    audioguide_sample_location: 'Lomé • Région Maritime',
    audioguide_sample_desc: 'Érigé le 27 avril 1960 pour célébrer l\'accession du Togo à la souveraineté internationale. La silhouette monumentale sculptée par Georges Coustère symbolise la libération du peuple togolais brisant les chaînes de la colonisation.',
    audioguide_play: 'Écouter l\'histoire',
    audioguide_pause: 'Mettre en pause',
    audioguide_choose_lang: 'Langue du récit',
    audioguide_btn_open: 'Ouvrir la fiche complète',
    audioguide_tts_badge: 'Gemini IA Narration',
    interactive_map_title: 'Visualisez les sites touristiques sur une carte interactive',
    interactive_map_desc: 'Repérez instantanément les monuments, cascades et trésors togolais selon vos envies et votre position GPS.',
    interactive_map_all_regions: 'Toutes les régions',
    interactive_map_btn_gps: 'Monuments à proximité',
    interactive_map_open_view: 'Ouvrir la carte interactive'
  },
  en: {
    tagline: 'Your travel companion',
    app_name: 'HeriTogo',
    header_kicker: 'Togolese Heritage & Tourism Guide',
    header_title: 'Discover destinations and Togolese heritage around you.',
    destinations_title: 'Our destinations',
    destinations_subtitle: 'Handpicked highlights in Togo',
    destinations_see_all: 'View more',
    pill_discover: 'Discover',
    pill_discover_region: 'Discover region',
    downloaded_title: 'My offline destinations',
    downloaded_subtitle: 'Accessible even without an Internet connection',
    downloaded_badge: 'Offline',
    downloaded_cached: 'PWA Cache',
    treasures_title: '1001 must-see sites and treasures of Togo',
    treasures_subtitle: 'Explore our heritage by category right at your fingertips.',
    categories: {
      monuments: 'Monuments',
      tamberma: 'Tamberma Castles',
      nature: 'Waterfalls & Mountains',
      cuisine: 'Gastronomy & Local Flavors',
      guides: 'Certified Local Guides',
      scan: 'Gemini AI Scanner',
      plages: 'Beaches & Lake Togo',
      histoire: 'History & Museums'
    },
    category_counts: {
      monuments: '12 major sites',
      tamberma: 'UNESCO Koutammakou',
      nature: 'Plateaux & Kloto',
      cuisine: '9 traditional dishes',
      guides: 'Certified companions',
      scan: 'Instant recognition',
      plages: 'Coastline & Lake Togo',
      histoire: 'Living memory'
    },
    incontournables_title: 'Must-see sites',
    incontournables_see_all: 'View all',
    regions_section_title: 'The 5 regions of Togo at your fingertips',
    regions_section_desc: 'From the Atlantic coast to the northern cliffs, experience the geographical and cultural richness of Togo.',
    regions: {
      maritime: {
        name: 'Maritime & Greater Lomé',
        tag: 'Capital & Atlantic Coast',
        desc: 'Palais de Lomé, Agbodrafo Slave House, Lake Togo and golden sandy beaches.',
        badge: 'Coastline'
      },
      plateaux: {
        name: 'Plateaux & Kloto',
        tag: 'Coffee, Forests & Waterfalls',
        desc: 'Kpalimé, Mount Agou, Yikpa Waterfalls, Château Viale and fertile plantations.',
        badge: 'Ecotourism'
      },
      centrale: {
        name: 'Centrale & Sokodé',
        tag: 'Crafts & Traditions',
        desc: 'Sokodé, Fazao-Malfakassa National Park, artisanal weaving and cultural festivities.',
        badge: 'Tradition'
      },
      kara: {
        name: 'Kara & Koutammakou',
        tag: 'Tata Tamberma Castles UNESCO',
        desc: 'Batammariba fortified traditional dwellings, Défalé mountains and ancient forges.',
        badge: 'UNESCO'
      },
      savanes: {
        name: 'Savanes & Dapaong',
        tag: 'Caves & Sahelian Cliffs',
        desc: 'Nano and Bogou rock caves, Lion Pit reserve and breathtaking wild panoramas.',
        badge: 'Adventure'
      }
    },
    audioguides_section_title: 'Rich audio guides and stories for your visit',
    audioguides_section_desc: 'Listen to compelling stories of historical monuments and sacred sites spoken aloud in your preferred language.',
    audioguide_sample_title: 'Independence Monument',
    audioguide_sample_location: 'Lomé • Maritime Region',
    audioguide_sample_desc: 'Erected on April 27, 1960 to celebrate Togo\'s independence. The monumental silhouette sculpted by Georges Coustère symbolizes the liberation of the Togolese people breaking free from colonial bonds.',
    audioguide_play: 'Listen to story',
    audioguide_pause: 'Pause',
    audioguide_choose_lang: 'Story language',
    audioguide_btn_open: 'Open full site details',
    audioguide_tts_badge: 'Gemini AI Narration',
    interactive_map_title: 'View tourist sites on an interactive map',
    interactive_map_desc: 'Instantly pinpoint monuments, waterfalls and treasures based on your interests and live GPS position.',
    interactive_map_all_regions: 'All regions',
    interactive_map_btn_gps: 'Nearby monuments',
    interactive_map_open_view: 'Open interactive map'
  },
  es: {
    tagline: 'Tu compañero de viaje',
    app_name: 'HeriTogo',
    header_kicker: 'Guía de Patrimonio y Turismo de Togo',
    header_title: 'Descubra los destinos y el patrimonio de Togo a su alrededor.',
    destinations_title: 'Nuestros destinos',
    destinations_subtitle: 'Selección destacada en Togo',
    destinations_see_all: 'Ver más',
    pill_discover: 'Descubrir',
    pill_discover_region: 'Descubrir región',
    downloaded_title: 'Mis destinos sin conexión',
    downloaded_subtitle: 'Accesibles incluso sin conexión a Internet',
    downloaded_badge: 'Sin conexión',
    downloaded_cached: 'PWA Cache',
    treasures_title: '1001 sitios y tesoros imperdibles de Togo',
    treasures_subtitle: 'Explore nuestro patrimonio por categoría al alcance de su mano.',
    categories: {
      monuments: 'Monumentos',
      tamberma: 'Castillos Tamberma',
      nature: 'Cascadas y Montañas',
      cuisine: 'Gastronomía y Sabores',
      guides: 'Guías Locales Certificados',
      scan: 'Escáner IA Gemini',
      plages: 'Playas y Lago Togo',
      histoire: 'Historia y Museos'
    },
    category_counts: {
      monuments: '12 sitios clave',
      tamberma: 'UNESCO Koutammakou',
      nature: 'Plateaux & Kloto',
      cuisine: '9 delicias tradicionales',
      guides: 'Acompañantes certificados',
      scan: 'Reconocimiento instantáneo',
      plages: 'Costa y Lago Togo',
      histoire: 'Memoria viva'
    },
    incontournables_title: 'Los imprescindibles',
    incontournables_see_all: 'Ver todo',
    regions_section_title: 'Las 5 regiones de Togo a su alcance',
    regions_section_desc: 'Desde la costa atlántica hasta los acantilados del norte, descubra la diversidad geográfica y cultural de Togo.',
    regions: {
      maritime: {
        name: 'Maritime y Gran Lomé',
        tag: 'Capital y Costa Atlántica',
        desc: 'Palacio de Lomé, Casa de los Esclavos de Agbodrafo, Lago Togo y playas doradas.',
        badge: 'Litoral'
      },
      plateaux: {
        name: 'Plateaux & Kloto',
        tag: 'Café, Bosques y Cascadas',
        desc: 'Kpalimé, Monte Agou, Cascadas de Yikpa, Castillo Viale y plantaciones fértiles.',
        badge: 'Ecoturismo'
      },
      centrale: {
        name: 'Centrale & Sokodé',
        tag: 'Artesanía y Tradiciones',
        desc: 'Sokodé, Parque Fazao-Malfakassa, tejidos artesanales y festividades culturales.',
        badge: 'Tradición'
      },
      kara: {
        name: 'Kara & Koutammakou',
        tag: 'Castillos Tata Tamberma UNESCO',
        desc: 'Hábitat tradicional fortificado Batammariba, montañas Défalé y forjas ancestrales.',
        badge: 'UNESCO'
      },
      savanes: {
        name: 'Savanes & Dapaong',
        tag: 'Cuevas y Acantilados',
        desc: 'Cuevas rupestres de Nano y Bogou, fosa de leones y paisajes salvajes.',
        badge: 'Aventura'
      }
    },
    audioguides_section_title: 'Múltiples audioguías para facilitar su visita',
    audioguides_section_desc: 'Escuche relatos cautivadores de monumentos históricos leídos en voz alta en su idioma preferido.',
    audioguide_sample_title: 'Monumento de la Independencia',
    audioguide_sample_location: 'Lomé • Región Maritime',
    audioguide_sample_desc: 'Erigido el 27 de abril de 1960 para celebrar la independencia de Togo. La silueta monumental esculpida por Georges Coustère simboliza la liberación del pueblo togolés rompiendo las cadenas coloniales.',
    audioguide_play: 'Escuchar historia',
    audioguide_pause: 'Pausar',
    audioguide_choose_lang: 'Idioma de narración',
    audioguide_btn_open: 'Abrir ficha completa',
    audioguide_tts_badge: 'Narración IA Gemini',
    interactive_map_title: 'Vea los sitios turísticos en un mapa interactivo',
    interactive_map_desc: 'Localice al instante monumentos, cascadas y tesoros según sus gustos y su posición GPS en tiempo real.',
    interactive_map_all_regions: 'Todas las regiones',
    interactive_map_btn_gps: 'Monumentos cercanos',
    interactive_map_open_view: 'Abrir mapa interactivo'
  },
  zh: {
    tagline: '您的旅行伴侣',
    app_name: 'HeriTogo',
    header_kicker: '多哥遗产与旅游智能指南',
    header_title: '探索您身边的多哥旅游目的地与文化遗产。',
    destinations_title: '热门目的地',
    destinations_subtitle: '精选多哥必游景点',
    destinations_see_all: '查看更多',
    pill_discover: '探索',
    pill_discover_region: '探索该地区',
    downloaded_title: '离线目的地',
    downloaded_subtitle: '无需网络连接也可随时访问',
    downloaded_badge: '离线模式',
    downloaded_cached: 'PWA缓存',
    treasures_title: '1001个多哥必游胜地与珍贵遗产',
    treasures_subtitle: '按分类快速探索多哥文化遗产。',
    categories: {
      monuments: '历史古迹',
      tamberma: '塔姆贝尔马城堡',
      nature: '瀑布与名山',
      cuisine: '地道美食与风味',
      guides: '认证本地导游',
      scan: 'Gemini AI 智能扫描',
      plages: '海滩与多哥湖',
      histoire: '历史与博物馆'
    },
    category_counts: {
      monuments: '12大核心古迹',
      tamberma: '联合国教科文组织库塔马库',
      nature: '高原区与克洛托',
      cuisine: '9大传统特色美味',
      guides: '认证专业伴游',
      scan: '即时视觉识别',
      plages: '南部海岸与湖泊',
      histoire: '鲜活文化记忆'
    },
    incontournables_title: '精选必游',
    incontournables_see_all: '查看全部',
    regions_section_title: '多哥五大区域尽在指尖',
    regions_section_desc: '从大西洋海岸到北部悬崖，领略多哥丰富的自然与人文风貌。',
    regions: {
      maritime: {
        name: '滨海区与大洛美',
        tag: '首都与大西洋海岸',
        desc: '洛美宫、阿博德拉福奴隶之家、多哥湖与金色沙滩。',
        badge: '海岸'
      },
      plateaux: {
        name: '高原区与克洛托',
        tag: '咖啡、森林与瀑布',
        desc: '帕利梅、阿古山、伊克帕瀑布、维亚莱城堡与繁茂庄园。',
        badge: '生态旅游'
      },
      centrale: {
        name: '中央区与索科德',
        tag: '手工艺与古老传统',
        desc: '索科德、法扎奥-马尔法卡萨公园、手工纺织与特色民俗节日。',
        badge: '传统'
      },
      kara: {
        name: '卡拉区与库塔马库',
        tag: '联合国世遗塔塔城堡',
        desc: '巴塔马里巴传统要塞民居、德法莱山与传统锻造工坊。',
        badge: '世遗'
      },
      savanes: {
        name: '萨凡纳草原区与达庞',
        tag: '岩洞与萨赫勒悬崖',
        desc: '纳诺与博古岩画洞穴、狮子坑自然区与壮丽狂野风光。',
        badge: '探险'
      }
    },
    audioguides_section_title: '丰富的语音导览与传奇故事',
    audioguides_section_desc: '使用您的母语聆听历史古迹与神圣景点的生动讲解。',
    audioguide_sample_title: '独立纪念碑',
    audioguide_sample_location: '洛美 • 滨海区',
    audioguide_sample_desc: '于1960年4月27日落成，纪念多哥重获国家独立。由乔治·库斯特尔创作的宏伟雕像象征着多哥人民挣脱束缚、迈向自由。',
    audioguide_play: '播放故事',
    audioguide_pause: '暂停',
    audioguide_choose_lang: '导览语言',
    audioguide_btn_open: '查看完整详情',
    audioguide_tts_badge: 'Gemini AI 智能语音',
    interactive_map_title: '在交互式地图上查看旅游景点',
    interactive_map_desc: '根据您的兴趣与实时GPS定位，快速查找附近的古迹、瀑布与自然景观。',
    interactive_map_all_regions: '所有区域',
    interactive_map_btn_gps: '附近的景点',
    interactive_map_open_view: '打开交互式地图'
  }
};

const messagesDir = path.resolve(__dirname, '../messages');

for (const lang of ['fr', 'en', 'es', 'zh']) {
  const filePath = path.join(messagesDir, `${lang}.json`);
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  
  if (!data.Accueil) data.Accueil = {};
  
  Object.assign(data.Accueil, translations[lang]);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
  console.log(`[OK] Successfully updated ${lang}.json`);
}
