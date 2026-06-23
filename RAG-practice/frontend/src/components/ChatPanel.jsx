import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

// Bot SVG icon
const BotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>
    <path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
  </svg>
)

// User SVG icon
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/>
  </svg>
)

// Send icon
const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
  </svg>
)

const MessageBubble = React.memo(({ msg }) => {
  const isUser  = msg.role === 'user'
  const isError = msg.role === 'error'

  return (
    <motion.div
      className={`nexrag-msg ${isUser ? 'user' : 'sys'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`nexrag-avatar ${isUser ? 'user' : 'sys'}`}>
        {isUser ? <UserIcon /> : <BotIcon />}
      </div>
      <div className={`nexrag-bubble ${isUser ? 'user' : isError ? 'error' : 'sys'}`}>
        {isUser ? (
          <p style={{ margin: 0, color: '#e2e8f0' }}>{msg.content}</p>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  )
})
MessageBubble.displayName = 'MessageBubble'

export default function ChatPanel({ messages, isLoading, onQuery }) {
  const [input, setInput] = useState('')
  const historyRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSubmit = useCallback((e) => {
    e?.preventDefault()
    const q = input.trim()
    if (!q || isLoading) return
    onQuery(q)
    setInput('')
  }, [input, isLoading, onQuery])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  return (
    <motion.section
      className="nexrag-chat glass"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="nexrag-chat-header">
        <div>
          <div className="nexrag-chat-title">Query Engine</div>
          <div className="nexrag-chat-sub">Llama 3.3 70B · Hybrid BM25 + FAISS Retrieval</div>
        </div>
        <div className="nexrag-status-pill">
          <span className="nexrag-status-dot" />
          Online
        </div>
      </div>

      {/* History */}
      <div className="nexrag-history" ref={historyRef} role="log" aria-live="polite">
        <AnimatePresence initial={false}>
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="nexrag-msg sys"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="nexrag-avatar sys"><BotIcon /></div>
              <div className="nexrag-bubble sys" style={{ padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <div className="nexrag-typing-dot" />
                  <div className="nexrag-typing-dot" />
                  <div className="nexrag-typing-dot" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="nexrag-input-wrap">
        <form onSubmit={handleSubmit}>
          <div className="nexrag-input-row">
            <textarea
              ref={textareaRef}
              className="nexrag-textarea"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your documents…"
              rows={1}
              disabled={isLoading}
              aria-label="Your question"
            />
            <button
              type="submit"
              className="nexrag-send-btn"
              disabled={!input.trim() || isLoading}
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </div>
        </form>
        <div className="nexrag-input-hint">
          <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
        </div>
      </div>
    </motion.section>
  )
}
