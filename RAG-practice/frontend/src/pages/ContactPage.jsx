import React from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

const SOCIALS = [
  {
    key: 'github', name: 'GitHub', handle: '@DevGami',
    href: 'https://github.com/DevGami', cardClass: 'social-github',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
        <path d="M9 18c-4.51 2-5-2-7-2"/>
      </svg>
    ),
  },
  {
    key: 'linkedin', name: 'LinkedIn', handle: 'dev-gami',
    href: 'https://www.linkedin.com/in/dev-gami-598982298/', cardClass: 'social-linkedin',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    key: 'instagram', name: 'Instagram', handle: '@soundwavedev',
    href: 'https://instagram.com/soundwavedev', cardClass: 'social-insta',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    ),
  },
  {
    key: 'email', name: 'Email', handle: 'dgami2005@gmail.com',
    href: 'mailto:dgami2005@gmail.com', cardClass: 'social-email',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
  },
]

export default function ContactPage() {
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'var(--bg)' }}>
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />
      <Navbar />
      <div className="nexrag-contact-wrap">
        <motion.div
          className="nexrag-contact-card glass"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div className="nexrag-contact-eyebrow" initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:.1 }}>
            Get In Touch
          </motion.div>

          <motion.h1 className="nexrag-contact-heading" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }}>
            Let's Connect
          </motion.h1>

          <div className="nexrag-social-grid">
            {SOCIALS.map((s, i) => (
              <motion.a
                key={s.key}
                href={s.href}
                target={s.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className={`nexrag-social-card ${s.cardClass}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="nexrag-social-icon">{s.icon}</div>
                <div className="nexrag-social-name">{s.name}</div>
                <div className="nexrag-social-handle" title={s.handle}>{s.handle}</div>
              </motion.a>
            ))}
          </div>

          <motion.div className="nexrag-contact-footer" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.55 }}>
            Built with ❤️ using <span style={{color:'#334155'}}>FastAPI · FAISS · LangChain · Groq · React · Vite</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
