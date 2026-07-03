'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Send, Sparkles, X, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { COLORS } from '@/lib/constants/colors'
import { getUserFriendlyError } from '@/lib/utils/errors'
import { apiFetch } from '@/lib/utils/http'

interface Message {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: Date
}

// CORRECTION : Suppression du slash '/' à la fin pour éviter la 404 de FastAPI
const CHAT_API = 'https://heritogo-production.up.railway.app/chatbot/api/v1/chat'

// Pages sur lesquelles le ChatBot ne doit pas apparaître
const AUTH_PATH_SEGMENTS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/confirm']

export default function ChatBot() {
  const t = useTranslations('ChatBot')
  const pathname = usePathname()

  // Cacher le ChatBot sur les pages d'authentification
  const isAuthPage = AUTH_PATH_SEGMENTS.some(seg => pathname?.includes(seg))

  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: t('welcome'),
      timestamp: new Date(),
    },
  ])

  // L'historique local reste utile pour l'affichage de l'UI
  const historyRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const addMessage = useCallback((sender: 'user' | 'ai', text: string) => {
    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), sender, text, timestamp: new Date() },
    ])
  }, [])

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const content = inputValue.trim()
    if (!content || isTyping) return

    setApiError(null)
    setInputValue('')
    addMessage('user', content)
    setIsTyping(true)

    const currentHistory = [
      ...historyRef.current,
      { role: 'user' as const, content },
    ]

    try {
      const result = await apiFetch<{
        response?: string
        reply?: string
        message?: string
        answer?: string
      }>(CHAT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeoutMs: 45000,
        // CORRECTION : Structure du JSON nettoyée pour coller au BaseModel de FastAPI
        body: JSON.stringify({
          message: content,
          extracted_location: "Lomé", // Optionnel (prendra Lomé par défaut si tu l'enlèves)
          extracted_budget: 0.0       // Optionnel (prendra 0.0 par défaut si tu l'enlèves)
        }),
      })

      if (!result.ok || !result.data) {
        throw new Error(result.error || t('fallback_response'))
      }

      const data = result.data

      const aiText =
        data.response ??
        data.reply ??
        data.message ??
        data.answer ??
        t('fallback_response')

      historyRef.current = [
        ...currentHistory,
        { role: 'assistant' as const, content: aiText },
      ]

      addMessage('ai', aiText)

    } catch (err: unknown) {
      console.error('[ChatBot] API error:', err)
      setApiError(getUserFriendlyError(err))
      addMessage('ai', t('fallback_response'))
    } finally {
      setIsTyping(false)
    }
  }

  // Ne pas afficher le chatbot sur les pages d'authentification
  if (isAuthPage) return null

  return (
    <div className="fixed inset-0 z-9999 pointer-events-none">
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="pointer-events-auto fixed
                       bottom-[calc(10.75rem+env(safe-area-inset-bottom))]
                       left-3 right-3
                       top-[calc(4.75rem+env(safe-area-inset-top))]
                       flex min-h-0 flex-col overflow-hidden
                       rounded-[28px] border border-border
                       bg-base-200 text-base-content shadow-2xl
                       sm:bottom-24 sm:left-auto sm:right-6 sm:top-auto
                       sm:h-[min(560px,calc(100dvh-8rem))] sm:w-97.5
                       sm:rounded-4xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between
                            border-b border-border bg-base-200 p-3.5 sm:p-4">
              <div className="flex items-center gap-3">
                <div
                  className="relative flex h-10 w-10 shrink-0 items-center
                             justify-center rounded-2xl text-white sm:h-11 sm:w-11"
                  style={{ backgroundColor: COLORS.forest }}
                >
                  <Bot className="h-5 w-5" />
                  <span
                    className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full
                               border-2 border-base-200"
                    style={{ backgroundColor: COLORS.rust }}
                  />
                </div>
                <div>
                  <h3 className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wide">
                    {t('title')}
                    <Sparkles className="h-3.5 w-3.5" style={{ color: COLORS.rust }} />
                  </h3>
                  <p className="line-clamp-1 text-[11px] font-semibold text-base-content/55">
                    {t('subtitle')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-2xl
                           text-base-content/60 transition-colors
                           hover:bg-base-100 hover:text-base-content"
                aria-label={t('close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Erreur API */}
            {apiError && (
              <div className="shrink-0 mx-3 mt-2 flex items-start gap-2
                              rounded-xl bg-error/10 border border-error/20
                              px-3 py-2 text-xs text-error">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Messages */}
            <div className="min-h-0 grow space-y-3 overflow-y-auto
                            bg-base-100 p-3 scrollbar-none sm:space-y-4 sm:p-4">
              {messages.map((msg) => {
                const isAi = msg.sender === 'ai'
                return (
                  <div
                    key={msg.id}
                    className={`flex max-w-[92%] gap-2 sm:max-w-[88%]
                      ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                  >
                    {isAi && (
                      <div className="flex h-7 w-7 shrink-0 items-center
                                      justify-center rounded-xl bg-base-200">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div
                      className={`min-w-0 overflow-hidden wrap-break-words
                        rounded-2xl px-3.5 py-3 text-xs font-medium
                        leading-relaxed shadow-sm sm:rounded-[22px]
                        ${isAi
                          ? 'rounded-tl-md border border-border bg-base-200 text-base-content'
                          : 'rounded-tr-md text-white'
                        }`}
                      style={!isAi ? { backgroundColor: COLORS.forest } : undefined}
                    >
                      <p className="m-0 whitespace-pre-wrap">{msg.text}</p>
                      <span className="mt-1 block text-right text-[9px] opacity-55">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* Indicateur de frappe */}
              {isTyping && (
                <div className="mr-auto flex max-w-[88%] gap-2">
                  <div className="flex h-7 w-7 items-center justify-center
                                  rounded-xl bg-base-200">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex items-center gap-1 rounded-[22px] rounded-tl-md
                                  border border-border bg-base-200 px-3.5 py-3">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-base-content/40 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="flex shrink-0 items-center gap-2 border-t border-border
                         bg-base-200 p-2.5 sm:p-3"
            >
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={t('placeholder')}
                disabled={isTyping}
                className="min-w-0 grow rounded-2xl border border-border bg-base-100
                           px-3.5 py-3 text-sm font-medium outline-none transition-all
                           placeholder:text-base-content/40
                           focus:border-secondary focus:ring-2 focus:ring-secondary/15
                           disabled:opacity-50 sm:px-4"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="flex h-11 w-11 shrink-0 items-center justify-center
                           rounded-2xl text-white shadow-sm transition-all
                           hover:-translate-y-0.5 hover:shadow-md active:scale-95
                           disabled:translate-y-0 disabled:opacity-40 sm:h-12 sm:w-12"
                style={{ backgroundColor: COLORS.rust }}
                aria-label={t('send')}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton flottant */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto fixed
                     bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4
                     z-9999 flex h-12 w-12 items-center justify-center
                     rounded-full text-white shadow-xl transition-all
                     hover:scale-105 active:scale-95 hover:shadow-2xl
                     border border-white/10"
          style={{ backgroundColor: COLORS.forest }}
          aria-label="Ouvrir l'assistant IA"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}