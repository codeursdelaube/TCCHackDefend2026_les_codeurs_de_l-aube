"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import "leaflet/dist/leaflet.css";
import { Monument } from "../LieuxT/site";

// Création d'épingles personnalisées élégantes aux couleurs de la palette Café (Expresso, Caramel, Crema)
function createCoffeePin(pinColor: string, dotColor: string) {
  return L.divIcon({
    className: "coffee-map-pin",
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        background-color: ${pinColor};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #FFFFFF;
        box-shadow: 0 4px 12px rgba(42, 28, 20, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: ${dotColor};
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

const pinExpresso = createCoffeePin("#3B2519", "#C99A3E"); // Maritime / Lomé
const pinCaramel  = createCoffeePin("#A9754A", "#FDFBF8"); // Plateaux / Kpalimé
const pinCrema    = createCoffeePin("#C99A3E", "#3B2519"); // Kara / Savanes / Centrale

interface CarteProps {
  monumentsList: Monument[];
}

export default function Carte({ monumentsList }: CarteProps) {
  const tMonuments = useTranslations('Monuments');
  
  const isSingle = monumentsList?.length === 1;
  const positionCentre: [number, number] = useMemo(() => {
    if (isSingle && monumentsList[0]) {
      return [monumentsList[0].lat, monumentsList[0].lng];
    }
    return [8.6195, 1.1518]; // Centre Togo
  }, [isSingle, monumentsList]);

  const zoomLevel = isSingle ? 13 : 7;

  const getPinByRegion = (region: string) => {
    if (region === 'Maritime') return pinExpresso;
    if (region === 'Plateaux') return pinCaramel;
    return pinCrema;
  };

  return (
    <div className={`w-full ${isSingle ? 'h-64 sm:h-72' : 'h-125'} relative z-0 rounded-[32px] overflow-hidden border border-border shadow-md bg-base-300`}>
      <MapContainer
        center={positionCentre}
        zoom={zoomLevel}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {monumentsList &&
          monumentsList.map((site) => {
            const siteNom = tMonuments(`${site.id}.nom`);
            const siteDesc = tMonuments(`${site.id}.description`);
            const pinIcon = getPinByRegion(site.région);

            return (
              <Marker
                key={site.id}
                position={[site.lat, site.lng]}
                icon={pinIcon}
              >
                <Popup className="custom-coffee-popup">
                  <div className="p-1.5 max-w-[200px] text-stone-900 font-sans">
                    <span className="inline-block rounded-md bg-[#3B2519] px-2 py-0.5 text-[9px] font-black uppercase text-[#FDFBF8] mb-1">
                      {site.région}
                    </span>
                    <p className="font-bold text-sm leading-tight text-[#2A1C14] mb-1">{siteNom}</p>
                    <p className="text-[11px] text-[#A9754A] font-semibold mb-2">
                      📍 {site.localite}
                    </p>
                    <p className="line-clamp-2 text-[10px] text-stone-600 mb-2">
                      {siteDesc}
                    </p>
                    <Link
                      href={`/lieux/${site.id}`}
                      className="inline-block w-full text-center rounded-lg bg-[#3B2519] py-1 text-[10px] font-bold text-white transition-opacity hover:opacity-90"
                    >
                      Découvrir →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}