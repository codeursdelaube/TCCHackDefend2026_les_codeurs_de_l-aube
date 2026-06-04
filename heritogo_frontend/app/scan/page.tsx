'use client'

import { useState, useRef, useEffect, useActionState, startTransition } from 'react'
import { Camera, Upload, Sparkles, Loader2, Volume2, VolumeX, MapPin, Globe, RefreshCw } from 'lucide-react'
import Image from 'next/image'

interface PredictionResult {
  prediction_status: string;
  data: {
    monument: string;
    histoire: string;
    latitude: number;
    longitude: number;
    source: string;
  };
}

export default function ScanPage() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const [selectedLang, setSelectedLang] = useState<string>('fr-FR')
  
  // 🆕 État pour stocker la position GPS en temps réel du touriste
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null)

  // 🆕 Récupération automatique du GPS au chargement de l'application
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude,
          })
        },
        (err) => console.log("GPS indisponible ou refusé :", err.message)
      )
    }
  }, [])

  useEffect(() => {
    return () => { window.speechSynthesis.cancel() }
  }, [result])

  const [error, submitScanAction, loading] = useActionState(
    async (previousState: unknown, formData: FormData) => {
      try {
        const res = await fetch('/api/scan', { method: 'POST', body: formData })
        const data = await res.json()
        
        if (res.ok) {
          // 🔴 LE FIX CRUCIAL : Si le backend a répondu "unknown" (ex: chaussure), on l'intercepte comme une erreur visuelle
          if (data.prediction_status === 'unknown') {
            setResult(null) // On nettoie un éventuel ancien résultat valide
            return data.detail || "Ce monument ou objet n'est pas répertorié dans la base officielle HeriTogo."
          }

          setResult(data)
          return null
        } else {
          return data.error || "Une erreur est survenue lors de l'analyse."
        }
      } catch (err) {
        console.error(err)
        return "Impossible de joindre le serveur ou le service Gemini."
      }
    },
    null
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleScanClick = () => {
    if (!image) return
    const formData = new FormData()
    formData.append('image', image)
    
    // 🆕 Si le GPS est disponible, on l'injecte pour activer le Bouclier 1 du Backend
    if (userLocation) {
      formData.append('lat', userLocation.lat.toString())
      formData.append('long', userLocation.long.toString())
    }

    startTransition(() => { submitScanAction(formData) })
  }

  const toggleSpeech = () => {
    if (!result?.data?.histoire) return
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      window.speechSynthesis.cancel()
      let texteALire = `${result.data.monument}. ${result.data.histoire}`
      if (selectedLang === 'en-US') texteALire = `Translation coming soon. Title: ${result.data.monument}`
      else if (selectedLang === 'es-ES') texteALire = `Traducción disponible pronto. Título: ${result.data.monument}`
      const utterance = new SpeechSynthesisUtterance(texteALire)
      utterance.lang = selectedLang
      utterance.rate = 0.95
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  const resetScanner = () => {
    setPreview(null); setImage(null); setResult(null)
    window.speechSynthesis.cancel(); setIsSpeaking(false)
  }

  return (
    <main className="relative min-h-screen w-full bg-base-100 text-base-content
                    pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">

      {/* Halos décoratifs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-125 h-125
                     bg-green-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-12 right-10 w-75 h-75
                     bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col justify-center h-full">

        {/* Titre */}
        <h1 className="text-3xl md:text-4xl font-black text-center mb-2
                       tracking-wide uppercase flex items-center justify-center gap-3
                       text-base-content">
          <Sparkles className="text-amber-400 animate-pulse h-7 w-7" />
          <span>
            Scanner{' '}
            <span className="text-green-500">Herito</span>
            <span className="text-amber-500">go</span>
          </span>
        </h1>

        <p className="text-center text-sm text-base-content/50 mb-8 max-w-md mx-auto">
          Prenez une photo ou importez un fichier pour identifier instantanément
          les richesses culturelles et monuments du Togo.
        </p>

        {/* Zone upload / aperçu */}
        <div className="bg-base-200 border-2 border-dashed border-base-content/20
                        hover:border-green-500/40 rounded-3xl p-6 md:p-8
                        flex flex-col items-center justify-center min-h-80
                        relative overflow-hidden backdrop-blur-xl transition-all shadow-2xl">
          {preview ? (
            <div className="w-full flex flex-col items-center">
              <div className="relative w-full max-h-72 h-64 rounded-2xl overflow-hidden
                              mb-4 border border-base-content/10 shadow-inner">
                <Image
                  src={preview}
                  alt="Aperçu du monument"
                  fill
                  className="object-contain bg-base-300/40"
                />
              </div>
              <button
                onClick={resetScanner}
                className="btn btn-ghost btn-xs text-error hover:bg-error/10
                           rounded-full gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                {" Changer d'image"}
              </button>
            </div>
          ) : (
            <div className="text-center flex flex-col items-center gap-5 py-4">
              <div className="p-5 bg-linear-to-br from-green-500/20 to-emerald-500/10
                              text-green-500 rounded-full border border-green-500/20
                              shadow-lg shadow-green-500/5">
                <Camera size={44} className="stroke-[1.5]" />
              </div>
              <div>
                <p className="font-semibold text-lg text-base-content">
                  Sélectionnez votre capture
                </p>
                <p className="text-xs text-base-content/50 mt-1 max-w-xs mx-auto">
                  {"Compatible avec l'appareil photo en direct et les images de votre galerie."}
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary rounded-full px-6 border-none
                           bg-linear-to-r from-green-500 to-emerald-600
                           hover:scale-105 text-white font-bold transition-all shadow-lg"
              >
                <Upload size={16} />
                {" Ouvrir l'appareil / Galerie"}
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* 🔴 Section d'affichage des erreurs (S'activera magnifiquement pour la chaussure maintenant !) */}
        {error && (
          <div className="alert alert-error mt-4 rounded-2xl
                          bg-error/10 border border-error/20
                          text-error text-sm font-semibold p-4">
            <span>{error}</span>
          </div>
        )}

        {/* Bouton lancer l'IA */}
        {preview && !result && (
          <button
            onClick={handleScanClick}
            disabled={loading}
            className="mt-6 w-full btn btn-lg rounded-2xl border-none
                       bg-linear-to-r from-green-500 via-emerald-500 to-amber-500
                       text-white font-black shadow-xl hover:opacity-95 transition
                       disabled:bg-base-content/10 disabled:text-base-content/30"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Analyse par IA
              </>
            ) : (
              <>
                <Sparkles size={18} className="animate-pulse text-amber-300" />
                Identifier le monument
              </>
            )}
          </button>
        )}

        {/* Résultats */}
        {result?.data && (
          <div className="mt-8 p-6 bg-base-200 border border-base-content/10
                          rounded-3xl shadow-2xl animate-fade-in">

            {/* En-tête résultat + TTS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between
                            gap-4 mb-4 pb-4 border-b border-base-content/5">
              <h2 className="text-xl md:text-2xl font-black text-base-content
                             flex items-center gap-2">
                <Sparkles className='text-amber-500'/>
                 {result.data.monument}
              </h2>

              {/* Contrôleur TTS */}
              <div className="flex items-center gap-1.5 bg-base-300
                              border border-base-content/10 p-1 rounded-xl
                              shadow-inner self-start sm:self-auto">
                <select
                  value={selectedLang}
                  onChange={(e) => {
                    setSelectedLang(e.target.value)
                    if (isSpeaking) {
                      window.speechSynthesis.cancel()
                      setIsSpeaking(false)
                    }
                  }}
                  className="text-xs font-bold text-base-content bg-transparent
                             px-2 py-1.5 outline-none cursor-pointer rounded-lg
                             hover:bg-base-content/5"
                >
                  <option value="fr-FR">🇲🇬 FR</option>
                  <option value="en-US">🇺🇸 EN</option>
                  <option value="es-ES">🇪🇸 ES</option>
                </select>

                <button
                  onClick={toggleSpeech}
                  className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSpeaking
                      ? 'bg-error/20 text-error hover:bg-error/30'
                      : 'bg-green-600 text-white hover:bg-green-500'
                  }`}
                  title={isSpeaking ? "Arrêter la lecture" : "Écouter l'histoire"}
                >
                  {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>
            </div>

            {/* Histoire */}
            <p className="text-base-content/70 text-sm leading-relaxed
                          whitespace-pre-line font-medium
                          bg-base-300 p-4 rounded-2xl
                          border border-base-content/5 shadow-inner mb-4">
              {result.data.histoire}
            </p>

            {/* Badges GPS */}
            <div className="flex flex-wrap gap-2 mt-4 text-xs">
              {result.data.latitude && result.data.longitude && (
                <span className="flex items-center gap-1.5
                                 bg-base-300 border border-base-content/10
                                 px-3 py-1.5 rounded-full
                                 text-base-content/70 font-semibold">
                  <MapPin size={14} className="text-error" />
                  {Number(result.data.latitude).toFixed(4)},{' '}
                  {Number(result.data.longitude).toFixed(4)}
                </span>
              )}
            </div>

          </div>
        )}
      </div>
    </main>
  )
}