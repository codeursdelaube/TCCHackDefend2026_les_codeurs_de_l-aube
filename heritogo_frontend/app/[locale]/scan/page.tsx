'use client'

import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, Loader2, MapPin, RefreshCw, Sparkles, Upload, Volume2, VolumeX } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

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
      } catch (scanError) {
        console.error(scanError)
        return t('errors.server')
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

  return (
    <main className="min-h-screen bg-base-100 px-4 pb-28 pt-20 text-base-content sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[32px] border border-border bg-base-200 p-5 shadow-sm sm:p-7">
          <div className="mb-5 inline-flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-[11px] font-black uppercase tracking-wide text-secondary-content">
            <Sparkles className="h-4 w-4" />
            {userLocation ? t('gps_available') : t('select_capture')}
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl">{t('title')}</h1>
          <p className="mt-4 text-sm font-medium leading-7 text-base-content/65">{t('subtitle')}</p>

          <div className="mt-8 grid gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[22px] bg-primary px-6 py-4 text-sm font-black uppercase tracking-wide text-primary-content shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] dark:bg-secondary dark:text-secondary-content"
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
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                {loading ? t('analyzing') : t('identify')}
              </button>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        <div className="rounded-[32px] border border-dashed border-border bg-base-200 p-3 shadow-sm sm:p-4">
          <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden rounded-[28px] bg-base-100">
            {preview ? (
              <Image src={preview} alt={t('select_capture')} fill className="object-contain p-2" />
            ) : (
              <div className="max-w-sm px-6 text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary text-primary-content dark:bg-secondary dark:text-secondary-content">
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
            <button
              type="button"
              onClick={toggleSpeech}
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[20px] px-5 text-sm font-black transition-all active:scale-95 ${
                isSpeaking ? 'bg-secondary text-secondary-content' : 'bg-primary text-primary-content dark:bg-secondary dark:text-secondary-content'
              }`}
            >
              {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              {isSpeaking ? t('tts_stop') : t('tts_play')}
            </button>
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
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-[28px] border border-border bg-base-100 p-5">
            {isTranslating ? (
              <div className="flex min-h-40 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-secondary" />
              </div>
            ) : (
              <p className="m-0 whitespace-pre-line text-sm font-medium leading-7 text-base-content/75">{getCurrentText()}</p>
            )}
          </div>

          {result.data.latitude && result.data.longitude && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-border bg-base-100 px-4 py-3 text-xs font-bold text-base-content/65">
              <MapPin className="h-4 w-4 text-secondary" />
              {Number(result.data.latitude).toFixed(4)}, {Number(result.data.longitude).toFixed(4)}
            </div>
          )}
        </section>
      )}
    </main>
  )
}

