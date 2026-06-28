import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Navbar() {
  const { pathname } = useLocation()
  const isContact = pathname === '/contact'

  return (
    <nav className="nexrag-nav">
      <div className="nexrag-nav-inner">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Link to="/" className="nexrag-logo">
            <div className="nexrag-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
                <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
                <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
              </svg>
            </div>
            NexRAG
          </Link>
        </motion.div>

        {/* Links */}
        <motion.div
          className="nexrag-nav-links"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Link to="/" className={`nexrag-nav-link${!isContact ? ' active' : ''}`}>
            Knowledge Base
          </Link>
          <Link to="/contact" className={`nexrag-nav-link${isContact ? ' active' : ''}`}>
            Contact Me
          </Link>
        </motion.div>
      </div>
    </nav>
  )
}
