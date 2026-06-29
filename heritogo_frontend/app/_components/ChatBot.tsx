'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Send, Sparkles, X, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { COLORS } from '@/lib/constants/colors'

interface Message {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: Date
}

const CHAT_API = 'https://heritogo-production.up.railway.app/api/v1/chat'

export default function ChatBot() {
  const t = useTranslations('ChatBot')

  const [isOpen, setIsOpen]       = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping]   = useState(false)
  const [apiError, setApiError]   = useState<string | null>(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: t('welcome'),
      timestamp: new Date(),
    },
  ])

  // Historique pour le contexte multi-tour envoyé à l'API
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

    // Ajouter le message utilisateur à l'historique
    historyRef.current = [
      ...historyRef.current,
      { role: 'user', content },
    ]

    try {
      const response = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: historyRef.current.slice(-10), // 5 derniers échanges max
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData?.detail || errorData?.error || `Erreur ${response.status}`
        )
      }

      const data = await response.json() as {
        response?: string
        reply?: string
        message?: string
        answer?: string
      }

      // Supporte plusieurs formats de réponse possibles de l'API
      const aiText =
        data.response ??
        data.reply ??
        data.message ??
        data.answer ??
        t('fallback_response')

      // Ajouter la réponse IA à l'historique
      historyRef.current = [
        ...historyRef.current,
        { role: 'assistant', content: aiText },
      ]

      addMessage('ai', aiText)

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur réseau'
      console.error('[ChatBot] API error:', msg)
      setApiError(msg)
      addMessage('ai', t('fallback_response'))
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
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
                       sm:h-[min(560px,calc(100dvh-8rem))] sm:w-[390px]
                       sm:rounded-[32px]"
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
                      className={`min-w-0 overflow-hidden break-words
                        rounded-[20px] px-3.5 py-3 text-xs font-medium
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
                     z-[9999] flex h-12 w-12 items-center justify-center
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