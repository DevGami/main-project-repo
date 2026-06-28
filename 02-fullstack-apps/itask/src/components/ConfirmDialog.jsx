import React from 'react'
import { IoWarning } from 'react-icons/io5'

const ConfirmDialog = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      {/* Overlay */}
      <div className='modal-overlay' style={{ position: 'absolute', inset: 0 }} onClick={onCancel}></div>

      {/* Modal */}
      <div className='modal-card' style={{ borderRadius: '20px', padding: '32px', maxWidth: '380px', width: '100%', position: 'relative' }}>
        {/* Icon */}
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <IoWarning style={{ fontSize: '24px', color: '#f87171' }} />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: '8px' }}>
          Delete Task?
        </h3>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: '28px', lineHeight: 1.6 }}>
          This action cannot be undone. The task will be permanently removed.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
              color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)',
              border: 'none', cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
              color: 'white', background: 'linear-gradient(135deg, #dc2626, #ef4444)',
              border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(239,68,68,0.25)',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
