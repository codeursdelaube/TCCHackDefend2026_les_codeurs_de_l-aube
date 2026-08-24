'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, Loader2, MapPin, RefreshCw, Upload, AlertTriangle, ShieldCheck, CreditCard, X, Sparkles } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import TextToSpeech from '@/components/TextToSpeech'
import { getUserFriendlyError } from '@/lib/utils/errors'
import { apiFetch } from '@/lib/utils/http'
import { safeJsonParse, safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils/storage'
import { useGeolocation } from '@/hooks/useGeolocation'
import { toast } from 'sonner'
import Badge from '@/components/ui/Badge'

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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Message évolutif d'analyse
  const [scanStepIndex, setScanStepIndex] = useState(0)
  const scanStepMessages = [
    'Numérisation des motifs architecturaux…',
    'Recherche dans la mémoire patrimoniale du Togo…',
    'Analyse par vision IA & recoupement géoculturel…',
    'Génération des anecdotes et secrets historiques…',
  ]

  // Paywall & Limit States
  const [scanCount, setScanCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    const date = new Date()
    const currentMonth = `${date.getFullYear()}-${date.getMonth() + 1}`
    const savedMonth = safeLocalStorageGet('heritogo_scan_month')

    let count = 0
    if (savedMonth !== currentMonth) {
      safeLocalStorageSet('heritogo_scan_month', currentMonth)
      safeLocalStorageSet('heritogo_scan_count', '0')
      count = 0
    } else {
      count = parseInt(safeLocalStorageGet('heritogo_scan_count') || '0', 10)
    }
    return count
  })
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return safeLocalStorageGet('heritogo_premium') === 'true'
  })
  const [showPaywall, setShowPaywall] = useState(false)

  const { position: geoPosition } = useGeolocation()

  useEffect(() => {
    if (geoPosition) {
      setUserLocation(geoPosition)
    } else {
      setUserLocation(null)
    }
  }, [geoPosition])

  useEffect(() => {
    return () => window.speechSynthesis.cancel()
  }, [result])

  // Hook triggered when a prediction is successful to save count & history
  useEffect(() => {
    if (result && result.data) {
      const currentCount = parseInt(safeLocalStorageGet('heritogo_scan_count') || '0', 10)
      const newCount = currentCount + 1
      safeLocalStorageSet('heritogo_scan_count', newCount.toString())
      setScanCount(newCount)

      const history = safeJsonParse<Record<string, unknown>[]>(
        safeLocalStorageGet('heritogo_scans'),
        [],
      )
      const newScan = {
        monument: result.data.monument,
        histoire: result.data.histoire,
        date: new Date().toISOString(),
        localite: userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : t('default_location')
      }
      safeLocalStorageSet('heritogo_scans', JSON.stringify([newScan, ...history]))
    }
  }, [result])

  const [error, submitScanAction, loading] = useActionState<string | null, FormData>(
    async (_previousState, formData) => {
      try {
        const res = await apiFetch<PredictionResult & { error?: string; detail?: string }>('/api/scan', {
          method: 'POST',
          body: formData,
          timeoutMs: 70000,
        })

        if (!res.ok || !res.data) return res.error || t('errors.general')
        if (res.data.prediction_status === 'unknown') {
          setResult(null)
          setTranslatedText({})
          return res.data.detail || t('errors.unknown')
        }

        setResult(res.data)
        setTranslatedText({ fr: res.data.data.histoire })
        toast.success(`Monument identifié : ${res.data.data.monument}`)
        return null
      } catch (scanError: unknown) {
        console.error(scanError)
        const errMsg = getUserFriendlyError(scanError)
        toast.error(errMsg)
        return errMsg
      }
    },
    null,
  )

  useEffect(() => {
    if (!loading) {
      setScanStepIndex(0)
      return
    }
    const interval = setInterval(() => {
      setScanStepIndex((prev) => (prev + 1) % scanStepMessages.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [loading, scanStepMessages.length])

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

    if (!isPremium && scanCount >= 3) {
      setShowPaywall(true)
      return
    }

    const formData = new FormData()
    formData.append('image', image)
    if (userLocation) {
      formData.append('lat', userLocation.lat.toString())
      formData.append('long', userLocation.lng.toString())
    }
    startTransition(() => submitScanAction(formData))
  }

  const translateText = async (text: string, targetLang: LanguageCode) => {
    if (translatedText[targetLang]) return translatedText[targetLang]
    setIsTranslating(true)
    try {
      const res = await apiFetch<[GoogleTranslateItem[]]>(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`, {
        timeoutMs: 20000,
      })
      const translated = res.ok && res.data
        ? res.data[0].map((item) => item[0]).join('')
        : text
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
    safeLocalStorageSet('heritogo_premium', 'true')
    setIsPremium(true)
    setShowPaywall(false)
    toast.success('Accès Premium activé ! Scans illimités débloqués.')
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-28 pt-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* ── HEADER BANNER ── */}
        <section className="app-card relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-card via-card to-accent/10 border-accent/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3.5 py-1 text-xs font-bold text-[#8A3A20] dark:text-amber-200">
                <Sparkles className="h-4 w-4 text-accent" />
                <span>Technologie Signature HeriTogo</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                {t('title')}
              </h1>
              <div className="togo-underline" />
              <p className="text-sm sm:text-base font-medium leading-relaxed text-muted-foreground pt-1 max-w-2xl">
                {t('subtitle')}
              </p>
            </div>

            <div className="shrink-0 self-start sm:self-center">
              {isPremium ? (
                <span className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm">
                  {t('premium_active')}
                </span>
              ) : (
                <span className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground shadow-xs">
                  {t('quota', { count: scanCount })}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ── SCANNER WORKSPACE ── */}
        <section className="grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* Left Control Card */}
          <div className="app-card p-6 sm:p-8 lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Camera className="h-4 w-4 text-primary" />
                <span>{userLocation ? t('gps_available') : t('select_capture')}</span>
              </div>
              {userLocation && (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>GPS Actif</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-13 w-full items-center justify-center gap-3 rounded-full bg-card border-2 border-dashed border-primary/40 px-6 font-bold text-primary shadow-sm hover:border-primary hover:bg-primary/5 transition-all text-sm cursor-pointer"
              >
                <Upload className="h-5 w-5" />
                <span>{preview ? t('change_image') : t('open_gallery')}</span>
              </button>

              {preview && !result && (
                <button
                  type="button"
                  onClick={handleScanClick}
                  disabled={loading}
                  className="inline-flex h-13 w-full items-center justify-center gap-3 rounded-full bg-primary px-6 font-bold text-white shadow-md hover:bg-primary-dark transition-all text-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                  <span>{loading ? t('analyzing') : t('identify')}</span>
                </button>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          {/* Right Preview Card */}
          <div className="app-card overflow-hidden p-4 lg:col-span-6 space-y-3">
            <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl bg-muted/40 border border-border">
              {preview ? (
                <Image src={preview} alt={t('select_capture')} fill className="object-contain p-2" />
              ) : (
                <div className="max-w-sm px-6 text-center space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Camera className="h-8 w-8" />
                  </div>
                  <p className="font-serif text-lg font-bold text-foreground">{t('select_capture')}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t('compatible_info')}</p>
                </div>
              )}
            </div>
            {preview && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={resetScanner}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{t('change_image')}</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {error && (
          <section className="app-card border-red-300 bg-red-50/40 dark:bg-red-950/20 p-4 text-xs font-bold text-red-600">
            {error}
          </section>
        )}

        {loading && (
          <section className="app-card p-6 sm:p-8 space-y-4 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-muted" />
                <div className="h-7 w-64 rounded bg-muted" />
              </div>
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{scanStepMessages[scanStepIndex]}</span>
              </div>
            </div>
          </section>
        )}

        {result?.data && (
          <section className="app-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{t('result_label')}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mt-0.5">{result.data.monument}</h2>
              </div>
              <TextToSpeech text={getCurrentText()} className="w-fit min-h-11 rounded-full px-5 text-xs" />
            </div>

            <div className="flex flex-wrap gap-2">
              {languageCodes.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLangChange(lang)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer ${
                    selectedLang === lang
                      ? 'bg-primary text-white shadow-sm'
                      : 'border border-border bg-card text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="rounded-2xl bg-muted/40 p-6 border border-border">
              {isTranslating ? (
                <div className="flex min-h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <p className="whitespace-pre-line text-sm sm:text-base font-medium leading-relaxed sm:leading-8 text-foreground">
                  {getCurrentText()}
                </p>
              )}
            </div>

            {result.data.latitude && result.data.longitude && (
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
                <MapPin className="h-4 w-4" />
                <span>Coordonnées : {Number(result.data.latitude).toFixed(4)}, {Number(result.data.longitude).toFixed(4)}</span>
              </div>
            )}
          </section>
        )}

        {/* Paywall Modal Dialog */}
        {showPaywall && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md space-y-6 rounded-3xl bg-card p-6 text-center shadow-2xl border border-border">
              <button
                onClick={() => setShowPaywall(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20 text-accent">
                <AlertTriangle className="h-7 w-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-serif text-2xl font-bold text-foreground">{t('limit_title')}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('limit_desc')}
                </p>
              </div>

              <div className="space-y-2 rounded-2xl bg-muted/40 p-4 text-left text-xs font-semibold border border-border">
                <p className="flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>{t('premium_scan')}</span>
                </p>
                <p className="flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>{t('premium_tts')}</span>
                </p>
                <p className="flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>{t('premium_history')}</span>
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleActivatePremium}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-white shadow-md hover:bg-primary-dark transition-all cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{t('premium_cta')}</span>
                </button>
                <button
                  onClick={() => setShowPaywall(false)}
                  className="rounded-full py-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {t('free_continue')}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}