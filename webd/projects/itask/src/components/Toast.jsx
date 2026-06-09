import React, { useEffect, useState } from 'react'
import { IoCheckmarkCircle, IoTrash, IoCreate, IoInformationCircle } from 'react-icons/io5'

const icons = {
  success: { Icon: IoCheckmarkCircle, color: '#4ade80' },
  delete: { Icon: IoTrash, color: '#f87171' },
  edit: { Icon: IoCreate, color: '#fbbf24' },
  info: { Icon: IoInformationCircle, color: '#60a5fa' },
}

const borderColors = {
  success: '#22c55e',
  delete: '#ef4444',
  edit: '#f59e0b',
  info: '#3b82f6',
}

const Toast = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false)
  const { Icon, color } = icons[toast.type] || icons.info

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onRemove(toast.id), 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <div
      className={`toast-card ${isExiting ? 'toast-exit' : 'toast-enter'}`}
      style={{
        borderRadius: '12px', padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
        minWidth: '260px', maxWidth: '340px',
        borderLeft: `3px solid ${borderColors[toast.type] || borderColors.info}`,
      }}
    >
      <Icon style={{ fontSize: '18px', color, flexShrink: 0 }} />
      <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.8)', flex: 1 }}>{toast.message}</span>
    </div>
  )
}

const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 200, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

export default ToastContainer
