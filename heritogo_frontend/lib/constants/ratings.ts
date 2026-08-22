export const SITE_RATINGS: Record<string, { rating: number; count: number }> = {
  // Maritime
  grand_marche_lome:          { rating: 4.8, count: 412 },
  cathedrale_lome:            { rating: 4.7, count: 298 },
  statue_amitie_germano:      { rating: 4.5, count: 187 },
  maison_des_esclaves:        { rating: 4.9, count: 376 },
  monument_independance:      { rating: 4.6, count: 245 },
  musee_de_lome:              { rating: 4.4, count: 203 },
  palais_de_lome:             { rating: 4.9, count: 489 },
  village_artisanal:          { rating: 4.6, count: 198 },
  marche_fetiches_akodessewa: { rating: 4.8, count: 520 },
  togoville_sanctuaire:       { rating: 4.7, count: 310 },
  aneho_cite_coloniale:       { rating: 4.6, count: 230 },
  plage_de_lome:              { rating: 4.8, count: 640 },

  // Plateaux
  kpalime:                    { rating: 4.9, count: 463 },
  chateau_vial:               { rating: 4.7, count: 234 },
  cascade_yikpa:              { rating: 4.8, count: 387 },
  cascade_kpime:              { rating: 4.7, count: 290 },
  cascade_aklowa:             { rating: 4.9, count: 345 },
  notse_agbogbo:              { rating: 4.6, count: 180 },

  // Centrale
  parc_fazao_malfakassa:      { rating: 4.8, count: 275 },
  lac_de_nangbeto:            { rating: 4.6, count: 195 },
  sokode_centre:              { rating: 4.5, count: 210 },

  // Kara
  koutamakou:                 { rating: 5.0, count: 720 },
  faille_aledjo:              { rating: 4.8, count: 380 },
  reserve_sarakawa:           { rating: 4.7, count: 310 },
  forgerons_tchare:           { rating: 4.9, count: 260 },

  // Savanes
  reserve_oti_mandouri:       { rating: 4.7, count: 190 },
  peintures_namoundjoga:      { rating: 4.8, count: 215 },
  grottes_de_nok:             { rating: 4.9, count: 340 },
  dapaong_marche:             { rating: 4.5, count: 175 },
};

export function getSiteRating(id: string): { rating: number; count: number } {
  return SITE_RATINGS[id] || { rating: 4.6, count: 120 };
}
