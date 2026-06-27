'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Send, Sparkles, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { COLORS } from '@/lib/constants/colors'

interface Message {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: Date
}

export default function ChatBot() {
  const t = useTranslations('ChatBot')
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: t('welcome'),
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = inputValue.trim()
    if (!content) return

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), sender: 'user', text: content, timestamp: new Date() },
    ])
    setInputValue('')
    setIsTyping(true)

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), sender: 'ai', text: t('fallback_response'), timestamp: new Date() },
      ])
      setIsTyping(false)
    }, 900)
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
            className="pointer-events-auto fixed bottom-[calc(10.75rem+env(safe-area-inset-bottom))] left-3 right-3 top-[calc(4.75rem+env(safe-area-inset-top))] flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-border bg-base-200 text-base-content shadow-2xl sm:bottom-24 sm:left-auto sm:right-6 sm:top-auto sm:h-[min(560px,calc(100dvh-8rem))] sm:w-[390px] sm:rounded-[32px]"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-base-200 p-3.5 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-content dark:bg-secondary dark:text-secondary-content sm:h-11 sm:w-11" style={{ backgroundColor: COLORS.forest }}>
                  <Bot className="h-5 w-5 text-white" />
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-base-200 bg-secondary" style={{ backgroundColor: COLORS.rust }} />
                </div>
                <div>
                  <h3 className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wide">
                    {t('title')}
                    <Sparkles className="h-3.5 w-3.5 text-secondary" style={{ color: COLORS.rust }} />
                  </h3>
                  <p className="line-clamp-1 text-[11px] font-semibold text-base-content/55">{t('subtitle')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-2xl text-base-content/60 transition-colors hover:bg-base-100 hover:text-base-content"
                aria-label={t('close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 grow space-y-3 overflow-y-auto bg-base-100 p-3 scrollbar-none sm:space-y-4 sm:p-4">
              {messages.map((message) => {
                const isAi = message.sender === 'ai'
                return (
                  <div key={message.id} className={`flex max-w-[92%] gap-2 sm:max-w-[88%] ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                    {isAi && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-base-200 text-base-content">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div
                      className={`min-w-0 overflow-hidden break-words rounded-[20px] px-3.5 py-3 text-xs font-medium leading-relaxed shadow-sm sm:rounded-[22px] ${
                        isAi
                          ? 'rounded-tl-md border border-border bg-base-200 text-base-content'
                          : 'rounded-tr-md text-white'
                      }`}
                      style={!isAi ? { backgroundColor: COLORS.forest } : undefined}
                    >
                      <p className="m-0 text-inherit">{message.text}</p>
                      <span className="mt-1 block text-right text-[9px] opacity-55">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )
              })}

              {isTyping && (
                <div className="mr-auto flex max-w-[88%] gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-base-200 text-base-content">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-[22px] rounded-tl-md border border-border bg-base-200 px-3.5 py-3 text-xs font-semibold text-base-content/55">
                    {t('typing')}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="flex shrink-0 items-center gap-2 border-t border-border bg-base-200 p-2.5 sm:p-3">
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder={t('placeholder')}
                className="min-w-0 grow rounded-2xl border border-border bg-base-100 px-3.5 py-3 text-sm font-medium outline-none transition-all placeholder:text-base-content/40 focus:border-secondary focus:ring-2 focus:ring-secondary/15 sm:px-4"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95 disabled:translate-y-0 disabled:opacity-40 sm:h-12 sm:w-12"
                style={{ backgroundColor: COLORS.rust }}
                aria-label={t('send')}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 z-[9999] flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl transition-all hover:scale-105 active:scale-95 hover:shadow-2xl border border-white/10"
          style={{ backgroundColor: COLORS.forest }}
          aria-label="Ouvrir l'assistant IA"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
