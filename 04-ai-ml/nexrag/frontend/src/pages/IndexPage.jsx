import React, { useState, useCallback } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import ChatPanel from '../components/ChatPanel'

const WELCOME = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 Welcome to **NexRAG** — your AI-powered research assistant.

Upload your documents using the panel on the left, then ask me anything. I'll search through your knowledge base using **hybrid BM25 + semantic retrieval** and provide detailed, context-aware answers powered by **Llama 3.3 70B**.

> Supports: PDF · DOCX · TXT · CSV · JSON · Markdown · HTML · SQL · YAML · and more.`,
}

export default function IndexPage() {
  const [messages, setMessages]     = useState([WELCOME])
  const [isLoading, setIsLoading]   = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState([])
  const [uploadState, setUploadState]   = useState({ status: 'idle', message: '' })

  const handleUpload = useCallback(async (files) => {
    for (const file of files) {
      setUploadState({ status: 'uploading', message: `Uploading ${file.name}…` })
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await axios.post('/api/upload', formData)
        setUploadState({ status: 'success', message: res.data.message })
        setUploadedDocs(prev => {
          if (prev.find(d => d.name === file.name)) return prev
          return [...prev, {
            name: file.name,
            type: file.name.split('.').pop().toUpperCase(),
          }]
        })
        setTimeout(() => setUploadState({ status: 'idle', message: '' }), 3500)
      } catch (err) {
        const msg = err.response?.data?.detail || err.message
        setUploadState({ status: 'error', message: `Error: ${msg}` })
        setTimeout(() => setUploadState({ status: 'idle', message: '' }), 5000)
      }
    }
  }, [])

  const handleQuery = useCallback(async (query) => {
    if (!query.trim() || isLoading) return
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: query }])
    setIsLoading(true)
    try {
      const res = await axios.post('/api/query', { query, top_k: 5 })
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: res.data.answer }])
    } catch (err) {
      const msg = err.response?.data?.detail || 'Something went wrong. Please try again.'
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'error', content: `⚠️ ${msg}` }])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg)', overflow:'hidden' }}>
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />
      <Navbar />
      <div className="nexrag-layout">
        <Sidebar uploadedDocs={uploadedDocs} uploadState={uploadState} onUpload={handleUpload} />
        <ChatPanel messages={messages} isLoading={isLoading} onQuery={handleQuery} />
      </div>
    </div>
  )
}
