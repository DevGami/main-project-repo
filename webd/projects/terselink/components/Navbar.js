"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Link2 } from 'lucide-react'

function GithubIcon({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  )
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_PROFILE_URL || 'https://github.com/DevGami/main-project-repo/tree/main/webd/projects/terselink'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/70 backdrop-blur-md shadow-sm border-b border-purple-100/50' 
          : 'bg-transparent'
      }`}
      aria-label="Main navigation"
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-20'>
          
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all">
              <Link2 size={24} strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-900 to-indigo-800">
              TerseLink
            </span>
          </Link>

          <div className='hidden md:flex items-center space-x-8'>
            <Link className="text-slate-600 hover:text-purple-700 transition-colors font-semibold" href="/">Home</Link>
            <Link className="text-slate-600 hover:text-purple-700 transition-colors font-semibold" href="/about">About</Link>
            
            <Link href="/shorten">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-lg shadow-purple-500/30 px-6 py-2.5 font-bold text-sm transition-all'
              >
                Try Now
              </motion.button>
            </Link>
            
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open GitHub profile"
              className='bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg px-5 py-2.5 font-bold flex items-center gap-2 text-sm transition-all'
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
            >
              <GithubIcon size={18} />
              GitHub
            </motion.a>
          </div>

          <div className='flex items-center md:hidden'>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className='text-slate-800 hover:text-purple-600 focus:outline-none transition-colors'
              aria-expanded={isOpen}
              aria-label="Toggle navigation"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='md:hidden bg-white/95 backdrop-blur-xl border-b border-purple-100 overflow-hidden'
          >
            <div className="px-4 pt-2 pb-6 space-y-3">
              <Link onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-purple-50 hover:text-purple-700 transition-colors" href="/">Home</Link>
              <Link onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-purple-50 hover:text-purple-700 transition-colors" href="/about">About</Link>
              
              <div className="pt-4 flex flex-col space-y-3">
                <Link onClick={() => setIsOpen(false)} className='bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center rounded-xl px-4 py-3 font-bold shadow-md shadow-purple-500/20' href="/shorten">
                  Try Now
                </Link>
                <a
                  onClick={() => setIsOpen(false)}
                  aria-label="Open GitHub profile"
                  className='bg-slate-900 text-white text-center rounded-xl px-4 py-3 font-bold flex items-center justify-center gap-2'
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <GithubIcon size={20} />
                  GitHub
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
