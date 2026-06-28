import React from 'react'
import { BsInbox } from 'react-icons/bs'
import { IoAdd } from 'react-icons/io5'

const EmptyState = ({ hasAnyTodos }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{
        width: '72px', height: '72px', borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.08))',
        border: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
      }}>
        <BsInbox style={{ fontSize: '28px', color: 'rgba(139,92,246,0.4)' }} />
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
        {hasAnyTodos ? 'All tasks completed! 🎉' : 'No tasks yet'}
      </h3>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', maxWidth: '280px', lineHeight: 1.6 }}>
        {hasAnyTodos
          ? 'Great job! Click "Showing completed" to see your finished tasks.'
          : 'Add your first task above to get started. Stay organized, stay productive!'
        }
      </p>
      {!hasAnyTodos && (
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(139,92,246,0.4)' }}>
          <IoAdd />
          <span>Type a task and press Enter or click Add</span>
        </div>
      )}
    </div>
  )
}

export default EmptyState
