import React, { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const badgeClass = (ext) => {
  const map = { PDF:'badge-pdf', DOCX:'badge-docx', DOC:'badge-doc', TXT:'badge-txt',
    CSV:'badge-csv', JSON:'badge-json', JSONL:'badge-jsonl', MD:'badge-md',
    HTML:'badge-html', HTM:'badge-htm', SQL:'badge-sql', YAML:'badge-yaml', YML:'badge-yml' }
  return `nexrag-kb-badge ${map[ext?.toUpperCase()] || 'badge-default'}`
}

export default function Sidebar({ uploadedDocs, uploadState, onUpload }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onUpload(files)
  }, [onUpload])

  const handleDragOver  = useCallback((e) => { e.preventDefault(); setDragging(true) }, [])
  const handleDragLeave = useCallback(() => setDragging(false), [])
  const handleChange    = useCallback((e) => {
    const files = Array.from(e.target.files)
    if (files.length) onUpload(files)
    e.target.value = ''
  }, [onUpload])

  const { status, message } = uploadState

  return (
    <motion.aside
      className="nexrag-sidebar glass"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div>
        <div className="nexrag-sidebar-title">Knowledge Base</div>
        <div className="nexrag-sidebar-sub">Upload documents to power the AI</div>
      </div>

      <hr className="nexrag-divider" />

      {/* Drop zone */}
      <div
        className={`nexrag-dropzone${dragging ? ' dragover' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload files"
      >
        <input
          ref={inputRef}
          type="file" multiple className="hidden"
          onChange={handleChange}
          accept=".pdf,.docx,.doc,.txt,.csv,.json,.jsonl,.md,.html,.htm,.sql,.yaml,.yml,.xml,.log,.py,.js,.ts"
        />
        <div className="nexrag-dropzone-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
            <path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
          </svg>
        </div>
        <div className="nexrag-drop-title">
          {dragging ? 'Drop to upload' : <>Drop files here<br /><span>or click to browse</span></>}
        </div>
        <div className="nexrag-drop-hint">PDF · DOCX · TXT · CSV · JSON · MD · HTML · SQL · YAML</div>
      </div>

      {/* Upload status */}
      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div
            className={`nexrag-status ${status}`}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            {status === 'uploading' && <div className="nexrag-spinner" />}
            {status === 'success' && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            )}
            {status === 'error' && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>
              </svg>
            )}
            <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loaded docs */}
      <div style={{display:'flex', flexDirection:'column', gap:'.5rem', flex:1, overflow:'hidden', minHeight:0}}>
        <div className="nexrag-kb-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
            <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
          </svg>
          Loaded Documents
        </div>
        <div className="nexrag-kb-list">
          <AnimatePresence initial={false}>
            {uploadedDocs.length === 0 ? (
              <div className="nexrag-kb-empty">No documents yet</div>
            ) : (
              uploadedDocs.map((doc, i) => (
                <motion.div
                  key={doc.name}
                  className="nexrag-kb-item"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <span className={badgeClass(doc.type)}>{doc.type}</span>
                  <span className="nexrag-kb-name" title={doc.name}>{doc.name}</span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}
