import { useEffect, useRef, useState } from 'react'
import { Mic, RotateCcw, Send } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { gsap, useGSAP } from '../lib/animations'
import {
  botFallbackRules,
  botReplies,
  catalogSchemes,
  introMessages,
  languages,
  officerBotFallbackRules,
  officerBotReplies,
  officerIntroMessages,
  officerQuickReplies,
  quickReplies,
} from '../data'
import { useAuth } from '../context/AuthContext'
import { sendChatMessageApi } from '../services/api'
import { MarkdownContent } from '../components/MarkdownContent'
import type { Role } from './auth/copy'

interface ChatMessage {
  id: number
  role: 'bot' | 'user'
  text: string
  schemeId?: string
}

const LANG_NAMES: Record<string, string> = {
  bn: 'Bengali',
  hi: 'Hindi',
  en: 'English',
}

const citizenInitialMessages: ChatMessage[] = [
  {
    id: 1,
    role: 'bot',
    text: 'নমস্কার, Asha! 🙏 I\u2019m Sahayak — your welfare assistant. Ask me anything in Bengali, Hindi or English, by text or voice.',
  },
]

const officerInitialMessages: ChatMessage[] = [
  {
    id: 1,
    role: 'bot',
    text: officerIntroMessages.bn,
  },
]

/* ── Conversation persistence (localStorage, keyed per user + role) ────────
   Keeps the chat across refreshes and re-visits. Stored only in the user's
   own browser — never uploaded. Keyed by role + user id so guest demo chats
   and different signed-in users never mix. */
const CHAT_STORAGE_PREFIX = 'sevanest:chat:'

function chatStorageKey(role: Role, guest: boolean, userId?: string | null): string {
  return `${CHAT_STORAGE_PREFIX}${role}:${guest ? 'guest' : userId || 'anon'}`
}

function loadChatHistory(key: string): ChatMessage[] | null {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every(
        (m) =>
          m &&
          typeof m === 'object' &&
          (m.role === 'user' || m.role === 'bot') &&
          typeof m.text === 'string' &&
          typeof m.id === 'number',
      )
    ) {
      return parsed as ChatMessage[]
    }
  } catch {
    /* corrupted or unavailable storage — start fresh */
  }
  return null
}

function maxMessageId(messages: ChatMessage[]): number {
  return messages.reduce((max, m) => Math.max(max, m.id), 0)
}

export function ChatPage({ role }: { role: Role }) {
  const isOfficer = role === 'officer'
  const { guest, identity, profile, user } = useAuth()
  const [language, setLanguage] = useState('bn')
  const storageKey = chatStorageKey(role, guest, user?.id)
  const [restored] = useState<ChatMessage[] | null>(() => loadChatHistory(storageKey))

  /* Greeting for a fresh conversation — personalised for real users. */
  const buildInitialMessages = (): ChatMessage[] => {
    if (!isOfficer) {
      return guest
        ? citizenInitialMessages
        : citizenInitialMessages.map((m) => ({
            ...m,
            text: m.text.replace('Asha', identity.firstName),
          }))
    }
    return guest
      ? officerInitialMessages
      : officerInitialMessages.map((m) => ({
          ...m,
          text: m.text.replace('Rajiv', identity.firstName),
        }))
  }

  const [messages, setMessages] = useState<ChatMessage[]>(
    () => restored ?? buildInitialMessages(),
  )
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [listening, setListening] = useState(false)
  const replyIndex = useRef(0)
  /* Resume ids after the restored history so new messages never collide and
     only *new* bubbles animate in (restored ones appear instantly). */
  const restoredMaxId = restored ? maxMessageId(restored) : 0
  const idRef = useRef(restoredMaxId + 1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<ChatMessage[]>([])
  /* One AI turn at a time — guards against double-send via quick replies
     while a previous request is still in flight. */
  const aiBusyRef = useRef(false)
  const timersRef = useRef<number[]>([])
  const lastAnimated = useRef(restoredMaxId)

  /* iMessage-style bubble pops (Animations.md §3.2): every newly appended
     message scales/fades in; its embedded scheme card slides up after. */
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: reduce)', () => {})
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // scrollRef is the bottom anchor; its parent is the scroll container.
        const container = scrollRef.current?.parentElement
        if (!container) return
        const fresh = gsap.utils
          .toArray<HTMLElement>('[data-msg-id]', container)
          .filter((el) => Number(el.dataset.msgId) > lastAnimated.current)
        if (!fresh.length) return

        gsap.fromTo(
          fresh,
          { scale: 0.94, y: 8, opacity: 0 },
          {
            scale: 1,
            y: 0,
            opacity: 1,
            duration: 0.2,
            ease: 'power2.out',
            stagger: 0.04,
            overwrite: true,
          },
        )
        fresh.forEach((el) => {
          const card = el.querySelector<HTMLElement>('[data-scheme-card]')
          if (card) {
            gsap.fromTo(
              card,
              { y: 14, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out',
                delay: 0.08,
                overwrite: true,
              },
            )
          }
        })

        lastAnimated.current = Number(fresh[fresh.length - 1].dataset.msgId)
      })
    },
    { scope: scrollRef, dependencies: [messages] },
  )

  const schedule = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms))
  }

  const append = (message: Omit<ChatMessage, 'id'>) => {
    const id = idRef.current++
    setMessages((prev) => [...prev, { ...message, id }])
  }

  /* Canned fallback — used only when the AI backend is unreachable,
     misconfigured or rate-limited, so the chat never dead-ends. Answers are
     matched to the question's keywords so quick replies and similar questions
     always get a relevant reply (never a randomly cycling one). */
  const fallbackReply = (userText?: string, schemeId?: string) => {
    const replies = isOfficer ? officerBotReplies : botReplies
    const rules = isOfficer ? officerBotFallbackRules : botFallbackRules
    const question = (userText || '').toLowerCase()
    const matched = rules.find((rule) =>
      rule.keywords.some((keyword) => question.includes(keyword)),
    )
    setTyping(true)
    schedule(() => {
      setTyping(false)
      append({
        role: 'bot',
        text: matched?.reply ?? replies[replyIndex.current % replies.length],
        schemeId: matched?.schemeId ?? schemeId,
      })
      // Only advance the cycling index when no rule matched.
      if (!matched) replyIndex.current += 1
    }, 1200)
  }

  /** Compact profile context so the AI can personalise eligibility answers. */
  const chatProfileContext = (): Record<string, unknown> | undefined => {
    if (guest) {
      // Demo persona — lets the demo chat answer eligibility questions
      // the same way a real signed-in user's profile would.
      return isOfficer
        ? {
            fullName: 'Rajiv Das',
            designation: 'Block Officer',
            block: 'Uluberia-I',
            district: 'Howrah',
            state: 'West Bengal',
          }
        : {
            fullName: 'Asha Verma',
            age: 32,
            gender: 'Female',
            occupation: 'Farmer',
            annualIncome: 140000,
            landAcres: 1.2,
            state: 'West Bengal',
            district: 'Howrah',
            village: 'Durganagar',
            block: 'Uluberia-I',
          }
    }
    if (!profile) return undefined
    const fields = [
      'fullName',
      'age',
      'gender',
      'occupation',
      'annualIncome',
      'landAcres',
      'state',
      'district',
      'village',
      'block',
      'casteCategory',
    ] as const
    const compact: Record<string, unknown> = {}
    for (const field of fields) {
      const value = profile[field]
      if (value !== null && value !== undefined && value !== '') compact[field] = value
    }
    return Object.keys(compact).length > 0 ? compact : undefined
  }

  /* Real AI turn: send history + profile to the backend Sahayak (Groq →
     Gemini fallback server-side), and fall back to canned replies locally
     when the AI can't answer (offline / no key / rate-limited). */
  const aiReply = async (userText?: string, schemeId?: string) => {
    if (aiBusyRef.current) return
    aiBusyRef.current = true
    setTyping(true)
    const history = messagesRef.current.slice(-12).map((m) => ({
      role: m.role,
      text: m.text,
    }))
    if (userText) history.push({ role: 'user', text: userText })

    const reply = await sendChatMessageApi({
      messages: history,
      role,
      language,
      profile: chatProfileContext(),
    })
    setTyping(false)
    if (reply) {
      append({ role: 'bot', text: reply, schemeId })
      aiBusyRef.current = false
    } else {
      // The canned fallback types for ~1.2s — keep the lock until it lands.
      fallbackReply(userText, schemeId)
      schedule(() => {
        aiBusyRef.current = false
      }, 1300)
    }
  }

  const send = () => {
    const text = input.trim()
    if (!text || typing || listening) return
    setInput('')
    append({ role: 'user', text })
    void aiReply(text)
  }

  const sendQuick = (text: string) => {
    append({ role: 'user', text })
    void aiReply(text)
  }

  /* Intro greeting for a language switch — personalise the demo name with
     the real user's first name, mirroring the initial-messages logic. */
  const introFor = (id: string) => {
    const text = isOfficer ? officerIntroMessages[id] : introMessages[id]
    if (guest) return text
    return isOfficer
      ? text.replace('Rajiv', identity.firstName)
      : text.replace('Asha', identity.firstName)
  }

  const switchLanguage = (id: string) => {
    if (id === language) return
    setLanguage(id)
    append({
      role: 'bot',
      text: introFor(id),
    })
  }

  const startVoice = () => {
    if (listening || typing) return

    /* Minimal Web Speech API types — the DOM lib doesn't ship them for all
       TS versions, so model only what we use. */
    interface RecognitionResultLike {
      transcript?: string
    }
    interface RecognitionEventLike {
      results?: Array<Array<RecognitionResultLike>>
    }
    interface SpeechRecognitionLike {
      lang: string
      interimResults: boolean
      maxAlternatives: number
      onresult: ((event: RecognitionEventLike) => void) | null
      onerror: (() => void) | null
      onend: (() => void) | null
      start: () => void
    }
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike
      webkitSpeechRecognition?: new () => SpeechRecognitionLike
    }
    const SpeechRecognitionCtor = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!SpeechRecognitionCtor) {
      demoVoice()
      return
    }
    const recognition = new SpeechRecognitionCtor()
    recognition.lang = language === 'bn' ? 'bn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    setListening(true)
    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript?.trim()
      setListening(false)
      if (text) {
        append({ role: 'user', text })
        void aiReply(text)
      }
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start()
  }

  /* Fallback when the browser has no SpeechRecognition (demo the turn). */
  const demoVoice = () => {
    setListening(true)
    schedule(() => {
      setListening(false)
      const question = isOfficer
        ? 'Which reports are due this week?'
        : 'Am I eligible for a housing scheme?'
      append({ role: 'user', text: `🎤 “${question}”` })
      void aiReply(question)
    }, 2200)
  }

  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [])

  /* Live snapshot of messages so async AI replies always see the latest
     conversation (append uses functional setState). */
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  /* Persist the conversation after every change, so a refresh or re-visit
     restores it. Fails silently (private-mode storage). */
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch {
      /* storage unavailable — chat still works in memory */
    }
  }, [messages, storageKey])

  /* Start a fresh conversation (clears this user's saved history). Guarded
     so an in-flight AI reply can't land in the brand-new conversation. */
  const newChat = () => {
    if (aiBusyRef.current || typing) return
    try {
      window.localStorage.removeItem(storageKey)
    } catch {
      /* ignore */
    }
    replyIndex.current = 0
    setMessages(buildInitialMessages())
  }

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    scrollRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'end',
    })
  }, [messages, typing])

  return (
    <div>
      <div className="max-md:hidden">
        <PageHeader
          title="Sahayak chat"
          subtitle={
            isOfficer
              ? 'Your desk assistant — ask about pending reports, applications to review, or deadlines. In your language, by text or voice.'
              : 'Ask anything in your own language — by text or voice. No jargon, no forms-speak.'
          }
        />
      </div>

      {/* Language switcher (desktop / tablet) */}
      <div className="mt-5 flex flex-wrap items-center gap-2 max-md:hidden">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => switchLanguage(lang.id)}
            aria-pressed={language === lang.id}
            className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand-orange ${
              language === lang.id
                ? 'bg-brand-navy text-navy-contrast shadow-soft'
                : 'border border-border-subtle bg-surface text-ink-700 hover:text-ink-900'
            }`}
          >
            {lang.label}
          </button>
        ))}
        <span className="ml-auto hidden text-xs text-ink-400 sm:block">
          Voice supported · replies read aloud
        </span>
        <button
          onClick={newChat}
          aria-label="Start a new chat"
          title="Clear this conversation"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-border-subtle px-3.5 py-2 text-xs font-medium text-ink-600 transition-colors duration-150 hover:border-brand-orange/60 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-orange"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
          New chat
        </button>
      </div>

      {/* Chat card. Below md it becomes one fixed, viewport-filling surface
          (between the sticky top bar at 67px and the bottom tab bar) so the
          messages pane is the only scroll area — no nested page scroll. */}
      <div className="mt-4 flex flex-col rounded-[24px] border border-border-subtle bg-surface shadow-soft max-md:fixed max-md:inset-x-0 max-md:top-[var(--mobile-topbar-h)] max-md:bottom-0 max-md:z-10 max-md:mt-0 max-md:rounded-none max-md:border-0 max-md:shadow-none">
        {/* Language switcher — slim bar at the top of the chat on mobile */}
        <div className="hidden items-center justify-between gap-2 border-b border-border-subtle px-3 py-2 max-md:flex">
          <div className="flex items-center gap-1.5" role="group" aria-label="Language">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => switchLanguage(lang.id)}
                aria-pressed={language === lang.id}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand-orange ${
                  language === lang.id
                    ? 'bg-brand-navy text-navy-contrast'
                    : 'border border-border-subtle bg-surface text-ink-700 hover:text-ink-900'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-[10px] text-ink-400 min-[400px]:inline">
              Voice · read aloud
            </span>
            <button
              onClick={newChat}
              aria-label="Start a new chat"
              title="Clear this conversation"
              className="flex items-center gap-1 rounded-full border border-border-subtle px-2.5 py-1.5 text-[11px] font-medium text-ink-600 transition-colors duration-150 hover:border-brand-orange/60 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-orange"
            >
              <RotateCcw className="h-3 w-3" strokeWidth={1.75} />
              <span className="hidden min-[400px]:inline">New chat</span>
            </button>
          </div>
        </div>

        <div className="flex h-[460px] flex-col gap-4 overflow-y-auto p-5 md:p-6 max-md:h-auto max-md:min-h-0 max-md:flex-1 max-md:gap-3 max-md:p-3.5 max-md:overflow-x-hidden">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOfficer={isOfficer}
            />
          ))}
          {typing && (
            <div className="bubble-pop">
              <TypingBubble />
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Quick replies — swipeable row on mobile, kept compact so the
            composer doesn't crowd the messages */}
        <div className="flex flex-wrap gap-2 border-t border-border-subtle px-5 py-3 sm:px-6 max-md:flex-nowrap max-md:overflow-x-auto max-md:px-3 max-md:py-2 max-md:no-scrollbar">
          {(isOfficer ? officerQuickReplies : quickReplies).map((reply) => (
            <button
              key={reply}
              onClick={() => sendQuick(reply)}
              className="shrink-0 rounded-full border border-border-subtle bg-canvas/60 px-3.5 py-1.5 text-xs font-medium text-ink-700 transition-colors duration-150 hover:border-brand-orange/60 hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-brand-orange max-md:min-h-9 max-md:px-3 max-md:text-[11px]"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input bar — bottom padding clears the fixed tab bar on mobile */}
        <div className="border-t border-border-subtle p-3 sm:p-4 max-md:px-3 max-md:py-2.5 max-md:pb-[calc(env(safe-area-inset-bottom)+3.75rem)]">
          <div className="flex items-center gap-2 rounded-[20px] border border-border-subtle bg-canvas/50 p-1.5 max-md:gap-1.5 max-md:rounded-[16px] max-md:p-1">
            <button
              onClick={startVoice}
              aria-label="Speak your question"
              className={`flex shrink-0 items-center justify-center rounded-[12px] p-3 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand-orange max-md:p-2.5 ${
                listening
                  ? 'bg-brand-orange text-white dark:text-[#16151b]'
                  : 'text-ink-700 hover:bg-surface'
              }`}
            >
              <Mic className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={
                listening ? 'Listening… speak now' : 'Type your question…'
              }
              aria-label="Your question"
              className="w-full min-w-0 flex-1 bg-transparent px-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none max-md:text-[13px]"
            />
            <button
              onClick={send}
              aria-label="Send message"
              className="flex shrink-0 items-center justify-center gap-2 rounded-[14px] bg-brand-navy px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.04em] text-navy-contrast transition-colors duration-150 hover:bg-[#2d2839] dark:hover:bg-[#d9d5cd] focus-visible:outline-2 focus-visible:outline-brand-orange max-md:px-3.5 max-md:py-2"
            >
              <Send className="h-4 w-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          {listening && (
            <p className="mt-2 flex items-center gap-2 text-xs text-ink-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-orange" />
              Listening in {LANG_NAMES[language]}… you can speak now
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  isOfficer,
}: {
  message: ChatMessage
  isOfficer: boolean
}) {
  const isUser = message.role === 'user'
  if (isUser) {
    return (
      <div data-msg-id={message.id} className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-navy px-4 py-3 text-[15px] leading-relaxed text-navy-contrast sm:max-w-[70%]">
          {message.text}
        </p>
      </div>
    )
  }
  return (
    <div data-msg-id={message.id} className="flex max-w-[88%] flex-col sm:max-w-[75%]">
      <div className="flex items-start gap-3">
        <BotAvatar />
        <MarkdownContent text={message.text} />
      </div>
      {message.schemeId && (
        <div data-scheme-card className="ml-11 mt-2">
          <SchemeSuggestion schemeId={message.schemeId} isOfficer={isOfficer} />
        </div>
      )}
    </div>
  )
}

function BotAvatar() {
  return (
    <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy dark:bg-[#16151b]">
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 text-brand-orange"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M12 12 m-4 0 a4 4 0 1 1 8 0 a6 6 0 1 1 -12 0 a8 8 0 1 1 16 0" />
      </svg>
    </span>
  )
}

function SchemeSuggestion({
  schemeId,
  isOfficer,
}: {
  schemeId: string
  isOfficer: boolean
}) {
  const scheme = catalogSchemes.find((s) => s.id === schemeId)
  if (!scheme) return null
  return (
    <div className="w-72 rounded-2xl border border-border-subtle bg-surface p-4 shadow-soft max-md:max-w-[calc(100vw-5.625rem)]">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-brand-mint" />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          {scheme.category}
        </p>
        <span className="ml-auto rounded-full bg-brand-mint/20 px-2 py-0.5 text-[10px] font-semibold text-[#3d7d6b] dark:text-[#7fd1bb]">
          {isOfficer ? 'In your block ✓' : 'Documents verified ✓'}
        </span>
      </div>
      <p className="mt-2 text-[15px] font-semibold text-ink-900">
        {scheme.title}
      </p>
      <p className="mt-0.5 text-xs font-medium text-brand-orange">
        {scheme.benefit}
      </p>
      <button className="mt-3 w-full rounded-[12px] bg-brand-navy px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.04em] text-navy-contrast transition-colors duration-150 hover:bg-[#2d2839] dark:hover:bg-[#d9d5cd] focus-visible:outline-2 focus-visible:outline-brand-orange">
        {isOfficer ? 'Review applications' : 'Open application'}
      </button>
    </div>
  )
}

function TypingBubble() {
  return (
    <div className="flex items-center gap-3">
      <BotAvatar />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border-subtle bg-canvas/60 px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
