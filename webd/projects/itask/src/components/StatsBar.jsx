import React from 'react'
import { IoCheckmarkDone, IoTime, IoList } from 'react-icons/io5'

const StatsBar = ({ todos }) => {
  const total = todos.length
  const completed = todos.filter(t => t.isCompleted).length
  const pending = total - completed
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)

  if (total === 0) return null

  return (
    <div>
      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
        <div className='stat-card' style={{ borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
            <IoList style={{ color: '#a78bfa', fontSize: '14px' }} />
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{total}</span>
        </div>

        <div className='stat-card' style={{ borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
            <IoCheckmarkDone style={{ color: '#4ade80', fontSize: '14px' }} />
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Done</span>
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#4ade80' }}>{completed}</span>
        </div>

        <div className='stat-card' style={{ borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
            <IoTime style={{ color: '#fbbf24', fontSize: '14px' }} />
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Left</span>
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#fbbf24' }}>{pending}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className='progress-track' style={{ flex: 1 }}>
          <div className='progress-fill' style={{ width: `${percentage}%` }}></div>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', minWidth: '40px', textAlign: 'right' }}>{percentage}%</span>
      </div>
    </div>
  )
}

export default StatsBar
