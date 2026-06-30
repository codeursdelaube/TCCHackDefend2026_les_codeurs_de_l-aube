'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, Loader2, MapPin, RefreshCw, Sparkles, Upload, AlertTriangle, ShieldCheck, CreditCard, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { COLORS } from '@/lib/constants/colors'
import TextToSpeech from '@/components/TextToSpeech'
import { getUserFriendlyError } from '@/lib/utils/errors'


interface PredictionResult {
  prediction_status: string
  data: {
    monument: string
    histoire: string
    latitude: number
    longitude: number
    source: string
  }
}

type GoogleTranslateItem = [string]

const languageCodes = ['fr', 'en', 'es', 'zh'] as const
type LanguageCode = (typeof languageCodes)[number]

export default function ScanPage() {
  const t = useTranslations('Scan')
  const locale = useLocale()
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(() => languageCodes.includes(locale as LanguageCode) ? (locale as LanguageCode) : 'fr')
  const [translatedText, setTranslatedText] = useState<Partial<Record<LanguageCode, string>>>({})
  const [isTranslating, setIsTranslating] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Paywall & Limit States
  const [scanCount, setScanCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    const date = new Date()
    const currentMonth = `${date.getFullYear()}-${date.getMonth() + 1}`
    const savedMonth = localStorage.getItem('heritogo_scan_month')

    let count = 0
    if (savedMonth !== currentMonth) {
      localStorage.setItem('heritogo_scan_month', currentMonth)
      localStorage.setItem('heritogo_scan_count', '0')
      count = 0
    } else {
      count = parseInt(localStorage.getItem('heritogo_scan_count') || '0', 10)
    }
    return count
  })
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('heritogo_premium') === 'true'
  })
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => setUserLocation({ lat: position.coords.latitude, long: position.coords.longitude }),
      () => setUserLocation(null),
    )
  }, [])

  useEffect(() => {
    return () => window.speechSynthesis.cancel()
  }, [result])

  // Hook triggered when a prediction is successful to save count & history
  useEffect(() => {
    if (result && result.data) {
      // 1. Incrémenter le compteur
      const currentCount = parseInt(localStorage.getItem('heritogo_scan_count') || '0', 10)
      const newCount = currentCount + 1
      localStorage.setItem('heritogo_scan_count', newCount.toString())
      setScanCount(newCount)

      // 2. Enregistrer dans l'historique
      const historyRaw = localStorage.getItem('heritogo_scans')
      const history = historyRaw ? JSON.parse(historyRaw) : []
      const newScan = {
        monument: result.data.monument,
        histoire: result.data.histoire,
        date: new Date().toISOString(),
        localite: userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.long.toFixed(4)}` : 'Lomé, Togo'
      }
      localStorage.setItem('heritogo_scans', JSON.stringify([newScan, ...history]))
    }
  }, [result])

  const [error, submitScanAction, loading] = useActionState<string | null, FormData>(
    async (_previousState, formData) => {
      try {
        const response = await fetch('/api/scan', { method: 'POST', body: formData })
        const data = await response.json()

        if (!response.ok) return data.error || t('errors.general')
        if (data.prediction_status === 'unknown') {
          setResult(null)
          setTranslatedText({})
          return data.detail || t('errors.unknown')
        }

        setResult(data)
        setTranslatedText({ fr: data.data.histoire })
        return null
      } catch (scanError: unknown) {
        console.error(scanError)
        return getUserFriendlyError(scanError)
      }
    },
    null,
  )

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setTranslatedText({})
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const handleScanClick = () => {
    if (!image) return

    // Vérifier la limite gratuite
    if (!isPremium && scanCount >= 3) {
      setShowPaywall(true)
      return
    }

    const formData = new FormData()
    formData.append('image', image)
    if (userLocation) {
      formData.append('lat', userLocation.lat.toString())
      formData.append('long', userLocation.long.toString())
    }
    startTransition(() => submitScanAction(formData))
  }

  const translateText = async (text: string, targetLang: LanguageCode) => {
    if (translatedText[targetLang]) return translatedText[targetLang]
    setIsTranslating(true)
    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`)
      const data: [GoogleTranslateItem[]] = await response.json()
      const translated = data[0].map((item) => item[0]).join('')
      setTranslatedText((current) => ({ ...current, [targetLang]: translated }))
      return translated
    } catch (translateError) {
      console.error(translateError)
      return text
    } finally {
      setIsTranslating(false)
    }
  }

  const handleLangChange = async (lang: LanguageCode) => {
    setSelectedLang(lang)
    if (result?.data.histoire && lang !== 'fr') await translateText(result.data.histoire, lang)
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const getCurrentText = () => {
    if (!result?.data.histoire) return ''
    return selectedLang === 'fr' ? result.data.histoire : translatedText[selectedLang] || result.data.histoire
  }

  const toggleSpeech = () => {
    if (!result?.data.histoire) return
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const langMap: Record<LanguageCode, string> = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', zh: 'zh-CN' }
    const utterance = new SpeechSynthesisUtterance(getCurrentText())
    utterance.lang = langMap[selectedLang]
    utterance.rate = 0.95
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  const resetScanner = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setImage(null)
    setResult(null)
    setTranslatedText({})
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const handleActivatePremium = () => {
    localStorage.setItem('heritogo_premium', 'true')
    setIsPremium(true)
    setShowPaywall(false)
  }

  return (
    <main className="min-h-screen bg-base-100 px-4 pb-28 pt-20 text-base-content sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        
        {/* Left Control Card */}
        <div className="rounded-[32px] border border-border bg-base-200 p-5 shadow-sm sm:p-7">
          <div className="flex justify-between items-center mb-5">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-[11px] font-black uppercase tracking-wide text-secondary-content">
              <Sparkles className="h-4 w-4" />
              {userLocation ? t('gps_available') : t('select_capture')}
            </div>

            {/* Quota Indicator */}
            {isPremium ? (
              <span className="badge bg-amber-500 text-white font-extrabold gap-1 border-none py-3 px-3 rounded-xl text-[10px] uppercase shadow-sm">
                ✨ Premium Actif
              </span>
            ) : (
              <span className="badge bg-base-100 border-border text-base-content/75 font-bold py-3 px-3 rounded-xl text-[10px] uppercase">
                Quota : {scanCount}/3 scans
              </span>
            )}
          </div>
          
          <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl">{t('title')}</h1>
          <p className="mt-4 text-sm font-medium leading-7 text-base-content/65">{t('subtitle')}</p>

          <div className="mt-8 grid gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[22px] bg-primary px-6 py-4 text-sm font-black uppercase tracking-wide text-primary-content shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] dark:bg-secondary dark:text-secondary-content"
              style={{ backgroundColor: COLORS.forest, color: '#fff' }}
            >
              <Upload className="h-5 w-5" />
              {preview ? t('change_image') : t('open_gallery')}
            </button>
            {preview && !result && (
              <button
                type="button"
                onClick={handleScanClick}
                disabled={loading}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[22px] bg-secondary px-6 py-4 text-sm font-black uppercase tracking-wide text-secondary-content shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] disabled:translate-y-0 disabled:opacity-55"
                style={{ backgroundColor: COLORS.rust, color: '#fff' }}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                {loading ? t('analyzing') : t('identify')}
              </button>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        {/* Right Preview Card */}
        <div className="rounded-[32px] border border-dashed border-border bg-base-200 p-3 shadow-sm sm:p-4">
          <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden rounded-[28px] bg-base-100">
            {preview ? (
              <Image src={preview} alt={t('select_capture')} fill className="object-contain p-2" />
            ) : (
              <div className="max-w-sm px-6 text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary text-primary-content dark:bg-secondary dark:text-secondary-content" style={{ backgroundColor: COLORS.forest, color: '#fff' }}>
                  <Camera className="h-10 w-10" />
                </div>
                <p className="text-lg font-black">{t('select_capture')}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-base-content/55">{t('compatible_info')}</p>
              </div>
            )}
          </div>
          {preview && (
            <button type="button" onClick={resetScanner} className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-border bg-base-100 px-4 py-2 text-xs font-black text-base-content/70 transition-colors hover:border-secondary/50 hover:text-secondary">
              <RefreshCw className="h-4 w-4" />
              {t('change_image')}
            </button>
          )}
        </div>
      </section>

      {error && (
        <section className="mx-auto mt-5 max-w-6xl rounded-[24px] border border-secondary/30 bg-secondary/10 p-4 text-sm font-bold text-secondary">
          {error}
        </section>
      )}

      {result?.data && (
        <section className="mx-auto mt-5 max-w-6xl rounded-[32px] border border-border bg-base-200 p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wide text-base-content/50">{t('result_label')}</p>
              <h2 className="mt-1 text-2xl font-black tracking-normal text-base-content">{result.data.monument}</h2>
            </div>
            <TextToSpeech text={getCurrentText()} className="w-fit min-h-12 px-5" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {languageCodes.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLangChange(lang)}
                className={`rounded-2xl border px-4 py-2 text-xs font-black uppercase transition-all active:scale-95 ${
                  selectedLang === lang
                    ? 'border-primary bg-primary text-primary-content dark:border-secondary dark:bg-secondary dark:text-secondary-content'
                    : 'border-border bg-base-100 text-base-content/60 hover:border-secondary/50'
                }`}
                style={selectedLang === lang ? { backgroundColor: COLORS.forest, borderColor: 'transparent', color: '#fff' } : undefined}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-[28px] border border-border bg-base-100 p-5">
            {isTranslating ? (
              <div className="flex min-h-40 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-secondary" style={{ color: COLORS.rust }} />
              </div>
            ) : (
              <p className="m-0 whitespace-pre-line text-sm font-medium leading-7 text-base-content/75">{getCurrentText()}</p>
            )}
          </div>

          {result.data.latitude && result.data.longitude && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-border bg-base-100 px-4 py-3 text-xs font-bold text-base-content/65">
              <MapPin className="h-4 w-4 text-secondary" style={{ color: COLORS.rust }} />
              {Number(result.data.latitude).toFixed(4)}, {Number(result.data.longitude).toFixed(4)}
            </div>
          )}
        </section>
      )}

      {/* Paywall Modal Dialog */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] border border-border bg-base-200 p-6 shadow-2xl relative space-y-6 text-center">
            
            <button 
              onClick={() => setShowPaywall(false)}
              className="absolute top-4 right-4 rounded-xl p-1.5 hover:bg-base-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold tracking-tight">Limite gratuite atteinte</h3>
              <p className="text-xs text-base-content/70 leading-relaxed font-semibold">
                Vous avez utilisé vos 3 scans gratuits de monuments togolais pour ce mois-ci. 
                Passez au Premium pour scanner en illimité et soutenir le tourisme local !
              </p>
            </div>

            {/* Premium Benefits List */}
            <div className="rounded-2xl bg-base-100 p-4 border border-border/70 text-left text-xs font-bold space-y-2">
              <p className="flex items-center gap-2 text-base-content/85">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                Scans de monuments en illimité
              </p>
              <p className="flex items-center gap-2 text-base-content/85">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                Audio guide TTS haute qualité multi-langues
              </p>
              <p className="flex items-center gap-2 text-base-content/85">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                Historique de visites persistant
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleActivatePremium}
                className="btn btn-block text-white rounded-2xl border-none font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: COLORS.forest }}
              >
                <CreditCard className="h-4 w-4" /> Passer au Premium (Simulé)
              </button>
              <button
                onClick={() => setShowPaywall(false)}
                className="btn btn-block btn-ghost rounded-2xl text-xs font-bold"
              >
                Continuer en version gratuite
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
