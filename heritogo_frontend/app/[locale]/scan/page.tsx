'use client'

import { useState, useRef, useEffect, useActionState, startTransition } from 'react'
import { Camera, Upload, Sparkles, Loader2, Volume2, VolumeX, MapPin, RefreshCw, Speaker } from 'lucide-react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'

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
  const t = useTranslations('Scan')
  const locale = useLocale()
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const [selectedLang, setSelectedLang] = useState<string>('fr')
  const [translatedText, setTranslatedText] = useState<Record<string, string>>({})
  const [isTranslating, setIsTranslating] = useState<boolean>(false)
  
  // État pour stocker la position GPS en temps réel du touriste
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null)

  // Récupération automatique du GPS au chargement de l'application
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

  // Sync selected language with current page locale
  useEffect(() => {
    if (locale === 'fr') setSelectedLang('fr')
    else if (locale === 'en') setSelectedLang('en')
    else if (locale === 'es') setSelectedLang('es')
    else if (locale === 'zh') setSelectedLang('zh')
  }, [locale])

  useEffect(() => {
    return () => { window.speechSynthesis.cancel() }
  }, [result])

  const [error, submitScanAction, loading] = useActionState(
    async (previousState: unknown, formData: FormData) => {
      try {
        const res = await fetch('/api/scan', { method: 'POST', body: formData })
        const data = await res.json()
        
        if (res.ok) {
          // Si le backend a répondu "unknown" (ex: chaussure), on l'intercepte
          if (data.prediction_status === 'unknown') {
            setResult(null) // On nettoie un éventuel ancien résultat valide
            setTranslatedText({})
            return data.detail || t('errors.unknown')
          }

          setResult(data)
          setTranslatedText({ fr: data.data.histoire })
          return null
        } else {
          return data.error || t('errors.general')
        }
      } catch (err) {
        console.error(err)
        return t('errors.server')
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
      setTranslatedText({})
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleScanClick = () => {
    if (!image) return
    const formData = new FormData()
    formData.append('image', image)
    
    // Si le GPS est disponible, on l'injecte pour activer le Bouclier 1 du Backend
    if (userLocation) {
      formData.append('lat', userLocation.lat.toString())
      formData.append('long', userLocation.long.toString())
    }

    startTransition(() => { submitScanAction(formData) })
  }

  const translateText = async (text: string, targetLang: string) => {
    if (translatedText[targetLang]) {
      return translatedText[targetLang]
    }

    setIsTranslating(true)
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      )
      const data = await response.json()
      const translated = data[0].map((item: any) => item[0]).join('')
      setTranslatedText(prev => ({ ...prev, [targetLang]: translated }))
      return translated
    } catch (error) {
      console.error('Translation error:', error)
      return text
    } finally {
      setIsTranslating(false)
    }
  }

  const handleLangChange = async (lang: string) => {
    setSelectedLang(lang)
    if (result?.data?.histoire && !translatedText[lang] && lang !== 'fr') {
      await translateText(result.data.histoire, lang)
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const toggleSpeech = () => {
    if (!result?.data?.histoire) return
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      window.speechSynthesis.cancel()
      
      const currentText = selectedLang === 'fr' 
        ? result.data.histoire 
        : translatedText[selectedLang] || result.data.histoire
      
      const langMap: Record<string, string> = {
        'fr': 'fr-FR',
        'en': 'en-US',
        'es': 'es-ES',
        'zh': 'zh-CN'
      }
      
      const utterance = new SpeechSynthesisUtterance(currentText)
      utterance.lang = langMap[selectedLang]
      utterance.rate = 0.95
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  const resetScanner = () => {
    setPreview(null); setImage(null); setResult(null); setTranslatedText({})
    window.speechSynthesis.cancel(); setIsSpeaking(false)
  }

  const getCurrentText = () => {
    if (!result?.data?.histoire) return ''
    return selectedLang === 'fr' 
      ? result.data.histoire 
      : translatedText[selectedLang] || result.data.histoire
  }

  return (
    <main className="relative min-h-screen w-full bg-base-100 text-base-content
                    pt-20 pb-24 px-4 sm:px-6 lg:px-8 overflow-x-hidden">

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
          <span>
            {t('title').split(' ')[0]}{' '}
            <span className="text-green-500">Herito</span>
            <span className="text-amber-500">go</span>
          </span>
        </h1>

        <p className="text-center text-sm text-base-content/50 mb-8 max-w-md mx-auto">
          {t('subtitle')}
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
                  alt={t('select_capture')}
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
                {t('change_image')}
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
                  {t('select_capture')}
                </p>
                <p className="text-xs text-base-content/50 mt-1 max-w-xs mx-auto">
                  {t('compatible_info')}
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary rounded-full px-6 border-none
                           bg-linear-to-r from-green-500 to-emerald-600
                           hover:scale-105 text-white font-bold transition-all shadow-lg"
              >
                <Upload size={16} />
                {t('open_gallery')}
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

        {/* Section d'affichage des erreurs */}
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
                {t('analyzing')}
              </>
            ) : (
              <>
                <Sparkles size={18} className="animate-pulse text-amber-300" />
                {t('identify')}
              </>
            )}
          </button>
        )}

        {/* Résultats */}
        {result?.data && (
          <div className="mt-8 p-6 bg-base-200 border border-base-content/10
                          rounded-3xl shadow-2xl animate-fade-in">

            {/* En-tête résultat */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between
                            gap-4 mb-4 pb-4 border-b border-base-content/5">
              <h2 className="text-xl md:text-2xl font-black text-base-content
                             flex items-center gap-2">
                 {result.data.monument}
              </h2>
            </div>

            {/* Onglets de langue et TTS */}
            <div className="flex items-center gap-2 mb-4">
              {['fr', 'en', 'es', 'zh'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLangChange(lang)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    selectedLang === lang
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : 'bg-base-300 text-base-content/70 hover:bg-base-content/10'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
              
              {/* Bouton TTS */}
              <button
                onClick={toggleSpeech}
                className={`ml-auto p-2 rounded-full transition-all duration-200 ${
                  isSpeaking
                    ? 'bg-amber-500 text-white animate-pulse shadow-lg shadow-amber-500/30'
                    : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20'
                }`}
                title={isSpeaking ? t('tts_stop') : t('tts_play')}
              >
                {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>

            {/* Histoire avec TTS */}
            <div className="relative">
              <div className="bg-base-300 p-4 rounded-2xl
                          border border-base-content/5 shadow-inner mb-4 pr-12">
                {isTranslating ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin h-6 w-6 text-green-500" />
                  </div>
                ) : (
                  <p className="text-base-content/70 text-sm leading-relaxed
                                whitespace-pre-line font-medium">
                    {getCurrentText()}
                  </p>
                )}
              </div>

             
            </div>

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