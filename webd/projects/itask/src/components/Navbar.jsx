import React from 'react'
import { FaCheckDouble } from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi2'

const Navbar = () => {
  return (
    <nav className='navbar' style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(139,92,246,0.25)',
                animation: 'logoGlow 3s ease-in-out infinite',
              }}
            >
              <FaCheckDouble style={{ color: 'white', fontSize: '14px' }} />
            </div>
            <span className='bg-gradient-to-r from-violet-300 via-purple-200 to-indigo-300 bg-clip-text text-transparent'
              style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>
              iTask
            </span>
          </div>

          {/* Nav Links */}
          <ul style={{ display: 'flex', alignItems: 'center', gap: '4px', listStyle: 'none' }}>
            <li style={{
              padding: '8px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 500,
              color: 'rgba(255,255,255,0.9)', cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HiSparkles style={{ color: '#a78bfa' }} />
                Home
              </span>
            </li>
            <li
              style={{
                padding: '8px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 500,
                color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent' }}
            >
              Your Tasks
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
