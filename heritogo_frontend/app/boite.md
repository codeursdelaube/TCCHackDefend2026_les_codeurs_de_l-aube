"use client";

import { useState, useEffect } from "react";
import { Phone, MapPin, Building, Loader2 } from "lucide-react";

interface Hotel {
  id: string;
  nom: string;
  tarif_nuit: number;
  localisation: string;
  telephone: string;
  distance: number;
}

interface HotelsProchesProps {
  latitude: number;
  longitude: number;
}

export default function HotelsProches({ latitude, longitude }: HotelsProchesProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState`<boolean>`(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHotels() {
      try {
        setLoading(true);
        // Appel à votre backend FastAPI (Haversine < 5km)
        const res = await fetch(
          `http://localhost:8000/api/hotels/proches?lat=${latitude}&lon=${longitude}`
        );

    if (!res.ok) throw new Error("Impossible de charger les hôtels à proximité.");

    const data = await res.json();
        setHotels(data);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    }

    if (latitude && longitude) {
      fetchHotels();
    }
  }, [latitude, longitude]);

  if (loading) {
    return (
      `<div className="flex flex-col items-center justify-center py-12 gap-3">`
        `<Loader2 className="h-8 w-8 text-green-500 animate-spin" />`
        `<p className="text-sm text-base-content/50">`Recherche des hébergements à moins de 5km...`</p>`
      `</div>`
    );
  }

  if (error) {
    return (
      `<p className="text-sm text-error/70 italic text-center py-6">`
        Sélection des offres momentanément indisponible.
      `</p>`
    );
  }

  if (hotels.length === 0) {
    return (
      `<div className="text-center py-10 bg-base-200/50 rounded-2xl border border-base-content/5">`
        `<Building className="mx-auto h-8 w-8 text-base-content/20 mb-2" />`
        `<p className="text-sm text-base-content/50 italic">`
          Aucun hôtel référencé à moins de 5 km de ce site.
        `</p>`
      `</div>`
    );
  }

  return (
    `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`
      {hotels.map((hotel) => (
        `<div 
          key={hotel.id}
          className="bg-base-200 border border-base-content/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
        >`
          `<div>`
            `<div className="flex justify-between items-start gap-2 mb-2">`
              `<h4 className="font-bold text-base-content text-md tracking-wide line-clamp-1">`
                {hotel.nom}
              `</h4>`
              `<span className="badge bg-green-500/10 text-green-500 border-none text-[10px] font-bold px-2.5 py-1 shrink-0">`
                à {hotel.distance.toFixed(1)} km
            
            `</div>`

    `<p className="inline-flex items-center gap-1 text-xs text-base-content/60 mb-4">`
              <MapPin size={12} className="text-amber-500" />
              `<span className="line-clamp-1">`{hotel.localisation}
            `</p>`
          `</div>`

    `<div className="pt-3 border-t border-base-content/5 flex justify-between items-center mt-4">`
            `<div>`
              `<span className="text-xl font-black text-base-content">`
                {hotel.tarif_nuit.toLocaleString('fr-FR')} F CFA
            
              `<span className="text-[10px] text-base-content/40 block font-medium uppercase tracking-wider">`
                Par nuitée
            
            `</div>`

    <a
              href={`tel:${hotel.telephone}`}
              className="btn btn-sm rounded-xl border-none bg-base-content/5 hover:bg-green-500 hover:text-white text-base-content/70 transition-all duration-300 gap-1"
            >
              `<Phone size={12} />`
              Appeler
            `</a>`
          `</div>`
        `</div>`
      ))}
    `</div>`
  );
}
