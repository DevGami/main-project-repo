"use client"

import { motion } from 'framer-motion'
import { Mail, Phone, Code2, Rocket, Heart } from 'lucide-react'

function InstagramIcon({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  )
}

function LinkedinIcon({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  )
}

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-slate-50 pt-24 pb-16 px-6 sm:px-12">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-300/20 mix-blend-multiply filter blur-[100px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-300/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto relative z-10"
      >
        {/* Header Card */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-t-3xl shadow-2xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 text-white/5">
            <Code2 size={200} />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
              About TerseLink
            </h1>
            <p className="text-purple-200 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              A lightning-fast, reliable, and beautifully designed URL shortener built for the modern web.
            </p>
          </div>
        </motion.div>
        
        {/* Content Card */}
        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-b-3xl shadow-xl border border-white/50 p-8 md:p-16">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* The Project */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-purple-700">
                <Rocket size={28} />
                <h2 className="text-2xl font-bold text-slate-800">The Project</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                TerseLink is designed to turn long, unwieldy URLs into concise, shareable links. 
                Built using the latest Next.js 15 App Router, React, Framer Motion, and MongoDB, it focuses on 
                delivering a seamless user experience without requiring an account. Features include 
                automatic or custom alias generation, rate limiting, and instant redirects.
              </p>
            </div>

            {/* The Creator */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-pink-600">
                <Heart size={28} />
                <h2 className="text-2xl font-bold text-slate-800">The Creator</h2>
              </div>
              
              <div className="bg-gradient-to-br from-slate-50 to-purple-50/50 border border-purple-100/50 rounded-2xl p-8 shadow-inner">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Dev Gami</h3>
                <p className="text-slate-600 mb-8 text-base">
                  Passionate full-stack developer dedicated to building visually stunning, high-performance web applications. Let's connect!
                </p>
                
                <div className="flex flex-col gap-4">
                  <a href="mailto:dgami2005@gmail.com" className="flex items-center gap-3 text-slate-700 hover:text-purple-700 transition-colors group">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 group-hover:border-purple-200 group-hover:bg-purple-50 transition-all">
                      <Mail size={20} className="text-purple-600" />
                    </div>
                    <span className="font-semibold">dgami2005@gmail.com</span>
                  </a>
                  
                  <a href="tel:+916353211193" className="flex items-center gap-3 text-slate-700 hover:text-purple-700 transition-colors group">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 group-hover:border-purple-200 group-hover:bg-purple-50 transition-all">
                      <Phone size={20} className="text-purple-600" />
                    </div>
                    <span className="font-semibold">+91 6353211193</span>
                  </a>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-purple-100/60">
                  <motion.a 
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    href="https://www.instagram.com/soundwavedev?igsh=MTdzaDlzMm8yem9tag=="
                    target="_blank"
                    rel="noreferrer"
                    className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-pink-500/30 flex items-center justify-center"
                  >
                    <InstagramIcon size={26} />
                  </motion.a>
                  
                  <motion.a 
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    href="https://www.linkedin.com/in/dev-gami-598982298?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#0A66C2] p-2 rounded-xl text-white shadow-lg shadow-blue-500/30 flex items-center justify-center"
                  >
                    <LinkedinIcon size={26} />
                  </motion.a>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </main>
  )
}
