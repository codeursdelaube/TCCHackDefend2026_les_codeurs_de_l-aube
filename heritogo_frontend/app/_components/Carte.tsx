"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// 🚨 INDISPENSABLE : Importer les styles CSS de Leaflet pour éviter que la carte soit invisible ou éclatée
import "leaflet/dist/leaflet.css";
import { Monument } from "../LieuxT/site";

// 🚨 INDISPENSABLE : Recréer l'icône de l'épingle car Next.js perd les chemins des images Leaflet au build
const iconeMonument = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface CarteProps {
  monumentsList: Monument[]; // ✅ Correction : C'est un tableau de monuments (Monument[])
}

export default function Carte({ monumentsList }: CarteProps) {
  // ✅ Demande : Centrer systématiquement et précisément la position de départ sur Lomé
  const positionCentre: [number, number] = [8.6195,  1.1518];

  return (
    /* 🚨 CONTRAINTE TAILWIND CRITIQUE : 
       La div parente DOIT obligatoirement avoir une hauteur fixe (ici h-[350px]).
       Sans cela, Leaflet prend une hauteur de 0px et la carte reste invisible ! */
    <div className="w-full h-125 relative z-0 rounded-2xl overflow-hidden border border-base-content/10 shadow-inner bg-base-300">
      <MapContainer
        center={positionCentre}
        zoom={monumentsList?.length === 1 ? 7 : 12} // Zoom plus immersif (15) s'il s'agit d'un seul monument ciblé
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {monumentsList &&
          monumentsList.map((site) => (
            <Marker
              key={site.id}
              position={[site.lat, site.lng]}
              icon={iconeMonument}
            >
              <Popup>
                <div className="p-1 text-slate-800">
                  <p className="font-bold text-sm mb-0.5">{site.nom}</p>
                  <p className="text-xs text-amber-600 font-semibold italic">
                    {site.localite} — Région {site.région}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}