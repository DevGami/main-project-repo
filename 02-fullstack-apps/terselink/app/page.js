"use client"

import localFont from "next/font/local";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Link as LinkIcon } from "lucide-react";

const poppins = localFont({
  src: "./fonts/Poppins-ExtraBold.ttf",
  variable: "--font-poppins",
  weight: "800",
});

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-slate-50 flex items-center justify-center pt-20">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-300/30 mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-300/30 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] rounded-full bg-pink-300/30 mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10 py-16 md:py-24">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-6 flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-purple-100 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-semibold text-purple-900">TerseLink is now live</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants} 
            className={`text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8 ${poppins.className}`}
          >
            Shorter links. <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500">
              Bigger impact.
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl leading-relaxed">
            Turn long, ugly URLs into clean, memorable links in seconds. Open-source, fast, and completely free to use.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row w-full sm:w-auto">
            <Link href="/shorten" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 transition-all"
              >
                Start Shortening
                <ArrowRight size={20} />
              </motion.button>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Built on Next.js 15 for instant redirects." },
              { icon: Shield, title: "Secure & Reliable", desc: "No tracking, pure open-source transparency." },
              { icon: LinkIcon, title: "Custom Aliases", desc: "Choose your own personalized link names." }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/60 backdrop-blur-lg border border-slate-100 p-6 rounded-3xl shadow-xl shadow-slate-200/40 text-left hover:-translate-y-1 transition-transform">
                <div className="bg-gradient-to-br from-purple-100 to-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-purple-700">
                  <feature.icon size={24} />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
