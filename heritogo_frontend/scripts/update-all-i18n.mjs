import fs from 'fs';
import path from 'path';

const NEW_MONUMENTS = {
  fr: {
    marche_fetiches_akodessewa: {
      nom: "Marché des Fétiches d'Akodésséwa",
      description: "Le plus grand marché vaudou et de médecine traditionnelle au monde, situé au cœur de Lomé.",
      histoire: "Véritable institution spirituelle et culturelle, le marché d'Akodésséwa rassemble les guérisseurs traditionnels et prêtres vaudou de toute l'Afrique de l'Ouest. On y trouve des talismans sacrés, des poudres végétales ancestrales et des objets rituels protecteurs façonnés selon les traditions séculaires."
    },
    togoville_sanctuaire: {
      nom: "Togoville & Lac Togo",
      description: "Cité historique sacrée berceau du nom 'Togo', sanctuaire marial et couvents vaudou ancestraux.",
      histoire: "Située sur la rive nord du lac Togo, Togoville a donné son nom à tout le pays après la signature du traité de 1884 entre le roi Mlapa III et Gustav Nachtigal. Lieu de rencontre fascinant entre la tradition animiste et le catholicisme, le village abrite à la fois de célèbres couvents vaudou et la cathédrale Notre-Dame du Lac."
    },
    aneho_cite_coloniale: {
      nom: "Aného (Ancienne Capitale)",
      description: "Ancienne capitale coloniale du Togo bordée par l'océan Atlantique et la lagune des lacs.",
      histoire: "Capitale du Togo sous l'administration allemande puis française de 1886 à 1897, Aného est un centre historique du peuple Guin-Mina. Ses majestueuses bâtisses de style colonial, son embouchure magique où la lagune rejoint l'océan et son célèbre sanctuaire de Glidji pour la fête d'Epé-Ekpé en font une halte culturelle majeure."
    },
    plage_de_lome: {
      nom: "Plage & Corniche de Lomé",
      description: "Le magnifique littoral de sable fin bordé de cocotiers qui s'étend sur toute la longueur de la capitale.",
      histoire: "La plage de Lomé est l'une des rares plages de mer au monde située directement au cœur d'une capitale. Point de rencontre populaire le week-end, les pêcheurs traditionnels y tirent leurs immenses filets en chantant en rythme au coucher du soleil."
    },
    cascade_kpime: {
      nom: "Cascade de Kpimé",
      description: "Superbe chute d'eau tropicale nichée dans les collines verdoyantes de Kpalimé.",
      histoire: "Située à une dizaine de kilomètres de Kpalimé sur la route d'Atakpamé, la cascade de Kpimé dévale des parois rocheuses au cœur d'une végétation dense de fougères et de cacaoyers, offrant une fraîcheur revitalisante très appréciée des randonneurs."
    },
    cascade_aklowa: {
      nom: "Cascade d'Aklowa (Badou)",
      description: "La spectaculaire cascade d'eaux sulfureuses de près de 100 mètres de hauteur dissimulée dans la forêt de Badou.",
      histoire: "Considérée comme l'une des plus impressionnantes cascades du pays, Aklowa jaillit d'une falaise abrupte. Selon la tradition locale, ses eaux pures et légèrement sulfureuses possèdent des propriétés médicinales et purificatrices."
    },
    notse_agbogbo: {
      nom: "Muraille d'Agbogbo à Notsè",
      description: "Les vestiges légendaires de la cité royale fortifiée, berceau historique du peuple Éwé.",
      histoire: "Au XVe siècle, Notsè était la capitale du puissant royaume Éwé sous le règne du roi Agokoli. Les ruines monumentales du mur d'enceinte en terre battue (Agbogbodi) témoignent encore aujourd'hui de l'épopée fondatrice de la grande migration des Éwés vers la côte."
    },
    parc_fazao_malfakassa: {
      nom: "Parc National de Fazao-Malfakassa",
      description: "Le plus grand parc national du Togo (192 000 ha), réserve de biodiversité sauvage et de reliefs rocheux.",
      histoire: "À cheval sur la chaîne de l'Atakora dans la Région Centrale, ce parc naturel spectaculaire protège des forêts denses de savane, des éléphants d'Afrique, des buffles, des antilopes et des centaines d'espèces d'oiseaux migrateurs au cœur d'un paysage de collines escarpées."
    },
    lac_de_nangbeto: {
      nom: "Lac de Nangbéto & Barrage",
      description: "Vaste étendue d'eau artificielle sur le fleuve Mono, sanctuaire d'oiseaux aquatiques et d'hippopotames.",
      histoire: "Créé par la retenue du barrage hydroélectrique sur le fleuve Mono, le lac de Nangbéto est devenu un écosystème remarquable propice aux promenades en pirogue, à la pêche artisanale et à l'observation d'hippopotames en liberté."
    },
    sokode_centre: {
      nom: "Sokodé & Tradition Kotokoli",
      description: "Deuxième métropole du Togo, capitale de la culture Tem et de la célèbre fête des couteaux Gadao-Adossa.",
      histoire: "Carrefour commercial et carrefour des pistes caravanières reliant le Sahel au golfe de Guinée, Sokodé est célèbre pour ses bâtisses islamiques historiques, ses tisserands traditionnels et la fête spectaculaire de Gadao-Adossa où les initiés défient le feu et les lames."
    },
    faille_aledjo: {
      nom: "La Faille d'Alédjo",
      description: "Impressionnante trouée routière taillée directement dans la montagne rocheuse de l'Atakora.",
      histoire: "Ouvrage spectaculaire creusé dans le roc pendant la période coloniale pour relier le Sud au Nord du Togo, la Faille d'Alédjo offre un panorama grandiose sur les crêtes de l'Atakora et symbolise la porte d'entrée héroïque vers la région de la Kara."
    },
    reserve_sarakawa: {
      nom: "Parc & Réserve de Sarakawa",
      description: "Réserve animalière réputée abritant girafes, zèbres, autruches et antilopes au pied des monts Kara.",
      histoire: "Situé à proximité de Kara, ce parc faunique réaménagé permet aux visiteurs d'approcher de grands mammifères de la savane africaine dans un paysage préservé de collines arborées."
    },
    forgerons_tchare: {
      nom: "Forgerons traditionnels de Tcharè",
      description: "Ateliers millénaires de forge sur pierre des artisans Kabyè au cœur du massif de la Kara.",
      histoire: "Sur les hauteurs des monts Kabyè, les forgerons de Tcharè perpétuent une technique de métallurgie précoloniale unique : ils battent le fer rouge à l'aide de lourdes pierres rondes de granit en guise de marteau et d'enclume, créant outils agricoles et parures rituelles."
    },
    reserve_oti_mandouri: {
      nom: "Réserve de Faune Oti-Mandouri",
      description: "Vaste réserve protégée de savane sahélienne bordée par la rivière Oti à l'extrême nord du Togo.",
      histoire: "Partie intégrante du grand complexe écologique transfrontalier WAPO, la réserve d'Oti-Mandouri protège une plaine inondable où se rassemblent troupeaux d'éléphants, buffles et hippopotames sous le ciel infini des savanes septentrionales."
    },
    peintures_namoundjoga: {
      nom: "Peintures Rupestres de Namoundjoga",
      description: "Sites d'art rupestre préhistorique gravés et peints sur les falaises de grès du grand Nord.",
      histoire: "Témoignage inestimable du peuplement préhistorique de l'Afrique de l'Ouest, les abris sous roche de Namoundjoga présentent des peintures ocres et des gravures rupestres représentant scènes de chasse, animaux sauvages et symboles cosmogoniques anciens."
    },
    grottes_de_nok: {
      nom: "Grottes et Greniers de Nok (Nano)",
      description: "Refuges troglodytiques fortifiés et greniers d'argile bâtis à flanc de falaise vertigineuse.",
      histoire: "Au XVIIIe et XIXe siècle, les populations Moba et Gourma ont aménagé des grottes inaccessibles dans la falaise de Nano pour se protéger des razzias. On y observe encore intacts des dizaines de greniers coniques en terre cuite suspendus au-dessus du vide."
    },
    dapaong_marche: {
      nom: "Dapaong & Pays Moba",
      description: "Capitale septentrionale du Togo, carrefour des cultures sahéliennes et de l'artisanat du cuir et du fer.",
      histoire: "Entourée de paysages de savane et de baobabs géants, Dapaong est le centre économique de la Région des Savanes. Son grand marché coloré est réputé pour les poteries traditionnelles, le beurre de karité pur et les épices du grand nord."
    }
  },
  en: {
    marche_fetiches_akodessewa: {
      nom: "Akodessawa Fetish Market",
      description: "The largest voodoo and traditional healing market in the world, located in Lomé.",
      histoire: "A true spiritual institution, the Akodessewa market brings together healers and voodoo priests from all over West Africa, offering authentic protective talismans and herbal remedies."
    },
    togoville_sanctuaire: {
      nom: "Togoville & Lake Togo",
      description: "Historic sacred town, birthplace of the country's name with ancient voodoo shrines and colonial cathedral.",
      histoire: "Located on the shores of Lake Togo, Togoville gave its name to the country after the 1884 treaty. It is a unique meeting point between animist traditions and historic Christianity."
    },
    aneho_cite_coloniale: {
      nom: "Aného (Historic Capital)",
      description: "Former colonial capital of Togo nestled between the Atlantic Ocean and the coastal lagoon.",
      histoire: "Capital of Togo from 1886 to 1897, Aného is a historic Guin-Mina town known for its colonial architecture and the sacred Glidji festival."
    },
    plage_de_lome: {
      nom: "Lomé Beach & Corniche",
      description: "The scenic golden coastline lined with coconut palms stretching right across the capital city.",
      histoire: "Lomé's beach is one of the rare oceanfronts located right in the heart of a capital. On weekends, traditional fishermen can be seen drawing their huge nets to rhythmic songs at sunset."
    },
    cascade_kpime: {
      nom: "Kpimé Waterfall",
      description: "Stunning tropical waterfall cascading through the lush green hills of Kpalimé.",
      histoire: "Located near Kpalimé, Kpimé Waterfall drops down rocky cliff faces surrounded by dense cocoa and fern groves, offering a cool revitalizing stop for hikers."
    },
    cascade_aklowa: {
      nom: "Aklowa Waterfall (Badou)",
      description: "Majestic 100-meter high mineral waterfall hidden in the pristine rainforest of Badou.",
      histoire: "One of the most impressive waterfalls in Togo, Aklowa rushes from a steep cliff. Local tradition attributes healing and purifying qualities to its clear waters."
    },
    notse_agbogbo: {
      nom: "Agbogbo Wall in Notsè",
      description: "Legendary remnants of the ancient fortified royal capital of the Ewé people.",
      histoire: "In the 15th century, Notsè was the capital of the Ewé kingdom under King Agokoli. The massive clay defensive walls remain a sacred symbol of ancestral heritage."
    },
    parc_fazao_malfakassa: {
      nom: "Fazao-Malfakassa National Park",
      description: "Togo's largest national park (192,000 ha), sanctuary for wild elephants, buffalos, and rugged hills.",
      histoire: "Located across the Atakora mountain range in the Central Region, this vast reserve protects pristine savannah forests and abundant African wildlife."
    },
    lac_de_nangbeto: {
      nom: "Nangbéto Lake & Dam",
      description: "Vast lake on the Mono River, home to wild hippos and rich birdlife.",
      histoire: "Formed by the hydroelectric dam on the Mono River, Lake Nangbéto is a haven for traditional canoe excursions and hippopotamus watching."
    },
    sokode_centre: {
      nom: "Sokodé & Tem Heritage",
      description: "Second largest city in Togo, heart of Tem culture and the famous Gadao-Adossa knife dance.",
      histoire: "A historic crossroads connecting the Sahel to the Gulf of Guinea, Sokodé is known for its traditional weavers and the spectacular Gadao festival."
    },
    faille_aledjo: {
      nom: "Alédjo Fault (Mountain Pass)",
      description: "Dramatic rocky road pass cut directly through the towering cliffs of the Atakora mountains.",
      histoire: "An engineering marvel carved into the rock to link North and South Togo, offering breathtaking mountain panoramas."
    },
    reserve_sarakawa: {
      nom: "Sarakawa Wildlife Reserve",
      description: "Renowned safari reserve featuring giraffes, zebras, and ostriches at the foot of the Kara mountains.",
      histoire: "Located near Kara, this protected park offers close encounters with large African mammals in a scenic landscape."
    },
    forgerons_tchare: {
      nom: "Traditional Blacksmiths of Tcharè",
      description: "Ancient stone-hammer iron forging workshops of the Kabyè people in the Kara mountains.",
      histoire: "In the Kabyè hills, blacksmiths preserve ancestral metallurgy by beating glowing iron using round granite stones as hammers and anvils."
    },
    reserve_oti_mandouri: {
      nom: "Oti-Mandouri Wildlife Reserve",
      description: "Vast protected savannah plain along the Oti River in northernmost Togo.",
      histoire: "Part of the WAPO international biosphere, this flood plain shelters elephant herds, buffalos, and hippos under endless northern skies."
    },
    peintures_namoundjoga: {
      nom: "Namoundjoga Rock Paintings",
      description: "Prehistoric rock art sites engraved and painted on the sandstone cliffs of the Far North.",
      histoire: "Invaluable witness of prehistoric West Africa, the Namoundjoga rock shelters feature ancient ochre paintings depicting wildlife and sacred symbols."
    },
    grottes_de_nok: {
      nom: "Nok Caves & Cliff Granaries (Nano)",
      description: "Cliffside troglodyte shelters and ancient clay granaries perched on dizzying canyon walls.",
      histoire: "In the 18th and 19th centuries, Moba and Gourma villagers built inaccessible shelters inside the Nano cliffs to protect themselves, leaving dozens of clay granaries suspended above the void."
    },
    dapaong_marche: {
      nom: "Dapaong & Moba Country",
      description: "Northern capital of Togo, crossroads of Sahelian trade and authentic leathercraft.",
      histoire: "Surrounded by giant baobabs, Dapaong is the vibrant hub of the Savanes Region, renowned for its lively craft market, shea butter, and spices."
    }
  }
};

const NEW_PLATS = {
  fr: {
    wagasi_togolais: {
      nom: "Wagasi (Fromage Peulh)",
      description: "Fromage artisanal doré à pâte ferme et croûte rouge naturelle, spécialité des pasteurs Peulhs.",
      histoire: "Fabriqué à partir de lait de vache frais caillé à l'aide d'un extrait végétal de Calotropis procera, le Wagasi est frit dans l'huile et consommé croustillant, souvent nappé d'une sauce tomate relevée ou ajouté aux plats de riz et de haricots.",
      accompagnementsIdaux: "Idéal avec de l'Ayimolou, des bananes plantains frites (Aloko) ou une sauce pimentée."
    },
    fetri_dessi: {
      nom: "Fétri Dessi (Sauce Gombo)",
      description: "Onctueuse sauce gombo mijotée à l'huile de palme rouge avec crabe, poissons fumés et crevettes.",
      histoire: "Le Fétri Dessi est l'un des joyaux du patrimoine culinaire togolais. La texture filante du gombo frais mariée aux fruits de mer de l'océan et à la rondeur de l'huile de palme en fait un plat d'honneur servi lors des grands déjeuners de famille.",
      accompagnementsIdaux: "Akoumé (pâte de maïs), Ewassa, ou Pâte de manioc."
    },
    to_sorgho_togolais: {
      nom: "Tô de Sorgho (Pâte du Nord)",
      description: "La pâte nourrissante de céréales nobles du Grand Nord togolais, à la texture dense et au goût toasté.",
      histoire: "Aliment de base des régions de la Kara et des Savanes, le Tô est confectionné à base de farine de sorgho ou de mil blanc battu dans une eau frémissante. Riche en minéraux, il a nourri des générations de cultivateurs et de guerriers de la savane.",
      accompagnementsIdaux: "Sauce gombo, sauce feuilles de baobab, ou sauce d'arachide relevée."
    },
    riz_gras_togolais: {
      nom: "Riz Gras au Poisson & Viande",
      description: "Riz délicatement parfumé mijoté dans un bouillon riche de tomates fraîches, légumes locaux et épices.",
      histoire: "Variante togolaise du grand riz ouest-africain, le Riz Gras togolais se distingue par l'utilisation de légumes locaux (choux, carottes, aubergines africaines) et son assaisonnement d'ail, de laurier et de piment vert écrasé.",
      accompagnementsIdaux: "Poulet frit, poisson braisé, piment noir et rondelles d'oignons."
    },
    soupe_poisson_togolaise: {
      nom: "Soupe de Poisson de Mer",
      description: "Bouillon marin épicé et parfumé aux poissons frais du littoral de Lomé et d'Aného.",
      histoire: "Préparée quotidiennement par les femmes des pêcheurs sur la côte, cette soupe pimentée utilise les poissons les plus frais (mérou, capitaine, daurade) mijotés avec du gingembre, de l'ail et du basilic africain (Tchayo).",
      accompagnementsIdaux: "Akoumé blanc, Ablo chaud ou pain croustillant."
    },
    hanvidokpome_aneho: {
      nom: "Hanvidokpomè (Porc au Four d'Aného)",
      description: "Rôti de porc mariné aux épices traditionnelles et cuit à l'étouffée, grande spécialité festive d'Aného.",
      histoire: "Originaire de la ville historique d'Aného, le Hanvidokpomè est le plat festif suprême lors des cérémonies de mariage et de la fête traditionnelle Epé-Ekpé. La viande est longuement marinée puis dorée au four jusqu'à ce qu'elle devienne tendre et parfumée.",
      accompagnementsIdaux: "Ablo, Kohm ou galettes de maïs avec sauce tomate épicée."
    },
    agbeli_togolais: {
      nom: "Agbeli (Manioc Pilé)",
      description: "Pâte élastique et soyeuse de manioc doux cuit à la vapeur puis pilé avec art.",
      histoire: "Très apprécié dans les régions du Sud et des Plateaux, l'Agbeli est une alternative légère au fufu d'igname. Sa texture gélatineuse et délicate capture parfaitement les sauces pimentées.",
      accompagnementsIdaux: "Sauce claire de poisson, sauce graine ou Adémè."
    },
    tchoukoutou_togolais: {
      nom: "Tchoukoutou (Bière de Sorgho)",
      description: "La bière artisanale traditionnelle à base de sorgho fermenté, servie fraîche dans une calebasse.",
      histoire: "Boisson emblématique du Nord Togo (particulièrement en pays Kabyè et Tamberma), le Tchoukoutou est préparé par un savoir-faire féminin séculaire de maltage et de fermentation. C'est la boisson du partage, de l'amitié et des rites initiatiques.",
      accompagnementsIdaux: "Se déguste lors des rassemblements entre amis ou après les travaux champêtres."
    },
    sodabi_togolais: {
      nom: "Sodabi Artisanal",
      description: "La célèbre eau-de-vie traditionnelle togolaise distillée à partir de sève pure de palmier.",
      histoire: "Surnommé la boisson des dieux, le Sodabi est obtenu par distillation du vin de palme fermenté. Présent dans toutes les libations et bénédictions traditionnelles, il est aussi préparé infusé d'écorces et de racines bienfaisantes.",
      accompagnementsIdaux: "À déguster en digestif ou lors des toasts traditionnels."
    }
  },
  en: {
    wagasi_togolais: {
      nom: "Wagasi (Fulani Cheese)",
      description: "Golden fried artisan cow-milk cheese with a natural red rind, specialty of Fulani pastoralists.",
      histoire: "Made from fresh cow milk curdled with natural Calotropis procera extract, Wagasi is fried until crispy and delicious, often served with seasoned tomato sauce or hearty rice dishes.",
      accompagnementsIdaux: "Great with Ayimolou, fried plantains, or spicy tomato dip."
    },
    fetri_dessi: {
      nom: "Fétri Dessi (Okra Stew)",
      description: "Rich and silky okra stew simmered in red palm oil with crab, smoked fish, and coastal prawns.",
      histoire: "A crown jewel of Togolese gastronomy, Fétri Dessi marries tender okra with rich Atlantic seafood for an unforgettable family feast.",
      accompagnementsIdaux: "Akoumé (corn fufu), Ewassa, or Cassava paste."
    },
    to_sorgho_togolais: {
      nom: "Tô (Sorghum & Millet Paste)",
      description: "Nutritious and earthy staple grain paste from Northern Togo, rich in traditional minerals.",
      histoire: "The foundational meal of the Kara and Savanes regions, Tô is beaten from wholesome sorghum flour in simmering water, fueling farmers across generations.",
      accompagnementsIdaux: "Okra soup, baobab leaf sauce, or rich peanut stew."
    },
    riz_gras_togolais: {
      nom: "Togolese Jollof Rice (Riz Gras)",
      description: "Fragrant rice slowly simmered in a savory broth of fresh tomatoes, local vegetables, and spices.",
      histoire: "The Togolese take on seasoned rice stands out with garden vegetables (cabbage, carrots, African eggplant) and a fragrant seasoning of garlic, ginger, and green pepper.",
      accompagnementsIdaux: "Fried chicken, grilled fish, and spicy shito pepper."
    },
    soupe_poisson_togolaise: {
      nom: "Coastal Fish Soup",
      description: "Spicy aromatic broth packed with freshly caught Atlantic fish from Lomé and Aného.",
      histoire: "Prepared daily by coastal fishermen's families, this fragrant fish soup uses grouper and captain fish simmered with ginger, garlic, and fresh African basil.",
      accompagnementsIdaux: "Hot Ablo, white Akoumé, or crusty bread."
    },
    hanvidokpome_aneho: {
      nom: "Hanvidokpomè (Aného Roast Pork)",
      description: "Festive slow-roasted spiced pork, the historical signature dish of Aného.",
      histoire: "From the historic town of Aného, Hanvidokpomè is the ultimate celebratory meal during Epé-Ekpé festivities, marinated in heritage spices and roasted to tender perfection.",
      accompagnementsIdaux: "Ablo, Kohm, or corn cakes with seasoned tomato relish."
    },
    agbeli_togolais: {
      nom: "Agbeli (Pounded Cassava)",
      description: "Silky, stretchy steamed cassava fufu delicately pounded in a wooden mortar.",
      histoire: "Beloved in the southern Plateaux, Agbeli is a lighter alternative to yam fufu, perfectly paired with rich aromatic soups.",
      accompagnementsIdaux: "Clear fish stew, palm nut soup, or Adémè sauce."
    },
    tchoukoutou_togolais: {
      nom: "Tchoukoutou (Sorghum Craft Beer)",
      description: "Traditional cloudy fermented sorghum beer served chilled in a natural calabash gourd.",
      histoire: "The iconic drink of North Togo, brewed through ancient female knowledge of grain malting and open-pot fermentation for friendship and sacred ceremonies.",
      accompagnementsIdaux: "Shared among friends in traditional calabash bowls."
    },
    sodabi_togolais: {
      nom: "Artisanal Sodabi",
      description: "Famous heritage palm spirit distilled from pure fermented oil-palm sap.",
      histoire: "Celebrated as the nectar of the ancestors, Sodabi is present in every traditional blessing and gathering, often infused with healing botanicals.",
      accompagnementsIdaux: "Enjoyed as a celebratory toast or traditional digestif."
    }
  }
};

const locales = ['fr', 'en', 'es', 'zh'];

for (const loc of locales) {
  const filePath = path.join(process.cwd(), 'messages', `${loc}.json`);
  if (!fs.existsSync(filePath)) continue;
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const monSource = NEW_MONUMENTS[loc] || NEW_MONUMENTS.fr;
  const platSource = NEW_PLATS[loc] || NEW_PLATS.fr;

  json.Monuments = json.Monuments || {};
  json.Plats = json.Plats || {};

  for (const [k, v] of Object.entries(monSource)) {
    json.Monuments[k] = v;
  }

  for (const [k, v] of Object.entries(platSource)) {
    json.Plats[k] = v;
  }

  fs.writeFileSync(filePath, JSON.stringify(json, null, 4), 'utf8');
  console.log(`✓ Updated ${loc}.json with ${Object.keys(monSource).length} monuments & ${Object.keys(platSource).length} plats`);
}
