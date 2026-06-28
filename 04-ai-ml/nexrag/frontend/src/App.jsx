import React, { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Welcome to **NexRAG** — your AI-powered research assistant.\n\nUpload your documents using the panel on the left, then ask me anything. I'll search through your knowledge base and provide detailed, context-aware answers.\n\n> Supports PDF, DOCX, TXT, CSV, JSON, Markdown, HTML, SQL, YAML and more.`,
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState([])
  const [uploadState, setUploadState] = useState({ status: 'idle', message: '' })

  const handleUpload = useCallback(async (files) => {
    for (const file of files) {
      setUploadState({ status: 'uploading', message: `Uploading ${file.name}…` })
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await axios.post('/api/upload', formData)
        setUploadState({ status: 'success', message: res.data.message })
        setUploadedDocs(prev => {
          const exists = prev.find(d => d.name === file.name)
          if (exists) return prev
          return [...prev, { name: file.name, type: file.name.split('.').pop().toUpperCase() }]
        })
        setTimeout(() => setUploadState({ status: 'idle', message: '' }), 3000)
      } catch (err) {
        const msg = err.response?.data?.detail || err.message
        setUploadState({ status: 'error', message: `Error: ${msg}` })
      }
    }
  }, [])

  const handleQuery = useCallback(async (query) => {
    if (!query.trim() || isLoading) return

    const userMsg = { id: Date.now().toString(), role: 'user', content: query }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const res = await axios.post('/api/query', { query, top_k: 5 })
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.answer,
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to get a response. Please try again.'
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'error',
        content: `⚠️ ${msg}`,
      }])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  return (
    <div className="flex flex-col h-full bg-[#020617] overflow-hidden">
      {/* Background orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      <Navbar />

      <div className="flex flex-1 gap-4 p-4 overflow-hidden relative z-10">
        <Sidebar
          uploadedDocs={uploadedDocs}
          uploadState={uploadState}
          onUpload={handleUpload}
        />
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          onQuery={handleQuery}
        />
      </div>
    </div>
  )
}
